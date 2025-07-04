#!/bin/bash

# Setup and verify cron jobs for production environment
# Run this script after each production deployment

set -e

echo "🔧 Setting up production cron jobs..."

# Check if we're in a Docker environment
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    DOCKER_CMD=""
else
    echo "🐳 Running from host, using Docker commands"
    DOCKER_CMD="docker compose -f docker-compose.prod.yml exec backend"
fi

# Setup cron jobs
echo "⚙️  Installing cron jobs..."
$DOCKER_CMD ./scripts/setup-cron.sh

# Verify cron service is running
echo "🔍 Verifying cron service..."
$DOCKER_CMD sh -c "if command -v service >/dev/null 2>&1; then service cron status; else ps aux | grep cron | grep -v grep; fi"

# Check installed cron jobs
echo "📅 Checking installed cron jobs..."
$DOCKER_CMD crontab -l

# Test late fee processing script
echo "🧪 Testing late fee processing script..."
$DOCKER_CMD node scripts/process-late-fees.js

# Check if log directory exists
echo "📁 Verifying log directory..."
$DOCKER_CMD ls -la /app/logs/cron/ || (echo "Creating log directory..." && $DOCKER_CMD mkdir -p /app/logs/cron)

# Run health check
echo "🏥 Running health check..."
$DOCKER_CMD node scripts/enhanced-cron-healthcheck.js || echo "⚠️  Health check failed, but continuing..."

echo "✅ Production cron setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Monitor logs at: /app/logs/cron/late-fees.log"
echo "   2. Check admin dashboard for late fee processing status"
echo "   3. Verify processing runs at 1:00 AM daily"
echo ""
echo "🔍 To check status manually:"
echo "   docker compose -f docker-compose.prod.yml exec backend ./scripts/check-cron-status.sh" 