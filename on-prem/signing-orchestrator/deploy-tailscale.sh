#!/bin/bash

# Safe Deployment Script for Signing Orchestrator via Tailscale
# Deploys only source code changes, preserves all data

set -e

# Configuration
REMOTE_HOST="admin-kapital@100.76.8.62"
REMOTE_DIR="/home/admin-kapital/signing-orchestrator"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deploying Signing Orchestrator (Tailscale)"
echo "=============================================="
echo "Remote: $REMOTE_HOST"
echo "Remote Dir: $REMOTE_DIR"
echo ""

# Sync only source code and config (preserve data, logs, node_modules)
echo "📦 Syncing source files..."
rsync -avz --progress \
    --exclude 'node_modules/' \
    --exclude 'dist/' \
    --exclude 'logs/' \
    --exclude 'data/' \
    --exclude 'original-files/' \
    --exclude 'signed-files/' \
    --exclude 'stamped-files/' \
    --exclude '.git/' \
    --exclude '.env' \
    --exclude 'env.production' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude '*.tar.gz' \
    "$LOCAL_DIR/src/" "$REMOTE_HOST:$REMOTE_DIR/src/"

echo ""
echo "📄 Syncing package files..."
rsync -avz \
    "$LOCAL_DIR/package.json" \
    "$LOCAL_DIR/package-lock.json" \
    "$LOCAL_DIR/tsconfig.json" \
    "$REMOTE_HOST:$REMOTE_DIR/"

echo ""
echo "🔨 Building and restarting on remote server..."
ssh $REMOTE_HOST << 'ENDSSH'
    cd /home/admin-kapital/signing-orchestrator
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "🔨 Building TypeScript..."
    npm run build
    
    echo "🔄 Restarting signing orchestrator container..."
    docker-compose restart signing-orchestrator
    
    echo ""
    echo "⏳ Waiting for service to start..."
    sleep 5
    
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    
    echo ""
    echo "📝 Recent Logs (last 20 lines):"
    docker logs signing-orchestrator --tail 20
    
    echo ""
    echo "✅ Deployment completed successfully!"
ENDSSH

echo ""
echo "🎉 Deployment finished!"
echo ""
echo "To view logs: ssh $REMOTE_HOST 'docker logs signing-orchestrator -f'"
echo "To check status: ssh $REMOTE_HOST 'cd /home/admin-kapital/signing-orchestrator && docker-compose ps'"

