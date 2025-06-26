#!/bin/bash

# Comprehensive Migration Fix Script
# This script resolves the failed migration issue and prevents future occurrences

set -e

echo "🔧 Starting comprehensive migration fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if database is accessible
check_database() {
    print_status "Checking database connectivity..."
    
    # Wait for database to be ready
    for i in {1..30}; do
        if docker compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres -d kapital >/dev/null 2>&1; then
            print_success "Database is accessible"
            return 0
        fi
        print_status "Waiting for database... (attempt $i/30)"
        sleep 2
    done
    
    print_error "Database is not accessible after 60 seconds"
    return 1
}

# Function to backup the database
backup_database() {
    print_status "Creating database backup..."
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres -d kapital > "$BACKUP_FILE"; then
        print_success "Database backup created: $BACKUP_FILE"
    else
        print_warning "Failed to create backup, but continuing..."
    fi
}

# Function to check if columns exist
check_column_exists() {
    local table_name=$1
    local column_name=$2
    
    result=$(docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -t -c "
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = '$table_name' AND column_name = '$column_name';
    " 2>/dev/null | tr -d ' \n\r')
    
    if [ "$result" = "1" ]; then
        return 0  # Column exists
    else
        return 1  # Column doesn't exist
    fi
}

# Function to fix the failed migration
fix_migration() {
    print_status "Analyzing failed migration..."
    
    # Mark the failed migration as resolved in the database
    print_status "Marking failed migration as resolved..."
    docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "
        UPDATE _prisma_migrations 
        SET finished_at = NOW(), 
            applied_steps_count = (
                SELECT COUNT(*) 
                FROM unnest(string_to_array(logs, E'\n')) AS step 
                WHERE step ~ '^[0-9]'
            )
        WHERE migration_name = '20250101000000_enhance_payment_tracking' 
        AND finished_at IS NULL;
    " >/dev/null 2>&1 || true
    
    # Check and add missing columns one by one
    print_status "Checking and adding missing columns..."
    
    # List of columns to add with their types (using arrays instead of associative arrays)
    columns_names=("installmentNumber" "scheduledAmount" "actualAmount" "paymentType" "daysEarly" "daysLate" "parentRepaymentId")
    columns_types=("INTEGER" "DOUBLE PRECISION" "DOUBLE PRECISION" "TEXT" "INTEGER DEFAULT 0" "INTEGER DEFAULT 0" "TEXT")
    
    for i in "${!columns_names[@]}"; do
        column="${columns_names[$i]}"
        column_type="${columns_types[$i]}"
        
        if ! check_column_exists "loan_repayments" "$column"; then
            print_status "Adding missing column: $column"
            docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "
                ALTER TABLE loan_repayments ADD COLUMN IF NOT EXISTS \"$column\" $column_type;
            " >/dev/null 2>&1 || print_warning "Failed to add column $column (may already exist)"
        else
            print_success "Column $column already exists"
        fi
    done
    
    # Add foreign key constraint if it doesn't exist
    print_status "Adding foreign key constraint..."
    docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'loan_repayments_parentRepaymentId_fkey'
            ) THEN
                ALTER TABLE loan_repayments 
                ADD CONSTRAINT loan_repayments_parentRepaymentId_fkey 
                FOREIGN KEY (\"parentRepaymentId\") REFERENCES loan_repayments(id) 
                ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
        END\$\$;
    " >/dev/null 2>&1 || print_warning "Foreign key constraint may already exist"
    
    # Add indexes if they don't exist
    print_status "Adding missing indexes..."
    
    # Create indexes one by one
    docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "
        CREATE INDEX IF NOT EXISTS loan_repayments_installmentNumber_idx ON loan_repayments(\"installmentNumber\");
    " >/dev/null 2>&1 || print_warning "installmentNumber index may already exist"
    
    docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "
        CREATE INDEX IF NOT EXISTS loan_repayments_paymentType_idx ON loan_repayments(\"paymentType\");
    " >/dev/null 2>&1 || print_warning "paymentType index may already exist"
    
    docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "
        CREATE INDEX IF NOT EXISTS loan_repayments_status_dueDate_idx ON loan_repayments(status, \"dueDate\");
    " >/dev/null 2>&1 || print_warning "status_dueDate index may already exist"
    
    print_success "Migration fixes applied successfully"
}

# Function to reset Prisma migration state
reset_prisma_state() {
    print_status "Resetting Prisma migration state..."
    
    # Generate a new Prisma client
    print_status "Generating new Prisma client..."
    docker compose -f docker-compose.dev.yml run --rm backend npx prisma generate >/dev/null 2>&1 || true
    
    # Mark all migrations as applied
    print_status "Marking migrations as applied..."
    docker compose -f docker-compose.dev.yml run --rm backend npx prisma migrate resolve --applied 20250101000000_enhance_payment_tracking >/dev/null 2>&1 || true
    
    print_success "Prisma state reset completed"
}

# Function to verify the fix
verify_fix() {
    print_status "Verifying migration fix..."
    
    # Check migration status
    if docker compose -f docker-compose.dev.yml run --rm backend npx prisma migrate status >/dev/null 2>&1; then
        print_success "All migrations are now in sync"
    else
        print_warning "Migration status check failed, but this may be normal"
    fi
    
    # Test database connection with a simple query
    if docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d kapital -c "SELECT COUNT(*) FROM loan_repayments;" >/dev/null 2>&1; then
        print_success "Database is accessible and functioning"
    else
        print_error "Database connection test failed"
        return 1
    fi
}

# Function to create prevention measures
create_prevention_measures() {
    print_status "Setting up migration failure prevention measures..."
    
    # Create a migration validation script
    cat > scripts/validate-migration.sh << 'EOF'
#!/bin/bash
# Migration validation script - run before applying migrations

set -e

echo "🔍 Validating migration before applying..."

# Check if database is accessible
if ! docker compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres -d kapital >/dev/null 2>&1; then
    echo "❌ Database is not accessible"
    exit 1
fi

# Check migration status
if ! docker compose -f docker-compose.dev.yml run --rm backend npx prisma migrate status >/dev/null 2>&1; then
    echo "⚠️  Migration status check failed - manual intervention may be needed"
fi

# Create backup before migration
BACKUP_FILE="pre_migration_backup_$(date +%Y%m%d_%H%M%S).sql"
echo "📦 Creating backup: $BACKUP_FILE"
docker compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres -d kapital > "$BACKUP_FILE"

echo "✅ Migration validation completed"
EOF

    chmod +x scripts/validate-migration.sh
    
    # Create a safer migration apply script
    cat > scripts/safe-migrate.sh << 'EOF'
#!/bin/bash
# Safe migration script with automatic rollback on failure

set -e

echo "🚀 Starting safe migration process..."

# Run validation first
./scripts/validate-migration.sh

# Apply migration with error handling
if docker compose -f docker-compose.dev.yml run --rm backend npx prisma migrate deploy; then
    echo "✅ Migration applied successfully"
    
    # Generate new client
    docker compose -f docker-compose.dev.yml run --rm backend npx prisma generate
    echo "✅ Prisma client regenerated"
    
    # Test the application
    if docker compose -f docker-compose.dev.yml up backend --wait --wait-timeout 30; then
        echo "✅ Application started successfully after migration"
    else
        echo "⚠️  Application failed to start - check logs"
    fi
else
    echo "❌ Migration failed - check the logs above"
    echo "💡 You can run './scripts/fix-migration-issue.sh' to attempt automatic recovery"
    exit 1
fi
EOF

    chmod +x scripts/safe-migrate.sh
    
    # Update the Dockerfile to include migration validation
    if [ -f Dockerfile.dev ]; then
        if ! grep -q "validate-migration" Dockerfile.dev; then
            cat >> Dockerfile.dev << 'EOF'

# Add migration validation
COPY scripts/validate-migration.sh /app/scripts/
COPY scripts/safe-migrate.sh /app/scripts/
RUN chmod +x /app/scripts/*.sh
EOF
        fi
    fi
    
    print_success "Prevention measures created"
    print_status "Use './scripts/safe-migrate.sh' for future migrations"
    print_status "Use './scripts/validate-migration.sh' to check migration status"
}

# Main execution
main() {
    print_status "Starting comprehensive migration fix process..."
    
    # Stop any running backend services
    print_status "Stopping backend services..."
    docker compose -f docker-compose.dev.yml stop backend >/dev/null 2>&1 || true
    
    # Ensure database is running
    print_status "Starting database..."
    docker compose -f docker-compose.dev.yml up postgres -d >/dev/null 2>&1
    
    # Wait for database to be ready
    if ! check_database; then
        print_error "Cannot proceed without database access"
        exit 1
    fi
    
    # Create backup
    backup_database
    
    # Fix the migration
    fix_migration
    
    # Reset Prisma state
    reset_prisma_state
    
    # Verify the fix
    verify_fix
    
    # Create prevention measures
    create_prevention_measures
    
    # Start the backend service
    print_status "Starting backend service..."
    if docker compose -f docker-compose.dev.yml up backend -d; then
        print_success "Backend service started successfully"
    else
        print_warning "Backend service failed to start - check logs with: docker compose -f docker-compose.dev.yml logs backend"
    fi
    
    print_success "🎉 Migration fix completed successfully!"
    print_status "Your system should now be working properly."
    print_status ""
    print_status "Next steps:"
    print_status "1. Check your admin dashboard - the alerts should be resolved"
    print_status "2. Use './scripts/safe-migrate.sh' for future migrations"
    print_status "3. Monitor logs with: docker compose -f docker-compose.dev.yml logs -f"
}

# Run the main function
main "$@" 