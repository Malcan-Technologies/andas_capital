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
