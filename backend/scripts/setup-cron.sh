#!/bin/bash

# Setup cron job for late fee processing
# This script should be run during Docker container startup

set -e

echo "Setting up late fee processing cron job..."

# Create log directory
mkdir -p /app/logs/cron

# Create cron job entry with full paths and environment variables
CRON_JOB="0 1 * * * cd /app && DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kapital?schema=public NODE_ENV=development /usr/local/bin/node scripts/process-late-fees.js >> /app/logs/cron/late-fees.log 2>&1"

# Install only the daily processing cron job
echo "$CRON_JOB" | crontab -

# Start cron daemon
service cron start

echo "Cron jobs installed:"
crontab -l

echo "✅ Late fee processing cron job setup completed" 