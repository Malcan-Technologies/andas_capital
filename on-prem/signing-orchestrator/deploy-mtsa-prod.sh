#!/bin/bash

# =============================================================================
# Deploy MTSA Integration for Production On-Premises
# =============================================================================

set -e

echo "🚀 Starting MTSA Integration Production Deployment..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root or with sudo"
    exit 1
fi

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

# Create production directories
echo "📁 Creating production directories..."
mkdir -p /opt/kapital/signed-files
mkdir -p /opt/kapital/logs/signing-orchestrator
mkdir -p /opt/kapital/logs/mtsa
mkdir -p /opt/kapital/mtsa/config

# Copy MTSA configuration files if they don't exist
if [ ! -f "/opt/kapital/mtsa/config/opg-capital-mtsa.pilot.properties" ]; then
    echo "📋 Copying MTSA configuration files..."
    cp -r ../mtsa/mtsa/* /opt/kapital/mtsa/config/
fi

# Set proper permissions
echo "🔒 Setting proper permissions..."
chown -R 1000:1000 /opt/kapital/signed-files
chown -R 1000:1000 /opt/kapital/logs
chmod -R 755 /opt/kapital

# Copy environment file if it doesn't exist
if [ ! -f "env.production" ]; then
    echo "📋 Creating production environment file..."
    cp env.example env.production
    echo "⚠️  Please edit env.production with your production settings before continuing."
    exit 1
fi

# Check if production credentials are configured
if grep -q "your-mtsa-prod-username" env.production; then
    echo "⚠️  Please configure your production credentials in env.production file:"
    echo "   - MTSA_SOAP_USERNAME"
    echo "   - MTSA_SOAP_PASSWORD"
    echo "   - DOCUSEAL_WEBHOOK_HMAC_SECRET"
    echo "   - DOCUSEAL_API_TOKEN"
    exit 1
fi

# Backup existing deployment
if docker-compose -f docker-compose.mtsa-prod.yml ps | grep -q "Up"; then
    echo "💾 Creating backup of current deployment..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    mkdir -p /opt/kapital/backups/$timestamp
    cp -r /opt/kapital/signed-files /opt/kapital/backups/$timestamp/
    echo "Backup created at /opt/kapital/backups/$timestamp/"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.mtsa-prod.yml down

# Pull latest images and build
echo "🏗️  Building and starting production services..."
docker-compose -f docker-compose.mtsa-prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to become healthy..."
timeout 180 bash -c '
    while true; do
        if docker-compose -f docker-compose.mtsa-prod.yml ps | grep -q "Up (healthy)"; then
            echo "Services are healthy!"
            break
        fi
        echo "Waiting for services to start..."
        sleep 10
    done
'

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.mtsa-prod.yml ps

# Test MTSA WSDL endpoint
echo "🧪 Testing MTSA WSDL endpoint..."
if curl -f -s "http://localhost:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl" > /dev/null; then
    echo "✅ MTSA WSDL endpoint is accessible"
else
    echo "❌ MTSA WSDL endpoint is not accessible"
    echo "Please check the logs: docker-compose -f docker-compose.mtsa-prod.yml logs mtsa-pilot"
fi

# Test Signing Orchestrator health endpoint
echo "🧪 Testing Signing Orchestrator health endpoint..."
if curl -f -s "http://localhost:4010/health" > /dev/null; then
    echo "✅ Signing Orchestrator is healthy"
else
    echo "❌ Signing Orchestrator is not healthy"
    echo "Please check the logs: docker-compose -f docker-compose.mtsa-prod.yml logs signing-orchestrator"
fi

# Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 4010/tcp comment "Signing Orchestrator"
    ufw allow from 192.168.0.0/24 to any port 8080 comment "MTSA internal access"
fi

# Create systemd service for auto-restart
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/mtsa-signing.service << EOF
[Unit]
Description=MTSA Signing Integration
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose -f docker-compose.mtsa-prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.mtsa-prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mtsa-signing.service

echo ""
echo "🎉 MTSA Integration Production Deployment Complete!"
echo ""
echo "📋 Production Setup Summary:"
echo "✅ Services running on:"
echo "   - Signing Orchestrator: http://localhost:4010"
echo "   - MTSA Agent: http://localhost:8080"
echo ""
echo "✅ Data directories:"
echo "   - Signed files: /opt/kapital/signed-files"
echo "   - Logs: /opt/kapital/logs/"
echo "   - MTSA config: /opt/kapital/mtsa/config"
echo ""
echo "✅ Systemd service: mtsa-signing.service"
echo "   - Start: systemctl start mtsa-signing"
echo "   - Stop: systemctl stop mtsa-signing"
echo "   - Status: systemctl status mtsa-signing"
echo ""
echo "📋 Next Steps:"
echo "1. Verify nginx reverse proxy configuration"
echo "2. Test DocuSeal webhook integration"
echo "3. Configure SSL certificates for production"
echo "4. Set up monitoring and log rotation"
echo ""
echo "🔍 Useful Commands:"
echo "   View logs: docker-compose -f docker-compose.mtsa-prod.yml logs -f"
echo "   Restart: systemctl restart mtsa-signing"
echo "   Health check: curl http://localhost:4010/health"
echo ""
