#!/bin/bash

# =============================================================================
# Deploy MTSA Integration for Development
# =============================================================================

set -e

echo "🚀 Starting MTSA Integration Development Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if MTSA directory exists
if [ ! -d "../mtsa" ]; then
    echo "❌ MTSA directory not found at ../mtsa"
    echo "Please ensure the MTSA application is placed in the correct directory."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p signed-files
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f "env.development" ]; then
    echo "📋 Creating development environment file..."
    cp env.example env.development
    echo "⚠️  Please edit env.development with your MTSA credentials before continuing."
    exit 1
fi

# Check if MTSA credentials are configured
if grep -q "your-mtsa-pilot-username" env.development; then
    echo "⚠️  Please configure your MTSA credentials in env.development file:"
    echo "   - MTSA_SOAP_USERNAME"
    echo "   - MTSA_SOAP_PASSWORD"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.mtsa-dev.yml down

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.mtsa-dev.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to become healthy..."
timeout 120 bash -c '
    while true; do
        if docker-compose -f docker-compose.mtsa-dev.yml ps | grep -q "Up (healthy)"; then
            break
        fi
        echo "Waiting for services to start..."
        sleep 5
    done
'

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.mtsa-dev.yml ps

# Test MTSA WSDL endpoint
echo "🧪 Testing MTSA WSDL endpoint..."
if curl -f -s "http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl" > /dev/null; then
    echo "✅ MTSA WSDL endpoint is accessible"
else
    echo "❌ MTSA WSDL endpoint is not accessible"
    echo "Please check the logs: docker-compose -f docker-compose.mtsa-dev.yml logs mtsa-pilot"
fi

# Test Signing Orchestrator health endpoint
echo "🧪 Testing Signing Orchestrator health endpoint..."
if curl -f -s "http://localhost:4010/health" > /dev/null; then
    echo "✅ Signing Orchestrator is healthy"
else
    echo "❌ Signing Orchestrator is not healthy"
    echo "Please check the logs: docker-compose -f docker-compose.mtsa-dev.yml logs signing-orchestrator"
fi

echo ""
echo "🎉 MTSA Integration Development Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test the integration using the API endpoints:"
echo "   - Health Check: http://localhost:4010/health"
echo "   - MTSA WSDL: http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl"
echo ""
echo "2. API Endpoints available:"
echo "   - POST /api/enroll - Enroll user and request certificate"
echo "   - POST /api/sign - Sign PDF documents"
echo "   - GET /api/cert/:userId - Get certificate info"
echo "   - POST /api/otp - Request OTP"
echo "   - POST /api/verify - Verify signed PDF"
echo ""
echo "3. View logs:"
echo "   docker-compose -f docker-compose.mtsa-dev.yml logs -f"
echo ""
echo "4. Stop services:"
echo "   docker-compose -f docker-compose.mtsa-dev.yml down"
echo ""
