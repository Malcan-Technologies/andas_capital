#!/bin/bash

# =============================================================================
# Cloudflare Tunnel Setup Script for On-Prem Signing Services
# =============================================================================
#
# This script automates the installation and configuration of Cloudflare Tunnel
# for on-prem signing services (DocuSeal, Signing Orchestrator, MTSA).
#
# Usage:
#   ./setup-cloudflare-tunnel.sh [OPTIONS]
#
# Options:
#   --client-name NAME    Client identifier for the tunnel (required)
#   --domain DOMAIN       Domain to use (e.g., clientdomain.com) (required)
#   --subdomain SUB       Subdomain for signing (default: sign)
#   --skip-install        Skip cloudflared installation (if already installed)
#   --skip-auth           Skip authentication (if already authenticated)
#   --help                Show this help message
#
# Example:
#   ./setup-cloudflare-tunnel.sh --client-name acme --domain acme.com.my
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SUBDOMAIN="sign"
SKIP_INSTALL=false
SKIP_AUTH=false
CLIENT_NAME=""
DOMAIN=""

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show help
show_help() {
    head -30 "$0" | tail -25
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --client-name)
            CLIENT_NAME="$2"
            shift 2
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --subdomain)
            SUBDOMAIN="$2"
            shift 2
            ;;
        --skip-install)
            SKIP_INSTALL=true
            shift
            ;;
        --skip-auth)
            SKIP_AUTH=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate required arguments
if [[ -z "$CLIENT_NAME" ]]; then
    log_error "Missing required argument: --client-name"
    echo "Usage: $0 --client-name NAME --domain DOMAIN"
    exit 1
fi

if [[ -z "$DOMAIN" ]]; then
    log_error "Missing required argument: --domain"
    echo "Usage: $0 --client-name NAME --domain DOMAIN"
    exit 1
fi

TUNNEL_NAME="${CLIENT_NAME}-onprem"
FULL_HOSTNAME="${SUBDOMAIN}.${DOMAIN}"

echo ""
echo "=============================================="
echo "  Cloudflare Tunnel Setup"
echo "=============================================="
echo ""
echo "  Client Name:  $CLIENT_NAME"
echo "  Tunnel Name:  $TUNNEL_NAME"
echo "  Domain:       $DOMAIN"
echo "  Hostname:     $FULL_HOSTNAME"
echo ""
echo "=============================================="
echo ""

# Step 1: Install cloudflared
if [[ "$SKIP_INSTALL" == "false" ]]; then
    log_info "Step 1: Installing cloudflared..."
    
    if command -v cloudflared &> /dev/null; then
        CURRENT_VERSION=$(cloudflared --version | head -1)
        log_warn "cloudflared is already installed: $CURRENT_VERSION"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping installation"
        else
            curl -L --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
            sudo dpkg -i /tmp/cloudflared.deb
            rm /tmp/cloudflared.deb
        fi
    else
        curl -L --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i /tmp/cloudflared.deb
        rm /tmp/cloudflared.deb
    fi
    
    log_success "cloudflared installed: $(cloudflared --version | head -1)"
else
    log_info "Step 1: Skipping cloudflared installation"
fi

# Step 2: Authenticate with Cloudflare
if [[ "$SKIP_AUTH" == "false" ]]; then
    log_info "Step 2: Authenticating with Cloudflare..."
    
    if [[ -f ~/.cloudflared/cert.pem ]]; then
        log_warn "Already authenticated (cert.pem exists)"
        read -p "Do you want to re-authenticate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cloudflared tunnel login
        fi
    else
        log_info "Opening browser for authentication..."
        log_info "Please log in and select the domain: $DOMAIN"
        cloudflared tunnel login
    fi
    
    if [[ -f ~/.cloudflared/cert.pem ]]; then
        log_success "Authentication successful"
    else
        log_error "Authentication failed - cert.pem not found"
        exit 1
    fi
else
    log_info "Step 2: Skipping authentication"
fi

# Step 3: Create tunnel
log_info "Step 3: Creating tunnel '$TUNNEL_NAME'..."

# Check if tunnel already exists
EXISTING_TUNNEL=$(cloudflared tunnel list | grep "$TUNNEL_NAME" || true)
if [[ -n "$EXISTING_TUNNEL" ]]; then
    log_warn "Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(echo "$EXISTING_TUNNEL" | awk '{print $1}')
    log_info "Using existing tunnel ID: $TUNNEL_ID"
else
    cloudflared tunnel create "$TUNNEL_NAME"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    log_success "Tunnel created with ID: $TUNNEL_ID"
fi

