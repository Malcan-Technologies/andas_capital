#!/bin/bash

# DocuSeal Database Restore Script
# Usage: ./scripts/restore.sh <backup_file>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/postgres/backups"

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lah "$BACKUP_DIR"/docuseal_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    echo "   Looked in: $BACKUP_DIR/$BACKUP_FILE"
    echo "   And: $BACKUP_FILE"
    exit 1
fi

# Determine full path to backup file
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
else
    FULL_BACKUP_PATH="$BACKUP_FILE"
fi

echo "🔄 Starting DocuSeal database restore..."
echo "   Backup file: $FULL_BACKUP_PATH"

# Change to project directory
cd "$PROJECT_DIR"

# Check if container is running
if ! docker compose ps docuseal-postgres | grep -q "Up"; then
    echo "❌ DocuSeal PostgreSQL container is not running"
    echo "   Start it with: docker compose up -d docuseal-postgres"
    exit 1
fi

# Warning prompt
echo ""
echo "⚠️  WARNING: This will completely replace the current DocuSeal database!"
echo "   All existing data will be lost."
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Stop DocuSeal app to prevent database access during restore
echo "🛑 Stopping DocuSeal application..."
docker compose stop docuseal

# Create a safety backup before restore
echo "💾 Creating safety backup before restore..."
SAFETY_BACKUP="docuseal_safety_backup_$(date +%Y%m%d_%H%M%S).sql"
docker compose exec -T docuseal-postgres pg_dump -U docuseal -d docuseal --clean --if-exists > "$BACKUP_DIR/$SAFETY_BACKUP"
gzip "$BACKUP_DIR/$SAFETY_BACKUP"
echo "✅ Safety backup created: $SAFETY_BACKUP.gz"

# Restore database
echo "🔄 Restoring database from backup..."

if [[ "$FULL_BACKUP_PATH" == *.gz ]]; then
    echo "   Decompressing and restoring compressed backup..."
    gunzip -c "$FULL_BACKUP_PATH" | docker compose exec -T docuseal-postgres psql -U docuseal -d docuseal
else
    echo "   Restoring uncompressed backup..."
    cat "$FULL_BACKUP_PATH" | docker compose exec -T docuseal-postgres psql -U docuseal -d docuseal
fi

# Start DocuSeal app
echo "🚀 Starting DocuSeal application..."
docker compose start docuseal

# Wait for DocuSeal to be ready
echo "⏳ Waiting for DocuSeal to be ready..."
timeout 60s bash -c 'until curl -f http://localhost:3001/health >/dev/null 2>&1; do sleep 5; done'

# Verify restore
echo "🔍 Verifying restore..."
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ DocuSeal is responding after restore"
else
    echo "❌ DocuSeal health check failed after restore"
    echo "   Check logs: docker compose logs docuseal"
fi

echo ""
echo "🎉 Database restore completed successfully!"
echo "   Restored from: $FULL_BACKUP_PATH"
echo "   Safety backup: $BACKUP_DIR/$SAFETY_BACKUP.gz"
echo ""
echo "🌐 DocuSeal should be accessible at:"
echo "   Direct: http://localhost:3001"
echo "   Proxy:  http://localhost:8080"
