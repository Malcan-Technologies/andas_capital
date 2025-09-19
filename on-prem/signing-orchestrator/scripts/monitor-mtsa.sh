#!/bin/bash

# MTSA Container Health Monitor
# This script checks if MTSA container is running and restarts it if needed

CONTAINER_NAME="mtsa-pilot-dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Checking MTSA container status..."

# Check if container exists and is running
if docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ MTSA container is running"
    
    # Test WSDL endpoint
    if curl -s --max-time 10 "http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl" | grep -q "MyTrustSignerAgentWSAPVE"; then
        echo "✅ MTSA WSDL endpoint is responding"
        exit 0
    else
        echo "❌ MTSA WSDL endpoint is not responding"
    fi
else
    echo "❌ MTSA container is not running"
fi

echo "🚀 Restarting MTSA container..."
cd "$PROJECT_DIR"

# Stop and restart MTSA development stack
./deploy-mtsa-dev.sh

# Wait a bit for startup
sleep 10

# Verify it's working
if docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ MTSA container restarted successfully"
    
    # Test WSDL endpoint again
    if curl -s --max-time 10 "http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl" | grep -q "MyTrustSignerAgentWSAPVE"; then
        echo "✅ MTSA WSDL endpoint is now responding"
    else
        echo "⚠️  MTSA container is running but WSDL endpoint may still be starting up"
    fi
else
    echo "❌ Failed to restart MTSA container"
    exit 1
fi
