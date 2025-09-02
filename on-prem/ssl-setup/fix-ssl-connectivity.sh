#!/bin/bash

# Fix SSL connectivity issues for Let's Encrypt
# Run this script on your on-premises server

set -e

echo "🔍 Diagnosing SSL connectivity issues..."
echo "========================================"

# Check if port 80 is open
echo "📡 Checking port 80 connectivity..."
if netstat -tlnp | grep -q ":80 "; then
    echo "✅ Something is listening on port 80"
    netstat -tlnp | grep ":80 "
else
    echo "❌ Nothing is listening on port 80"
fi

# Check firewall status
echo ""
echo "🔥 Checking firewall status..."
if command -v ufw >/dev/null 2>&1; then
    echo "UFW firewall status:"
    ufw status || echo "UFW status check failed"
else
    echo "UFW not installed"
fi

# Check iptables
echo ""
echo "🛡️  Checking iptables rules..."
iptables -L INPUT -n | grep -E "(80|443|ACCEPT|DROP)" || echo "No specific rules for ports 80/443"

# Test external connectivity
echo ""
echo "🌐 Testing external connectivity to port 80..."
timeout 10 nc -zv sign.kredit.my 80 2>&1 || echo "❌ Cannot connect to sign.kredit.my:80 from external"

# Check if any service is blocking port 80
echo ""
echo "🔍 Checking what might be using port 80..."
lsof -i :80 2>/dev/null || echo "No processes found using port 80"

echo ""
echo "🔧 Applying fixes..."
echo "==================="

# Stop any nginx service that might be running on the host
echo "🛑 Stopping any host nginx service..."
systemctl stop nginx 2>/dev/null || echo "No host nginx service running"
systemctl disable nginx 2>/dev/null || echo "Nginx service not enabled"

# Open firewall ports
echo "🔓 Opening firewall ports..."
if command -v ufw >/dev/null 2>&1; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp  # Ensure SSH stays open
    echo "✅ UFW rules updated"
else
    echo "UFW not available, checking iptables..."
    # Add iptables rules if needed
    iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || echo "Could not add iptables rule for port 80"
    iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || echo "Could not add iptables rule for port 443"
fi

# Test port 80 availability
echo ""
echo "🧪 Testing port 80 availability..."
if nc -l -p 80 -w 1 </dev/null 2>/dev/null; then
    echo "✅ Port 80 is available"
else
    echo "❌ Port 80 is still not available"
    echo "🔍 Checking what's using port 80:"
    lsof -i :80 2>/dev/null || netstat -tlnp | grep ":80 "
fi

echo ""
echo "🎯 Next steps:"
echo "=============="
echo "1. Ensure your router/cloud provider allows inbound traffic on ports 80 and 443"
echo "2. If using a cloud provider (AWS, GCP, Azure), check security groups/firewall rules"
echo "3. Run the SSL setup script again: sudo ~/setup-ssl-docuseal-final.sh"
echo ""
echo "🔍 To test external connectivity manually:"
echo "   curl -I http://sign.kredit.my/"
echo "   telnet sign.kredit.my 80"
