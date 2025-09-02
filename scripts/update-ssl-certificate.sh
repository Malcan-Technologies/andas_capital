#!/bin/bash

# SSL Certificate Update Script for Kredit.my Domains
# Ensures sign.kredit.my is included in the SSL certificate
# This script should be run on the Digital Ocean VPS

set -e

DOMAINS="kredit.my www.kredit.my admin.kredit.my api.kredit.my sign.kredit.my"
EMAIL="admin@kredit.my"  # Replace with your actual email

echo "🔐 Updating SSL certificate for Kredit.my domains"
echo "=================================================="
echo "Domains: $DOMAINS"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root"
    echo "Please run: sudo $0"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot is already installed"
fi

# Check current certificate
echo "🔍 Checking current certificate..."
if [ -f "/etc/letsencrypt/live/kredit.my/fullchain.pem" ]; then
    echo "📋 Current certificate domains:"
    openssl x509 -in /etc/letsencrypt/live/kredit.my/fullchain.pem -text -noout | grep -A1 "Subject Alternative Name" | tail -1 | sed 's/DNS://g' | tr ',' '\n' | sed 's/^ */  - /'
    echo ""
fi

# Stop nginx temporarily
echo "🛑 Stopping nginx temporarily..."
systemctl stop nginx

# Request/renew certificate with all domains
echo "🔑 Requesting SSL certificate for all domains..."
certbot certonly \
    --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --expand \
    --cert-name kredit.my \
    -d $(echo $DOMAINS | tr ' ' ',')

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate updated successfully!"
    
    # Verify the new certificate includes all domains
    echo ""
    echo "📋 New certificate domains:"
    openssl x509 -in /etc/letsencrypt/live/kredit.my/fullchain.pem -text -noout | grep -A1 "Subject Alternative Name" | tail -1 | sed 's/DNS://g' | tr ',' '\n' | sed 's/^ */  - /'
    
    # Test nginx configuration
    echo ""
    echo "🧪 Testing nginx configuration..."
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
        
        # Start nginx
        echo "🚀 Starting nginx..."
        systemctl start nginx
        systemctl status nginx --no-pager -l
        
        echo ""
        echo "🎉 SSL certificate update completed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "  1. Test HTTPS access: https://sign.kredit.my"
        echo "  2. Verify certificate: https://www.ssllabs.com/ssltest/"
        echo "  3. Check auto-renewal: certbot renew --dry-run"
        
    else
        echo "❌ Nginx configuration test failed"
        echo "Please check the nginx configuration and try again"
        exit 1
    fi
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Starting nginx anyway..."
    systemctl start nginx
    exit 1
fi

# Setup auto-renewal if not already configured
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    echo ""
    echo "⏰ Setting up automatic renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -
    echo "✅ Auto-renewal cron job added (daily at 12:00 PM)"
else
    echo "✅ Auto-renewal is already configured"
fi

echo ""
echo "🔐 SSL Certificate Management Complete!"
echo "All Kredit.my domains are now secured with HTTPS"
