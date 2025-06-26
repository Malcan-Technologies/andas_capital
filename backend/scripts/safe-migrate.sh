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
