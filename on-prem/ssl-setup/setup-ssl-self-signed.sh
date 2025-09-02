#!/bin/bash

# SSL Setup Script for DocuSeal using Self-Signed Certificate
# This provides immediate HTTPS functionality while we work on Let's Encrypt

set -e

echo "🔐 Setting up HTTPS for DocuSeal using Self-Signed Certificate"
echo "=============================================================="

# Get the actual user who invoked sudo (if any)
if [ -n "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
    USER_HOME="/home/$SUDO_USER"
else
    ACTUAL_USER="$USER"
    USER_HOME="$HOME"
fi

DOCUSEAL_DIR="$USER_HOME/docuseal-onprem"

echo "🔍 Looking for DocuSeal directory at: $DOCUSEAL_DIR"
echo "👤 Running as user: $ACTUAL_USER"

# Check if DocuSeal directory exists
if [ ! -d "$DOCUSEAL_DIR" ]; then
    echo "❌ DocuSeal directory not found at $DOCUSEAL_DIR"
    exit 1
fi

echo "✅ Found DocuSeal directory at $DOCUSEAL_DIR"

# Create SSL directories
echo "📁 Creating SSL directories..."
mkdir -p /etc/ssl/certs /etc/ssl/private

# Generate self-signed certificate
echo "🔑 Generating self-signed SSL certificate for sign.kredit.my..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/sign.kredit.my.key \
    -out /etc/ssl/certs/sign.kredit.my.crt \
    -subj "/C=MY/ST=Kuala Lumpur/L=Kuala Lumpur/O=Kredit.my/OU=IT Department/CN=sign.kredit.my/emailAddress=admin@kredit.my" \
    -config <(
    echo '[req]'
    echo 'default_bits = 2048'
    echo 'prompt = no'
    echo 'distinguished_name = req_distinguished_name'
    echo 'req_extensions = v3_req'
    echo '[req_distinguished_name]'
    echo 'C = MY'
    echo 'ST = Kuala Lumpur'
    echo 'L = Kuala Lumpur'
    echo 'O = Kredit.my'
    echo 'OU = IT Department'
    echo 'CN = sign.kredit.my'
    echo 'emailAddress = admin@kredit.my'
    echo '[v3_req]'
    echo 'basicConstraints = CA:FALSE'
    echo 'keyUsage = nonRepudiation, digitalSignature, keyEncipherment'
    echo 'subjectAltName = @alt_names'
    echo '[alt_names]'
    echo 'DNS.1 = sign.kredit.my'
    echo 'DNS.2 = *.kredit.my'
    echo 'IP.1 = 210.186.80.101'
)

# Generate Diffie-Hellman parameters
echo "🔐 Generating Diffie-Hellman parameters..."
if [ ! -f /etc/ssl/certs/dhparam.pem ]; then
    openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
fi

# Set proper permissions
echo "🔒 Setting certificate permissions..."
chmod 644 /etc/ssl/certs/sign.kredit.my.crt
chmod 600 /etc/ssl/private/sign.kredit.my.key
chmod 644 /etc/ssl/certs/dhparam.pem

# Update DocuSeal configuration
echo "⚙️  Updating DocuSeal configuration..."
cd "$DOCUSEAL_DIR"

# Backup current .env
sudo -u "$ACTUAL_USER" cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update environment variables for HTTPS
sudo -u "$ACTUAL_USER" sed -i 's/FORCE_SSL=false/FORCE_SSL=true/' .env
sudo -u "$ACTUAL_USER" sed -i 's/DEFAULT_URL_HOST=192.168.0.100/DEFAULT_URL_HOST=sign.kredit.my/' .env
sudo -u "$ACTUAL_USER" sed -i 's/DEFAULT_URL_PORT=3001/DEFAULT_URL_PORT=443/' .env

# Add HTTPS port if not present
if ! grep -q "HTTPS_PORT" .env; then
    echo "HTTPS_PORT=443" | sudo -u "$ACTUAL_USER" tee -a .env > /dev/null
fi

