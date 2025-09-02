#!/bin/bash

# SSL Setup Script for sign.kredit.my
# Run this script on your server after initial deployment

set -e

DOMAIN="sign.kredit.my"
EMAIL="admin@kredit.my"  # Change this to your email
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCUSEAL_DIR="$SCRIPT_DIR/docuseal-onprem"

echo "🔐 SSL Setup for $DOMAIN"
echo "========================"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Check if domain is accessible
echo "📡 Testing domain accessibility..."
if ! ping -c 1 $DOMAIN >/dev/null 2>&1; then
    echo "❌ Domain $DOMAIN is not accessible from this server."
    echo "   Please verify:"
    echo "   1. DNS is properly configured"
    echo "   2. Domain points to this server's external IP"
    echo "   3. Firewall allows incoming connections"
    exit 1
fi

echo "✅ Domain is accessible"

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    
    # Ubuntu/Debian
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y certbot
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y certbot
    else
        echo "❌ Unsupported OS. Please install certbot manually."
        exit 1
    fi
fi

# Stop nginx temporarily for certificate generation
echo "🛑 Temporarily stopping nginx for certificate generation..."
cd "$DOCUSEAL_DIR"
docker compose stop nginx

# Generate SSL certificate
echo "🔑 Generating SSL certificate for $DOMAIN..."
sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$DOMAIN" \
    --expand

# Create nginx SSL directory
mkdir -p nginx/ssl

# Copy certificates to nginx directory
echo "📋 Copying certificates..."
sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "nginx/ssl/$DOMAIN.crt"
sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "nginx/ssl/$DOMAIN.key"
sudo chown $USER:$USER nginx/ssl/*
chmod 644 nginx/ssl/$DOMAIN.crt
chmod 600 nginx/ssl/$DOMAIN.key

# Copy domain-specific configuration files
echo "⚙️  Installing domain-specific configuration..."

# Copy nginx config
cp "$SCRIPT_DIR/nginx-domain.conf" "nginx/nginx-domain.conf"

# Copy docker-compose for domain
cp "$SCRIPT_DIR/docker-compose-domain.yml" "docker-compose.yml"

# Update environment for domain
if [ ! -f ".env.backup" ]; then
    cp ".env" ".env.backup"
    echo "💾 Backed up original .env to .env.backup"
fi

# Update .env with domain settings
echo "🔧 Updating environment configuration..."
cat > .env << EOF
# DocuSeal Production Environment - Domain Configuration
# Generated for: $DOMAIN

# Database Configuration
POSTGRES_PASSWORD=$(grep POSTGRES_PASSWORD .env.backup | cut -d'=' -f2)

# Application Security
SECRET_KEY_BASE=$(grep SECRET_KEY_BASE .env.backup | cut -d'=' -f2)

# Domain Configuration
DOCUSEAL_HOST=$DOMAIN
FORCE_SSL=true
RAILS_FORCE_SSL=true
DEFAULT_URL_HOST=$DOMAIN
DEFAULT_URL_PORT=443

# Standard ports for domain
HTTP_PORT=80
HTTPS_PORT=443
POSTGRES_EXTERNAL_PORT=5433
DOCUSEAL_EXTERNAL_PORT=3001

# SMTP Configuration (update as needed)
SMTP_ADDRESS=$(grep SMTP_ADDRESS .env.backup | cut -d'=' -f2- || echo "")
SMTP_PORT=$(grep SMTP_PORT .env.backup | cut -d'=' -f2 || echo "587")
SMTP_USERNAME=$(grep SMTP_USERNAME .env.backup | cut -d'=' -f2- || echo "")
SMTP_PASSWORD=$(grep SMTP_PASSWORD .env.backup | cut -d'=' -f2- || echo "")
SMTP_DOMAIN=kredit.my
SMTP_FROM=noreply@kredit.my
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true

# Webhook Configuration
WEBHOOK_URL=https://api.kredit.my/api/webhook/docuseal

# Production Settings
NODE_ENV=production
TZ=Asia/Kuala_Lumpur
EOF

# Set up automatic certificate renewal
echo "🔄 Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'cd $DOCUSEAL_DIR && docker compose restart nginx'") | crontab -

# Update firewall rules for standard ports
echo "🔥 Updating firewall rules..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp comment "HTTP for SSL renewal"
    sudo ufw allow 443/tcp comment "HTTPS for DocuSeal"
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
fi

# Start services with new configuration
echo "🚀 Starting services with SSL configuration..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Test SSL configuration
echo "🧪 Testing SSL configuration..."
if curl -f https://$DOMAIN/health >/dev/null 2>&1; then
    echo "✅ HTTPS is working correctly!"
else
    echo "⚠️  HTTPS test failed. Checking logs..."
    docker compose logs nginx | tail -20
fi

# Test HTTP redirect
echo "🔀 Testing HTTP to HTTPS redirect..."
if curl -s -I http://$DOMAIN/ | grep -q "301\|302"; then
    echo "✅ HTTP to HTTPS redirect is working!"
else
    echo "⚠️  HTTP redirect may not be working correctly"
fi

# Check certificate expiry
echo "📅 Certificate information:"
openssl x509 -in "nginx/ssl/$DOMAIN.crt" -noout -dates

echo ""
echo "🎉 SSL Setup Complete!"
echo "====================="
echo ""
echo "✅ Your DocuSeal instance is now available at:"
echo "   🌐 https://$DOMAIN"
echo "   🔐 SSL certificate installed and configured"
echo "   🔄 Automatic renewal set up"
echo ""
echo "📊 Service Status:"
docker compose ps
echo ""
echo "🔧 Next Steps:"
echo "   1. Test access: https://$DOMAIN"
echo "   2. Verify all functionality works over HTTPS"
echo "   3. Update your main application to use HTTPS URLs"
echo "   4. Test webhook integration with your backend"
echo ""
echo "🆘 If you encounter issues:"
echo "   - Check logs: docker compose logs nginx"
echo "   - Verify DNS: dig $DOMAIN"
echo "   - Test connectivity: curl -I https://$DOMAIN"
echo ""
echo "📱 Certificate will auto-renew. Monitor renewal with:"
echo "   sudo certbot certificates"
