#!/bin/bash

# Fix MTSA network connectivity for signing orchestrator
# This script ensures the signing orchestrator can communicate with MTSA

echo "🔧 Fixing MTSA network connectivity..."

# Check if signing orchestrator is running
if ! docker ps | grep -q "signing-orchestrator"; then
    echo "❌ Signing orchestrator is not running"
    exit 1
fi

# Check if MTSA is running
if ! docker ps | grep -q "mtsa-pilot"; then
    echo "❌ MTSA container is not running"
    exit 1
fi

# Get the network that MTSA is on
MTSA_NETWORK=$(docker inspect mtsa-pilot-dev --format='{{range $net, $conf := .NetworkSettings.Networks}}{{$net}}{{end}}')
echo "📡 MTSA is on network: $MTSA_NETWORK"

# Connect signing orchestrator to the MTSA network if not already connected
if ! docker inspect signing-orchestrator --format='{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}' | grep -q "$MTSA_NETWORK"; then
    echo "🔗 Connecting signing orchestrator to $MTSA_NETWORK..."
    docker network connect "$MTSA_NETWORK" signing-orchestrator
    echo "✅ Connected successfully"
else
    echo "✅ Already connected to $MTSA_NETWORK"
fi

# Test the connection
echo "🧪 Testing MTSA connection..."
sleep 2

HEALTH_CHECK=$(curl -s -X GET "http://localhost:4010/health" -H "X-API-Key: dev-api-key" | jq -r '.checks.soapConnection // false')

if [ "$HEALTH_CHECK" = "true" ]; then
    echo "✅ MTSA connection is working!"
    echo "🎉 Network fix completed successfully"
else
    echo "❌ MTSA connection still not working"
    echo "📋 Current signing orchestrator networks:"
    docker inspect signing-orchestrator --format='{{range $net, $conf := .NetworkSettings.Networks}}  - {{$net}}{{end}}'
    exit 1
fi
