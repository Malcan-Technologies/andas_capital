#!/bin/bash

# Deploy Nginx Configuration Only
# Updates nginx.conf on the VPS and reloads the service
# Use this for quick nginx configuration updates

set -e

VPS_HOST="your-vps-host"  # Replace with your actual VPS hostname/IP
VPS_USER="root"           # Replace with your VPS user
NGINX_CONFIG_PATH="/etc/nginx/sites-available/kredit.my"
LOCAL_CONFIG="/Users/ivan/Documents/kapital/config/nginx.conf"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Deploying Nginx Configuration Only${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if local config exists
if [ ! -f "$LOCAL_CONFIG" ]; then
    echo -e "${RED}❌ Local nginx config not found: $LOCAL_CONFIG${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "  Local config: $LOCAL_CONFIG"
echo -e "  VPS host: $VPS_HOST"
echo -e "  Remote path: $NGINX_CONFIG_PATH"
echo ""

# Test local nginx config syntax (if nginx is installed locally)
if command -v nginx &> /dev/null; then
    echo -e "${BLUE}🧪 Testing local nginx configuration...${NC}"
    nginx -t -c "$LOCAL_CONFIG" 2>/dev/null && echo -e "${GREEN}✅ Local config syntax is valid${NC}" || echo -e "${YELLOW}⚠️  Cannot test local config (different paths)${NC}"
    echo ""
fi

# Copy config to VPS
echo -e "${BLUE}📁 Copying nginx configuration to VPS...${NC}"
scp "$LOCAL_CONFIG" "$VPS_USER@$VPS_HOST:$NGINX_CONFIG_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuration copied successfully${NC}"
else
    echo -e "${RED}❌ Failed to copy configuration${NC}"
    exit 1
fi

# Test and reload nginx on VPS
echo ""
echo -e "${BLUE}🔄 Testing and reloading nginx on VPS...${NC}"
ssh "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration test passed"
    echo ""
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
    echo ""
    echo "📊 Nginx status:"
    systemctl status nginx --no-pager -l | head -10
else
    echo "❌ Nginx configuration test failed"
    echo "Please check the configuration and try again"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Nginx configuration deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo -e "  1. Test HTTPS: https://sign.kredit.my"
    echo -e "  2. Test main site: https://kredit.my"
    echo -e "  3. Test admin: https://admin.kredit.my"
    echo -e "  4. Test API: https://api.kredit.my"
    echo ""
    echo -e "${BLUE}💡 To update SSL certificate (if needed):${NC}"
    echo -e "  scp scripts/update-ssl-certificate.sh $VPS_USER@$VPS_HOST:~/"
    echo -e "  ssh $VPS_USER@$VPS_HOST 'sudo ~/update-ssl-certificate.sh'"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
