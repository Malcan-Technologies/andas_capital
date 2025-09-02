#!/bin/bash

# Configure UFW Firewall for DocuSeal Internet Access
echo "🔥 Configuring firewall for sign.kredit.my access..."

# Check current status
echo "📋 Current UFW status:"
sudo ufw status numbered

echo ""
echo "🌐 Ensuring web ports are open..."

# Allow HTTP (port 80)
sudo ufw allow 80/tcp comment "HTTP for sign.kredit.my"

# Allow HTTPS (port 443)  
sudo ufw allow 443/tcp comment "HTTPS for sign.kredit.my"

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp comment "SSH access"

# Allow DocuSeal direct access (port 3001) - optional
sudo ufw allow 3001/tcp comment "DocuSeal direct access"

echo ""
echo "📋 Updated UFW status:"
sudo ufw status numbered

echo ""
echo "🔍 Testing local connectivity..."
curl -I http://localhost
curl -I http://localhost:3001

echo ""
echo "✅ Firewall configuration complete!"
echo "📝 If still not accessible externally, check:"
echo "   1. Router port forwarding (80, 443 → 192.168.0.100)"
echo "   2. ISP firewall settings"
echo "   3. DNS propagation (may take up to 48 hours)"
