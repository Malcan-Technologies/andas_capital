#!/bin/bash

# Migrate old PDF files from host directories to Docker volumes
# This fixes the issue where older loans can't download files

echo "🔄 Migrating old PDF files to Docker volumes..."

# Check if signing orchestrator is running
if ! docker ps | grep -q "signing-orchestrator"; then
    echo "❌ Signing orchestrator is not running"
    exit 1
fi

# Migrate signed files
echo "📁 Migrating signed PDF files..."
SIGNED_COUNT=0
if [ -d "./signed-files" ] && [ "$(ls -A ./signed-files)" ]; then
    for file in ./signed-files/*.pdf; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  Copying: $filename"
            docker cp "$file" signing-orchestrator:/data/signed/
            ((SIGNED_COUNT++))
        fi
    done
    echo "✅ Migrated $SIGNED_COUNT signed files"
else
    echo "ℹ️  No signed files to migrate"
fi

# Migrate stamped files  
echo "📁 Migrating stamped PDF files..."
STAMPED_COUNT=0
if [ -d "./stamped-files" ] && [ "$(ls -A ./stamped-files)" ]; then
    for file in ./stamped-files/*.pdf; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  Copying: $filename"
            docker cp "$file" signing-orchestrator:/data/stamped/
            ((STAMPED_COUNT++))
        fi
    done
    echo "✅ Migrated $STAMPED_COUNT stamped files"
else
    echo "ℹ️  No stamped files to migrate"
fi

# Set proper ownership inside container
echo "🔧 Setting proper file ownership..."
docker exec signing-orchestrator chown -R orchestrator:nodejs /data/signed/
docker exec signing-orchestrator chown -R orchestrator:nodejs /data/stamped/

# Verify migration
echo "🧪 Verifying migration..."
CONTAINER_SIGNED=$(docker exec signing-orchestrator ls -1 /data/signed/*.pdf 2>/dev/null | wc -l)
CONTAINER_STAMPED=$(docker exec signing-orchestrator ls -1 /data/stamped/*.pdf 2>/dev/null | wc -l)

echo "📊 Migration Summary:"
echo "  - Signed files in container: $CONTAINER_SIGNED"
echo "  - Stamped files in container: $CONTAINER_STAMPED"

# Test a specific old loan
echo "🧪 Testing old loan download..."
OLD_LOAN="cmfqjbsn80001kizmjj0tdpif"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4010/api/signed/$OLD_LOAN/download" -H "X-API-Key: dev-api-key")

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Old loan download test: SUCCESS (HTTP $RESPONSE)"
    echo "🎉 Migration completed successfully!"
else
    echo "❌ Old loan download test: FAILED (HTTP $RESPONSE)"
    echo "🔍 Check logs for more details"
fi

echo ""
echo "📋 Next steps:"
echo "  1. Test downloading older agreements in the admin/user interface"
echo "  2. If successful, consider cleaning up host directories"
echo "  3. Update deployment scripts to prevent this issue in future"
