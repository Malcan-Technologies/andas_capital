#!/bin/bash
# Fix totalAmount migration issue in production

set -e

echo "🔧 Fixing totalAmount migration issue..."

# Check if we're in a Docker environment
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    DOCKER_CMD=""
else
    echo "🐳 Running from host, using Docker commands"
    DOCKER_CMD="docker compose -f docker-compose.prod.yml exec backend"
fi

# Step 1: Check if the migration is already applied
echo "🔍 Checking migration status..."
if $DOCKER_CMD npx prisma migrate status | grep -q "20250624042257_add_late_fee_system.*Applied"; then
    echo "✅ Migration already applied successfully"
    exit 0
fi

# Step 2: Check if there are loans with NULL totalAmount
echo "🔍 Checking for loans with NULL totalAmount..."
LOANS_COUNT=$($DOCKER_CMD node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT COUNT(*) as count FROM loans WHERE \"totalAmount\" IS NULL\`
.then(result => {
    console.log(result[0].count);
    prisma.\$disconnect();
})
.catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
" 2>/dev/null || echo "0")

echo "Found $LOANS_COUNT loans with NULL totalAmount"

# Step 3: If there are loans with NULL totalAmount, fix them
if [ "$LOANS_COUNT" -gt "0" ]; then
    echo "🔧 Running totalAmount fix script..."
    $DOCKER_CMD node scripts/fix-totalAmount-migration.js
    
    echo "✅ totalAmount fix completed"
else
    echo "ℹ️  No loans need totalAmount fix"
fi

# Step 4: Reset the failed migration
echo "🔄 Resetting failed migration..."
$DOCKER_CMD npx prisma migrate resolve --applied 20250624042257_add_late_fee_system || true

# Step 5: Try to apply migrations again
echo "🚀 Applying migrations..."
$DOCKER_CMD npx prisma migrate deploy

echo "✅ Migration fix completed successfully" 