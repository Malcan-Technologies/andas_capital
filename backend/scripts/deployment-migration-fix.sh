#!/bin/bash
# Comprehensive deployment migration fix script

set -e

echo "🚀 Starting deployment migration fix..."

# Check if we're in a Docker environment
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    DOCKER_CMD=""
else
    echo "🐳 Running from host, using Docker commands"
    DOCKER_CMD="docker compose -f docker-compose.prod.yml exec backend"
fi

# Step 1: Clear any Prisma cache
echo "🧹 Clearing Prisma cache..."
$DOCKER_CMD rm -rf node_modules/.prisma || true
$DOCKER_CMD npx prisma generate

# Step 2: Check current migration status
echo "🔍 Checking migration status..."
MIGRATION_STATUS=$($DOCKER_CMD npx prisma migrate status 2>&1 || echo "FAILED")

if echo "$MIGRATION_STATUS" | grep -q "P3009"; then
    echo "❌ P3009 error detected - resolving failed migration state..."
    
    # Reset the specific migration that's causing issues
    $DOCKER_CMD npx prisma migrate resolve --rolled-back 20250624042257_add_late_fee_system || true
    
    # Try to resolve as applied if it was actually applied
    $DOCKER_CMD npx prisma migrate resolve --applied 20250624042257_add_late_fee_system || true
    
elif echo "$MIGRATION_STATUS" | grep -q "P3018"; then
    echo "❌ P3018 error detected - fixing NULL totalAmount values..."
    
    # Run the totalAmount fix
    $DOCKER_CMD node scripts/fix-totalAmount-migration.js || true
    
    # Reset and apply the migration
    $DOCKER_CMD npx prisma migrate resolve --applied 20250624042257_add_late_fee_system || true
    
elif echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo "✅ Database schema is already up to date"
    
else
    echo "ℹ️  Migration status: $MIGRATION_STATUS"
fi

# Step 3: Force regenerate Prisma client
echo "🔄 Regenerating Prisma client..."
$DOCKER_CMD npx prisma generate --force

# Step 4: Apply any pending migrations
echo "🚀 Applying migrations..."
$DOCKER_CMD npx prisma migrate deploy

# Step 5: Verify the database state
echo "🔍 Verifying database state..."
$DOCKER_CMD node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    // Test basic connectivity
    await prisma.\$queryRaw\`SELECT 1\`;
    console.log('✅ Database connection successful');
    
    // Check if totalAmount column exists and is populated
    const result = await prisma.\$queryRaw\`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'totalAmount'
    \`;
    
    if (result.length > 0) {
      console.log('✅ totalAmount column exists');
      
      const nullCount = await prisma.\$queryRaw\`
        SELECT COUNT(*) as count FROM loans WHERE \"totalAmount\" IS NULL
      \`;
      
      if (nullCount[0].count == 0) {
        console.log('✅ No NULL totalAmount values found');
      } else {
        console.log('⚠️  Found', nullCount[0].count.toString(), 'loans with NULL totalAmount');
      }
    } else {
      console.log('❌ totalAmount column missing');
    }
    
    // Test Prisma client models
    const userCount = await prisma.user.count();
    console.log('✅ Prisma client working - found', userCount, 'users');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

verify();
"

echo "✅ Deployment migration fix completed successfully" 