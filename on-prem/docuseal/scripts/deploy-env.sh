#!/bin/bash

# ===============================================
# DocuSeal Environment Deployment Script
# ===============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [development|production]"
    echo ""
    echo "Examples:"
    echo "  $0 development    # Deploy for local development"
    echo "  $0 production     # Deploy for production server"
    echo ""
    echo "This script will:"
    echo "  1. Copy the appropriate environment file to .env"
    echo "  2. Stop existing containers"
    echo "  3. Start containers with new configuration"
    echo "  4. Show deployment status"
}

# Check if environment argument is provided
if [ $# -eq 0 ]; then
    print_error "No environment specified!"
    show_usage
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments are: development, production"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found! Please run this script from the docuseal-onprem directory."
    exit 1
fi

print_status "Deploying DocuSeal for $ENVIRONMENT environment..."

# Copy environment file
ENV_FILE="env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    exit 1
fi

print_status "Copying $ENV_FILE to .env..."
cp "$ENV_FILE" .env

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start containers with new configuration
print_status "Starting containers with $ENVIRONMENT configuration..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Check status
print_status "Checking deployment status..."
docker-compose ps

# Show environment-specific information
print_success "DocuSeal deployed for $ENVIRONMENT environment!"
echo ""
print_status "Environment Details:"

if [ "$ENVIRONMENT" = "development" ]; then
    echo "  🌐 DocuSeal Web Interface: http://192.168.0.100"
    echo "  🔗 Direct API Access: http://192.168.0.100:3001"
    echo "  📡 Webhook Endpoint: http://192.168.0.88:4001/api/docuseal/webhook"
    echo "  🗄️  Database: localhost:5433"
    echo ""
    print_warning "Make sure your backend is running on your laptop (192.168.0.88:4001)"
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "  🌐 DocuSeal Web Interface: https://sign.kredit.my"
    echo "  🔗 Direct API Access: https://sign.kredit.my"
    echo "  📡 Webhook Endpoint: https://api.kredit.my/api/docuseal/webhook"
    echo "  🗄️  Database: Internal (port 5433)"
    echo ""
    print_warning "Make sure your production backend is accessible at api.kredit.my"
fi

echo ""
print_status "Next steps:"
echo "  1. Access DocuSeal web interface"
echo "  2. Set the App URL in DocuSeal Settings → Configuration"
echo "  3. Configure webhook URL if needed"
echo "  4. Test document signing functionality"
