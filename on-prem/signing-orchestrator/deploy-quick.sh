#!/bin/bash

# Quick Deployment Script for Signing Orchestrator
# For rapid development iterations

set -e

# Configuration
REMOTE_HOST="210.186.80.101"
REMOTE_PORT="2222"
REMOTE_USER="admin-kapital"
REMOTE_DIR="/home/admin-kapital/signing-orchestrator"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Quick Deploy: Signing Orchestrator"
echo "===================================="

# Quick sync (only changed files)
echo "📦 Syncing files..."
rsync -avz --delete \
    --exclude 'node_modules/' \
    --exclude 'dist/' \
    --exclude 'logs/' \
    --exclude 'data/' \
    --exclude '.git/' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    -e "ssh -p $REMOTE_PORT" \
    "$LOCAL_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

# Quick restart
echo "🔄 Restarting containers..."
ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST << 'EOF'
    cd /home/admin-kapital/signing-orchestrator
    docker-compose build --no-cache signing-orchestrator
    docker-compose up -d
    sleep 5
    echo "✅ Quick deploy completed"
    docker-compose ps
EOF

echo "🎉 Quick deployment finished!"
