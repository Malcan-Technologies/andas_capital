#!/bin/bash

# Admin deployment script for growkapital
# This ensures the admin app runs correctly with standalone server

set -e

echo "Starting admin deployment..."

# Navigate to admin directory
cd "$(dirname "$0")"

# Stop existing admin process if running
pm2 stop growkapital-admin 2>/dev/null || true
pm2 delete growkapital-admin 2>/dev/null || true

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Build the application
echo "Building admin app..."
npm run build:prod

# Start with ecosystem configuration if it exists, otherwise use direct command
if [ -f "ecosystem.config.js" ]; then
    echo "Starting admin app using ecosystem config..."
    pm2 start ecosystem.config.js
else
    echo "Starting admin app with standalone server on port 3003..."
    PORT=3003 pm2 start .next/standalone/server.js --name growkapital-admin
fi

# Save PM2 configuration
pm2 save

echo "Admin deployment completed successfully!"
echo "Admin app is running on port 3003"

# Verify it's running
sleep 2
pm2 status growkapital-admin 