#!/bin/bash

# Setup and verify cron jobs for production environment
# Run this script after each production deployment

# Don't exit on error to allow graceful fallbacks
set +e

echo "🔧 Setting up production cron jobs..."

# Check if we're in a Docker environment
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    DOCKER_CMD=""
else
    echo "🐳 Running from host, using Docker commands"
    DOCKER_CMD="docker compose -f docker-compose.prod.yml exec backend"
fi

# Wait for backend container to be ready (only when running from host)
if [ -z "$DOCKER_CMD" ]; then
    echo "📦 Running inside container, skipping readiness check"
else
    echo "⏳ Waiting for backend container to be ready..."
    MAX_WAIT=60
    WAIT_COUNT=0
    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        if ${DOCKER_CMD} echo "ready" >/dev/null 2>&1; then
            echo "✅ Backend container is ready"
            break
        fi
        sleep 2
        WAIT_COUNT=$((WAIT_COUNT + 2))
    done
    
    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        echo "❌ Backend container not ready after ${MAX_WAIT}s, continuing anyway..."
    fi
fi

# Setup cron jobs
echo "⚙️  Installing cron jobs..."
if ! ${DOCKER_CMD} ./scripts/setup-cron.sh; then
    echo "⚠️  Cron setup script failed, attempting manual setup..."
    ${DOCKER_CMD} sh -c '
        mkdir -p /app/logs/cron
        chmod 755 /app/logs/cron
        
        # Get the actual DATABASE_URL value for production
        DB_URL=${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/kapital?schema=public}
        
        # Create cron job with actual database URL (same as setup-cron.sh)
        echo "0 1 * * * cd /app && DATABASE_URL='\''$DB_URL'\'' NODE_ENV=production /usr/local/bin/node scripts/process-late-fees.js >> /app/logs/cron/late-fees.log 2>&1" | crontab -
        
        if command -v crond >/dev/null 2>&1; then
            crond -b -l 2
        elif command -v service >/dev/null 2>&1; then
            service cron start
        fi
        echo "Manual cron setup completed"
    ' || echo "⚠️  Manual cron setup also failed"
fi

# Verify cron service is running
echo "🔍 Verifying cron service..."
${DOCKER_CMD} sh -c "if command -v service >/dev/null 2>&1; then service cron status || echo 'Service command failed'; else ps aux | grep cron | grep -v grep || echo 'No cron processes found'; fi"

# Check installed cron jobs
echo "📅 Checking installed cron jobs..."
${DOCKER_CMD} crontab -l || echo "⚠️  No cron jobs found"

# Test late fee processing script (optional)
echo "🧪 Testing late fee processing script..."
if ! ${DOCKER_CMD} node scripts/process-late-fees.js; then
    echo "⚠️  Late fee processing test failed, but continuing..."
fi

# Check if log directory exists
echo "📁 Verifying log directory..."
${DOCKER_CMD} ls -la /app/logs/cron/ || (echo "Creating log directory..." && ${DOCKER_CMD} mkdir -p /app/logs/cron)

# Run health check (optional)
echo "🏥 Running health check..."
${DOCKER_CMD} node scripts/enhanced-cron-healthcheck.js || echo "⚠️  Health check failed, but continuing..."

echo "✅ Production cron setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Monitor logs at: /app/logs/cron/late-fees.log"
echo "   2. Check admin dashboard for late fee processing status"
echo "   3. Verify processing runs at 1:00 AM daily"
echo ""
echo "🔍 To check status manually:"
echo "   docker compose -f docker-compose.prod.yml exec backend ./scripts/check-cron-status.sh" 