#!/bin/bash

# DocuSeal On-Premises Production Installation Script
# Run this script on your production server

set -e

echo "🚀 DocuSeal On-Premises Production Installation"
echo "==============================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Extract the deployment package
if [ ! -f "docuseal-onprem-deployment.tar.gz" ]; then
    echo "❌ docuseal-onprem-deployment.tar.gz not found in current directory"
    echo "   Please upload the deployment package to this directory first."
    exit 1
fi

echo "📦 Extracting deployment package..."
tar -xzf docuseal-onprem-deployment.tar.gz

# Navigate to the extracted directory
cd docuseal-onprem

# Create necessary directories with proper permissions
echo "📁 Creating directory structure..."
sudo mkdir -p /opt/docuseal/{storage/documents,storage/signed-agreements,postgres/backups,logs/nginx}
sudo chown -R $USER:$USER /opt/docuseal
mkdir -p storage/documents
mkdir -p storage/signed-agreements
mkdir -p postgres/backups
mkdir -p logs/nginx
mkdir -p nginx/ssl

# Set proper permissions
chmod 755 storage/documents
chmod 755 storage/signed-agreements
chmod 755 postgres/backups
chmod 755 logs/nginx

# Copy production environment template
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up environment configuration..."
    cp env.example .env
    echo ""
    echo "📝 IMPORTANT: You must edit the .env file with your production settings!"
    echo ""
    echo "Required changes:"
    echo "  - POSTGRES_PASSWORD: Set a strong database password"
    echo "  - SECRET_KEY_BASE: Set a long random string (64+ characters)"
    echo "  - DOCUSEAL_HOST: Set your server's domain or IP address"
    echo "  - SMTP settings: Configure if you want email notifications"
    echo ""
    echo "Optional changes:"
    echo "  - WEBHOOK_URL: Set to your main backend for signing status updates"
    echo "  - FORCE_SSL: Set to true if using HTTPS"
    echo ""
    read -p "Press Enter after editing .env file to continue..."
fi

# Generate secret key if not changed from default
source .env
if [ "$SECRET_KEY_BASE" = "your_secret_key_base_change_this_in_production_make_it_very_long_and_random" ]; then
    echo "🔑 Generating secure SECRET_KEY_BASE..."
    NEW_SECRET=$(openssl rand -hex 64)
    sed -i.bak "s/SECRET_KEY_BASE=.*/SECRET_KEY_BASE=$NEW_SECRET/" .env
    echo "✅ New SECRET_KEY_BASE generated and saved to .env"
fi

# Configure firewall rules (if UFW is available)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall rules..."
    sudo ufw allow 8080/tcp comment "DocuSeal HTTP"
    sudo ufw allow 8443/tcp comment "DocuSeal HTTPS"
    echo "✅ Firewall rules configured"
fi

# Pull Docker images
echo "📥 Pulling Docker images..."
docker compose pull

# Start services
echo "🔧 Starting DocuSeal services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
timeout 60s bash -c 'until docker compose exec docuseal-postgres pg_isready -U docuseal -d docuseal; do sleep 2; done'
timeout 120s bash -c 'until curl -f http://localhost:3001/health >/dev/null 2>&1; do sleep 5; done'

# Run health checks
echo ""
echo "🏥 Running health checks..."
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Nginx proxy is healthy"
else
    echo "❌ Nginx proxy health check failed"
fi

if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ DocuSeal is responding"
else
    echo "❌ DocuSeal health check failed"
fi

# Show service status
echo ""
echo "🔍 Service status:"
docker compose ps

# Setup automatic backups
echo ""
echo "💾 Setting up automatic database backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./scripts/backup.sh >> logs/backup.log 2>&1") | crontab -

echo ""
echo "✅ DocuSeal Production Installation Complete!"
echo "=============================================="
echo ""
echo "🌐 Access URLs:"
echo "   Primary:  http://$(hostname -I | awk '{print $1}'):8080"
echo "   Direct:   http://$(hostname -I | awk '{print $1}'):3001"
if [ ! -z "$DOCUSEAL_HOST" ]; then
    echo "   Domain:   http://$DOCUSEAL_HOST:8080"
fi
echo ""
echo "🗄️  Database:"
echo "   Host: $(hostname -I | awk '{print $1}'):5433"
echo "   Database: docuseal"
echo "   User: docuseal"
echo ""
echo "📊 Management Commands:"
echo "   View logs:    docker compose logs -f"
echo "   Stop:         docker compose down"
echo "   Restart:      docker compose restart"
echo "   Backup DB:    ./scripts/backup.sh"
echo ""
echo "📁 Important Paths:"
echo "   Config:       $(pwd)/.env"
echo "   Documents:    $(pwd)/storage/documents"
echo "   Signed Docs:  $(pwd)/storage/signed-agreements"
echo "   Backups:      $(pwd)/postgres/backups"
echo "   Logs:         $(pwd)/logs/nginx"
echo ""
echo "🔄 Next Steps:"
echo "   1. Test access via web browser"
echo "   2. Create admin user in DocuSeal"
echo "   3. Configure SSL certificate (if needed)"
echo "   4. Test webhook integration with main backend"
echo "   5. Set up external backup location"
echo ""
echo "🆘 For support, check the README.md file or container logs"
