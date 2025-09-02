#!/bin/bash

# SSL Setup Script for DocuSeal
# Run this script on your on-premises server

set -e

echo "🔐 Setting up SSL/HTTPS for DocuSeal (sign.kredit.my)"
echo "=================================================="

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Install Certbot if not already installed
echo "📦 Installing Certbot..."
$SUDO apt update
$SUDO apt install -y certbot python3-certbot-nginx

# Stop DocuSeal temporarily to free up port 80
echo "🛑 Stopping DocuSeal temporarily..."
cd ~/docuseal-onprem
docker-compose down

# Generate SSL certificate using Let's Encrypt
echo "🔑 Generating SSL certificate for sign.kredit.my..."
$SUDO certbot certonly --standalone \
    --preferred-challenges http \
    -d sign.kredit.my \
    --email admin@kredit.my \
    --agree-tos \
    --non-interactive

# Create SSL directories if they don't exist
echo "📁 Creating SSL directories..."
$SUDO mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy certificates to expected locations
echo "📋 Copying certificates..."
$SUDO cp /etc/letsencrypt/live/sign.kredit.my/fullchain.pem /etc/ssl/certs/sign.kredit.my.crt
$SUDO cp /etc/letsencrypt/live/sign.kredit.my/privkey.pem /etc/ssl/private/sign.kredit.my.key

# Generate Diffie-Hellman parameters for enhanced security
echo "🔐 Generating Diffie-Hellman parameters..."
if [ ! -f /etc/ssl/certs/dhparam.pem ]; then
    $SUDO openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
fi

# Set proper permissions
echo "🔒 Setting certificate permissions..."
$SUDO chmod 644 /etc/ssl/certs/sign.kredit.my.crt
$SUDO chmod 600 /etc/ssl/private/sign.kredit.my.key
$SUDO chmod 644 /etc/ssl/certs/dhparam.pem

# Update DocuSeal environment for HTTPS
echo "⚙️  Updating DocuSeal environment..."
cd ~/docuseal-onprem

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update environment variables for HTTPS
sed -i 's/FORCE_SSL=false/FORCE_SSL=true/' .env
sed -i 's/DEFAULT_URL_HOST=192.168.0.100/DEFAULT_URL_HOST=sign.kredit.my/' .env
sed -i 's/DEFAULT_URL_PORT=3001/DEFAULT_URL_PORT=443/' .env

# Add HTTPS port if not present
if ! grep -q "HTTPS_PORT" .env; then
    echo "HTTPS_PORT=443" >> .env
fi

# Update docker-compose.yml to expose port 443
echo "🐳 Updating Docker Compose configuration..."
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)

# Update nginx configuration
echo "🌐 Updating Nginx configuration..."
cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Copy the new HTTPS-enabled nginx configuration
cat > nginx/nginx.conf << 'EOF'
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
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
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
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
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
        
        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        
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

# Update docker-compose.yml to mount SSL certificates and expose port 443
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  docuseal:
    image: docuseal/docuseal:latest
    container_name: docuseal
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://docuseal:${POSTGRES_PASSWORD}@postgres:5432/docuseal
      - SECRET_KEY_BASE=${SECRET_KEY_BASE}
      - FORCE_SSL=${FORCE_SSL:-true}
      - DEFAULT_URL_HOST=${DEFAULT_URL_HOST:-sign.kredit.my}
      - DEFAULT_URL_PORT=${DEFAULT_URL_PORT:-443}
      - RAILS_HOST=${RAILS_HOST:-sign.kredit.my}
      - ACTION_MAILER_DEFAULT_URL_HOST=${ACTION_MAILER_DEFAULT_URL_HOST:-sign.kredit.my}
      - ACTION_MAILER_DEFAULT_URL_PORT=${ACTION_MAILER_DEFAULT_URL_PORT:-443}
      - WEBHOOK_URL=${WEBHOOK_URL}
    volumes:
      - ./storage:/data/storage
      - ./public:/data/public
    depends_on:
      - postgres
    networks:
      - docuseal_network

  nginx:
    image: nginx:alpine
    container_name: docuseal-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./public:/data/public:ro
      - /etc/ssl/certs/sign.kredit.my.crt:/etc/ssl/certs/sign.kredit.my.crt:ro
      - /etc/ssl/private/sign.kredit.my.key:/etc/ssl/private/sign.kredit.my.key:ro
      - /etc/ssl/certs/dhparam.pem:/etc/ssl/certs/dhparam.pem:ro
      - /var/log/nginx:/var/log/nginx
    depends_on:
      - docuseal
    networks:
      - docuseal_network

  postgres:
    image: postgres:15
    container_name: docuseal-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=docuseal
      - POSTGRES_USER=docuseal
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - ./postgres/data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - docuseal_network

networks:
  docuseal_network:
    driver: bridge

volumes:
  postgres_data:
EOF

echo "🚀 Starting DocuSeal with HTTPS..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Test HTTPS connection
echo "🧪 Testing HTTPS connection..."
if curl -k -s https://sign.kredit.my/health > /dev/null; then
    echo "✅ HTTPS is working!"
else
    echo "❌ HTTPS test failed. Check logs:"
    docker-compose logs nginx
fi

# Set up automatic certificate renewal
echo "🔄 Setting up automatic certificate renewal..."
$SUDO crontab -l 2>/dev/null | grep -v certbot > /tmp/crontab.tmp || true
echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cd ~/docuseal-onprem && docker-compose restart nginx'" >> /tmp/crontab.tmp
$SUDO crontab /tmp/crontab.tmp
rm /tmp/crontab.tmp

echo ""
echo "🎉 SSL/HTTPS setup completed!"
echo "=================================================="
echo "✅ SSL certificate generated for sign.kredit.my"
echo "✅ Nginx configured for HTTPS with HTTP redirect"
echo "✅ DocuSeal configured to use HTTPS"
echo "✅ Automatic certificate renewal set up"
echo ""
echo "🌐 Your DocuSeal is now available at:"
echo "   https://sign.kredit.my"
echo ""
echo "📋 Next steps:"
echo "   1. Test the HTTPS connection in your browser"
echo "   2. Update any bookmarks or integrations to use HTTPS"
echo "   3. Update webhook URLs in your applications"
echo ""
echo "🔧 Certificate will auto-renew. Check renewal with:"
echo "   sudo certbot renew --dry-run"
