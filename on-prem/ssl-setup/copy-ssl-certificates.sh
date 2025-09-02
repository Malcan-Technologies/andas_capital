#!/bin/bash

# Script to copy SSL certificates to DocuSeal nginx directory
# Run this on the server with: sudo ./copy-ssl-certificates.sh

echo "🔐 Copying SSL certificates to DocuSeal nginx directory..."

# Create ssl directory if it doesn't exist
mkdir -p /home/admin-kapital/docuseal-onprem/nginx/ssl

# Copy certificates with correct names
cp /etc/letsencrypt/live/sign.kredit.my/fullchain.pem /home/admin-kapital/docuseal-onprem/nginx/ssl/sign.kredit.my.crt
cp /etc/letsencrypt/live/sign.kredit.my/privkey.pem /home/admin-kapital/docuseal-onprem/nginx/ssl/sign.kredit.my.key

# Set correct ownership
chown admin-kapital:admin-kapital /home/admin-kapital/docuseal-onprem/nginx/ssl/*

# Set correct permissions
chmod 644 /home/admin-kapital/docuseal-onprem/nginx/ssl/sign.kredit.my.crt
chmod 600 /home/admin-kapital/docuseal-onprem/nginx/ssl/sign.kredit.my.key

echo "✅ SSL certificates copied successfully!"
echo "📋 Certificate files:"
ls -la /home/admin-kapital/docuseal-onprem/nginx/ssl/

echo ""
echo "🚀 Now restart DocuSeal to use the certificates:"
echo "   cd /home/admin-kapital/docuseal-onprem && docker-compose restart nginx"
