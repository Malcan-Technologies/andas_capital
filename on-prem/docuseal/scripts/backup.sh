#!/bin/bash

# DocuSeal Database Backup Script
# Usage: ./scripts/backup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/postgres/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="docuseal_backup_$DATE.sql"

echo "🗄️  Starting DocuSeal database backup..."

# Change to project directory
cd "$PROJECT_DIR"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker compose ps docuseal-postgres | grep -q "Up"; then
    echo "❌ DocuSeal PostgreSQL container is not running"
    exit 1
fi

# Create database backup
echo "📦 Creating database backup: $BACKUP_FILE"
docker compose exec -T docuseal-postgres pg_dump -U docuseal -d docuseal --clean --if-exists > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"
COMPRESSED_FILE="$BACKUP_FILE.gz"

# Check backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
echo "✅ Backup completed: $COMPRESSED_FILE (Size: $BACKUP_SIZE)"

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "docuseal_backup_*.sql.gz" -mtime +7 -delete

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lah "$BACKUP_DIR"/docuseal_backup_*.sql.gz | tail -5

# Optional: Copy to NAS or external storage
# if [ -d "/path/to/nas/backup/location" ]; then
#     echo "📤 Copying backup to NAS..."
#     cp "$BACKUP_DIR/$COMPRESSED_FILE" "/path/to/nas/backup/location/"
#     echo "✅ Backup copied to NAS"
# fi

echo ""
echo "🎉 Backup process completed successfully!"
echo "   Backup file: $BACKUP_DIR/$COMPRESSED_FILE"
echo "   Size: $BACKUP_SIZE"
