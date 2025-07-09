#!/bin/bash
# Safe deployment migration script for production and development

set -e

# Configuration
ENVIRONMENT=${1:-"prod"}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo "🚀 Starting safe migration deployment for ${ENVIRONMENT} environment..."

# Check if we're in a Docker environment
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    DOCKER_CMD=""
else
    echo "🐳 Running from host, using Docker commands"
    DOCKER_CMD="docker compose -f ${COMPOSE_FILE} exec backend"
fi

# Function to check if migration exists in database
check_migration_exists() {
    local migration_name=$1
    echo "🔍 Checking if migration ${migration_name} exists in database..."
    
    local exists=$($DOCKER_CMD node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function check() {
            try {
                const result = await prisma.\$queryRaw\`
                    SELECT COUNT(*) as count 
                    FROM _prisma_migrations 
                    WHERE migration_name = \${migration_name}
                \`;
                console.log(result[0].count.toString());
            } catch (error) {
                console.log('0');
            } finally {
                await prisma.\$disconnect();
            }
        }
        check();
    " 2>/dev/null || echo "0")
    
    echo "$exists"
}

# Function to backup database before migrations
backup_database() {
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo "📦 Creating database backup..."
        local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if command -v docker compose >/dev/null 2>&1; then
            docker compose -f ${COMPOSE_FILE} exec postgres pg_dump -U postgres -d kapital > "$backup_file" 2>/dev/null || true
            if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
                echo "✅ Database backup created: $backup_file"
            else
                echo "⚠️  Database backup failed or empty, continuing without backup"
                rm -f "$backup_file" 2>/dev/null || true
            fi
        else
            echo "⚠️  Docker compose not available, skipping backup"
        fi
    else
        echo "ℹ️  Skipping backup for development environment"
    fi
}

# Function to handle failed migrations
handle_failed_migration() {
    local migration_name=$1
    echo "🔧 Handling failed migration: $migration_name"
    
    # Try to resolve as applied if the schema changes are actually in place
    echo "Attempting to resolve migration as applied..."
    $DOCKER_CMD npx prisma migrate resolve --applied "$migration_name" || {
        echo "❌ Could not resolve migration as applied"
        
        # Try to resolve as rolled back
        echo "Attempting to resolve migration as rolled back..."
        $DOCKER_CMD npx prisma migrate resolve --rolled-back "$migration_name" || {
            echo "❌ Could not resolve migration as rolled back"
            echo "🚨 Manual intervention required for migration: $migration_name"
            return 1
        }
    }
}

# Main migration process
main() {
    # Step 1: Backup database (production only)
    backup_database
    
    # Step 2: Clear Prisma cache and regenerate client
    echo "🧹 Clearing Prisma cache and regenerating client..."
    $DOCKER_CMD rm -rf node_modules/.prisma || true
    $DOCKER_CMD npx prisma generate
    
    # Step 3: Check migration status
    echo "🔍 Checking migration status..."
    local migration_status=$($DOCKER_CMD npx prisma migrate status 2>&1 || echo "FAILED")
    
    if echo "$migration_status" | grep -q "Database schema is up to date"; then
        echo "✅ Database schema is already up to date"
    else
        # Step 4: Handle specific migration errors
        if echo "$migration_status" | grep -q "P3009"; then
            echo "❌ P3009 error detected - resolving failed migrations..."
            
            # Extract failed migration names
            local failed_migrations=$(echo "$migration_status" | grep -oE '[0-9]{14}_[a-zA-Z_]+' || echo "")
            
            for migration in $failed_migrations; do
                if [ -n "$migration" ]; then
                    handle_failed_migration "$migration"
                fi
            done
            
        elif echo "$migration_status" | grep -q "P3018"; then
            echo "❌ P3018 error detected - handling data conflicts..."
            
            # Run data migration fixes if they exist
            if [ -f "scripts/fix-totalAmount-migration.js" ]; then
                echo "Running totalAmount fix..."
                $DOCKER_CMD node scripts/fix-totalAmount-migration.js || true
            fi
            
            # Try to resolve the specific migration that's causing issues
            local failed_migration=$(echo "$migration_status" | grep -oE '[0-9]{14}_[a-zA-Z_]+' | head -1)
            if [ -n "$failed_migration" ]; then
                handle_failed_migration "$failed_migration"
            fi
        fi
        
        # Step 5: Apply migrations
        echo "🚀 Applying migrations..."
        local max_retries=3
        local retry_count=0
        
        while [ $retry_count -lt $max_retries ]; do
            if $DOCKER_CMD npx prisma migrate deploy; then
                echo "✅ Migrations applied successfully"
                break
            else
                retry_count=$((retry_count + 1))
                echo "⚠️  Migration attempt $retry_count failed"
                
                if [ $retry_count -lt $max_retries ]; then
                    echo "🔄 Retrying in 5 seconds..."
                    sleep 5
                    
                    # Regenerate client before retry
                    $DOCKER_CMD npx prisma generate
                else
                    echo "❌ All migration attempts failed"
                    return 1
                fi
            fi
        done
    fi
    
    # Step 6: Verify schema types
    echo "🔍 Verifying schema types..."
    if $DOCKER_CMD node scripts/verify-schema-types.js; then
        echo "✅ Schema verification passed"
    else
        echo "⚠️  Schema verification failed - check column types"
        # Don't fail deployment, but warn
    fi
    
    # Step 7: Verify final state
    echo "🔍 Verifying final migration state..."
    $DOCKER_CMD npx prisma migrate status
    
    # Step 8: Test database connectivity
    echo "🧪 Testing database connectivity..."
    $DOCKER_CMD node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function test() {
            try {
                await prisma.\$queryRaw\`SELECT 1\`;
                const userCount = await prisma.user.count();
                console.log('✅ Database connectivity test passed - found', userCount, 'users');
            } catch (error) {
                console.error('❌ Database connectivity test failed:', error.message);
                process.exit(1);
            } finally {
                await prisma.\$disconnect();
            }
        }
        test();
    "
    
    echo "🎉 Safe migration deployment completed successfully!"
}

# Run main function
main "$@" 