# Update nginx configuration
echo "🌐 Updating Nginx configuration..."
sudo -u "$ACTUAL_USER" cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Create HTTPS-enabled nginx configuration
sudo -u "$ACTUAL_USER" cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Upstream for DocuSeal
    upstream docuseal_backend {
        server docuseal:3000;
        keepalive 32;
    }
    
    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        server_name sign.kredit.my;
        
        # Health check endpoint (allow HTTP for monitoring)
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Redirect all other HTTP traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name sign.kredit.my;
        
        # SSL Configuration
        ssl_certificate /etc/ssl/certs/sign.kredit.my.crt;
        ssl_certificate_key /etc/ssl/private/sign.kredit.my.key;
        
        # SSL Settings
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout 10m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_dhparam /etc/ssl/certs/dhparam.pem;
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Rate limiting for API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://docuseal_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_http_version 1.1;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Handle DocuSeal disk routes for file serving
        location /disk/ {
            proxy_pass http://docuseal_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_http_version 1.1;
            
            proxy_buffering off;
            proxy_cache off;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        # Handle DocuSeal file routes
        location /file/ {
            proxy_pass http://docuseal_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_http_version 1.1;
            
            proxy_buffering off;
            proxy_cache off;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }
        
        # Serve static files from public folder
        location ~ \.(png|jpg|jpeg|gif|svg|ico|css|js)$ {
            root /data/public;
            try_files $uri =404;
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Rate limiting for login endpoints
        location /users/sign_in {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://docuseal_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_http_version 1.1;
        }
        
        # All other requests to DocuSeal
        location / {
            proxy_pass http://docuseal_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_http_version 1.1;
            
            # WebSocket support
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
        }
        
        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
        
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
EOF

# Update docker-compose.yml
echo "🐳 Updating Docker Compose configuration..."
sudo -u "$ACTUAL_USER" cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)

# Create Python script to update docker-compose.yml
sudo -u "$ACTUAL_USER" cat > update_compose.py << 'PYTHON_EOF'
#!/usr/bin/env python3
import yaml
import sys

try:
    with open('docker-compose.yml', 'r') as f:
        compose = yaml.safe_load(f)
    
    # Update nginx service
    if 'services' in compose and 'nginx' in compose['services']:
        nginx_service = compose['services']['nginx']
        
        # Add port 443
        if 'ports' not in nginx_service:
            nginx_service['ports'] = []
        
        # Check if 443 is already mapped
        has_443 = any('443:443' in str(port) for port in nginx_service['ports'])
        if not has_443:
            nginx_service['ports'].append('443:443')
        
        # Add SSL certificate volumes
        if 'volumes' not in nginx_service:
            nginx_service['volumes'] = []
        
        ssl_volumes = [
            '/etc/ssl/certs/sign.kredit.my.crt:/etc/ssl/certs/sign.kredit.my.crt:ro',
            '/etc/ssl/private/sign.kredit.my.key:/etc/ssl/private/sign.kredit.my.key:ro',
            '/etc/ssl/certs/dhparam.pem:/etc/ssl/certs/dhparam.pem:ro'
        ]
        
        for vol in ssl_volumes:
            if vol not in nginx_service['volumes']:
                nginx_service['volumes'].append(vol)
    
    # Write updated docker-compose.yml
    with open('docker-compose.yml', 'w') as f:
        yaml.dump(compose, f, default_flow_style=False, sort_keys=False)
    
    print("✅ Docker Compose updated successfully")
    
except Exception as e:
    print(f"❌ Error updating docker-compose.yml: {e}")
    sys.exit(1)
PYTHON_EOF

sudo -u "$ACTUAL_USER" python3 update_compose.py
sudo -u "$ACTUAL_USER" rm update_compose.py

# Start DocuSeal with HTTPS
echo "🚀 Starting DocuSeal with HTTPS..."
sudo -u "$ACTUAL_USER" docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Test HTTPS connection
echo "🧪 Testing HTTPS connection..."
if curl -k -s https://sign.kredit.my/health > /dev/null; then
    echo "✅ HTTPS is working!"
    echo ""
    echo "🎉 Self-Signed SSL/HTTPS setup completed!"
    echo "========================================"
    echo "✅ Self-signed SSL certificate generated for sign.kredit.my"
    echo "✅ Nginx configured for HTTPS with HTTP redirect"
    echo "✅ DocuSeal configured to use HTTPS"
    echo ""
    echo "🌐 Your DocuSeal is now available at:"
    echo "   https://sign.kredit.my"
    echo ""
    echo "⚠️  Browser Security Warning:"
    echo "   Browsers will show a security warning for self-signed certificates."
    echo "   Click 'Advanced' → 'Proceed to sign.kredit.my (unsafe)' to continue."
    echo ""
    echo "🔄 To upgrade to Let's Encrypt certificate later:"
    echo "   1. Add DNS TXT record: _acme-challenge.sign.kredit.my"
    echo "   2. Run: sudo ~/setup-ssl-dns-validation.sh"
    echo ""
    echo "📋 Certificate Details:"
    echo "   Valid for: 365 days"
    echo "   Includes: sign.kredit.my, *.kredit.my, 210.186.80.101"
else
    echo "❌ HTTPS test failed. Check logs:"
    sudo -u "$ACTUAL_USER" docker-compose logs nginx
fi
