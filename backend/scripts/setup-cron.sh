#!/bin/bash

# Setup cron job for late fee processing
# This script should be run during Docker container startup

set -e

echo "Setting up late fee processing cron job..."

# Create log directory
mkdir -p /app/logs/cron

# Determine the environment and database URL
if [ "$NODE_ENV" = "production" ]; then
    echo "Setting up cron for PRODUCTION environment"
    DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/kapital?schema=public}"
    ENV_VAR="production"
else
    echo "Setting up cron for DEVELOPMENT environment"
    DB_URL="postgresql://postgres:postgres@postgres:5432/kapital?schema=public"
    ENV_VAR="development"
fi

# Create cron job entry with environment-appropriate settings
CRON_JOB="0 1 * * * cd /app && DATABASE_URL='${DB_URL}' NODE_ENV=${ENV_VAR} /usr/local/bin/node scripts/process-late-fees.js >> /app/logs/cron/late-fees.log 2>&1"

# Install only the daily processing cron job
echo "$CRON_JOB" | crontab -

# Start cron daemon (works for both Debian/Ubuntu and Alpine)
if command -v service >/dev/null 2>&1; then
    # Debian/Ubuntu (development)
    service cron start
elif command -v crond >/dev/null 2>&1; then
    # Alpine Linux (production)
    crond -b -l 2
else
    echo "❌ No cron service found"
    exit 1
fi

echo "Cron jobs installed:"
crontab -l

echo "✅ Late fee processing cron job setup completed for $ENV_VAR environment" 