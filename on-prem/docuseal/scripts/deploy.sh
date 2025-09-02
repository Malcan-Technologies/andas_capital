#!/bin/bash

# DocuSeal On-Premises Deployment Script
# Usage: ./scripts/deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying DocuSeal in $ENVIRONMENT mode..."

# Change to project directory
cd "$PROJECT_DIR"

# Create necessary directories
echo "📁 Creating directory structure..."
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

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from env.example..."
    cp env.example .env
    echo "✏️  Please edit .env file with your configuration before continuing."
    echo "📝 Key variables to configure:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - SECRET_KEY_BASE"
    echo "   - SMTP settings (if using email)"
    read -p "Press Enter after editing .env file to continue..."
fi

# Load environment variables
source .env

# Generate secret key if not set
if [ "$SECRET_KEY_BASE" = "your_secret_key_base_change_this_in_production_make_it_very_long_and_random" ]; then
    echo "🔑 Generating new SECRET_KEY_BASE..."
    NEW_SECRET=$(openssl rand -hex 64)
    sed -i.bak "s/SECRET_KEY_BASE=.*/SECRET_KEY_BASE=$NEW_SECRET/" .env
    echo "✅ New SECRET_KEY_BASE generated and saved to .env"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker compose pull

# Build and start containers
echo "🔧 Starting DocuSeal services..."
docker compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout 60s bash -c 'until docker compose exec docuseal-postgres pg_isready -U docuseal -d docuseal; do sleep 2; done'

# Wait for DocuSeal to be ready
echo "⏳ Waiting for DocuSeal to be ready..."
timeout 120s bash -c 'until curl -f http://localhost:3001/health >/dev/null 2>&1; do sleep 5; done'

# Check service status
echo "🔍 Checking service status..."
docker compose ps

# Show access information
echo ""
echo "✅ DocuSeal deployment completed!"
echo ""
echo "🌐 Access URLs:"
echo "   Direct access: http://localhost:3001"
echo "   Via proxy:     http://localhost:8080"
echo ""
echo "🗄️  Database:"
echo "   Host: localhost:5433"
echo "   Database: docuseal"
echo "   User: docuseal"
echo ""
echo "📊 Monitoring:"
echo "   View logs: docker compose logs -f"
echo "   Stop:      docker compose down"
echo "   Restart:   docker compose restart"
echo ""
echo "📁 Storage locations:"
echo "   Documents: ./storage/documents"
echo "   Signed:    ./storage/signed-agreements"
echo "   Backups:   ./postgres/backups"
echo ""

# Run health checks
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

echo ""
echo "🎉 Setup complete! You can now access DocuSeal at http://localhost:8080"