# Step 4: Create DNS route
log_info "Step 4: Creating DNS route for $FULL_HOSTNAME..."

cloudflared tunnel route dns "$TUNNEL_NAME" "$FULL_HOSTNAME" 2>&1 || true
log_success "DNS route configured for $FULL_HOSTNAME"

# Step 5: Create credentials file from tunnel token
log_info "Step 5: Setting up credentials..."

# Get tunnel token and create credentials JSON
TUNNEL_TOKEN=$(cloudflared tunnel token "$TUNNEL_NAME")
DECODED_TOKEN=$(echo "$TUNNEL_TOKEN" | base64 -d)

# Extract values from token
ACCOUNT_TAG=$(echo "$DECODED_TOKEN" | jq -r '.a')
TUNNEL_SECRET=$(echo "$DECODED_TOKEN" | jq -r '.s')

# Create credentials file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/${TUNNEL_ID}.json << EOF
{
  "AccountTag": "$ACCOUNT_TAG",
  "TunnelSecret": "$TUNNEL_SECRET",
  "TunnelID": "$TUNNEL_ID"
}
EOF
chmod 600 ~/.cloudflared/${TUNNEL_ID}.json

log_success "Credentials file created"

# Step 6: Create config file
log_info "Step 6: Creating configuration file..."

cat > ~/.cloudflared/config.yml << EOF
# Cloudflare Tunnel Configuration
# Generated by setup-cloudflare-tunnel.sh
# Client: $CLIENT_NAME
# Domain: $FULL_HOSTNAME

tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/${TUNNEL_ID}.json

# Note: Routes are managed in Cloudflare Dashboard
# This minimal config is used by the systemd service
EOF

log_success "Configuration file created"

# Step 7: Install as system service
log_info "Step 7: Installing as system service..."

# Create system config directory
sudo mkdir -p /etc/cloudflared

# Copy files to system directory
sudo cp ~/.cloudflared/config.yml /etc/cloudflared/
sudo cp ~/.cloudflared/${TUNNEL_ID}.json /etc/cloudflared/
sudo cp ~/.cloudflared/cert.pem /etc/cloudflared/

# Update config to use system paths
sudo sed -i "s|/home/.*/.cloudflared/|/etc/cloudflared/|g" /etc/cloudflared/config.yml

# Set permissions
sudo chmod 600 /etc/cloudflared/*.json
sudo chmod 600 /etc/cloudflared/cert.pem
sudo chmod 644 /etc/cloudflared/config.yml

# Install service
sudo cloudflared service install

# Start and enable service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

log_success "System service installed and started"

# Step 8: Verify
log_info "Step 8: Verifying installation..."

sleep 3

if sudo systemctl is-active --quiet cloudflared; then
    log_success "cloudflared service is running"
else
    log_error "cloudflared service is not running"
    sudo systemctl status cloudflared
    exit 1
fi

# Check tunnel connection
TUNNEL_INFO=$(cloudflared tunnel info "$TUNNEL_NAME" 2>&1)
if echo "$TUNNEL_INFO" | grep -q "CONNECTOR"; then
    log_success "Tunnel is connected to Cloudflare edge"
else
    log_warn "Tunnel may not be connected yet. Check: cloudflared tunnel info $TUNNEL_NAME"
fi

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "  Tunnel Name:  $TUNNEL_NAME"
echo "  Tunnel ID:    $TUNNEL_ID"
echo "  Hostname:     $FULL_HOSTNAME"
echo ""
echo "  IMPORTANT: You must configure routes in Cloudflare Dashboard!"
echo ""
echo "  Go to: https://one.dash.cloudflare.com/"
echo "  Navigate to: Networks → Tunnels → $TUNNEL_NAME → Public Hostname"
echo ""
echo "  Add these routes IN ORDER (specific paths first, catch-all last):"
echo ""
echo "  | Path              | Service                          |"
echo "  |-------------------|----------------------------------|"
echo "  | orchestrator/*    | http://localhost:4010            |"
echo "  | api/signing/*     | http://localhost:4010            |"
echo "  | MTSAPilot/*       | http://localhost:8080            |"
echo "  | MTSA/*            | http://localhost:8080            |"
echo "  | *                 | http://localhost:3001            |"
echo ""
echo "  Note: Health check at /orchestrator/health works via orchestrator/* route"
echo ""
echo "  After configuring routes, test with:"
echo "    curl https://$FULL_HOSTNAME/"
echo "    curl https://$FULL_HOSTNAME/signing-health"
echo "    curl https://$FULL_HOSTNAME/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl"
echo ""
echo "=============================================="
