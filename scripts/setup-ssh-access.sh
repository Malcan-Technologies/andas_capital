#!/bin/bash

# SSH Access Setup Script for New Users
# This script helps add SSH public keys for new users to access VPS and On-Prem servers via Tailscale

set -e

echo "=== SSH Access Setup for New User ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configurations
VPS_IP="100.85.61.82"
VPS_USER="root"
ONPREM_IP="100.76.8.62"
ONPREM_USER="admin-kapital"

echo -e "${YELLOW}Step 1: Select servers to grant access${NC}"
echo "----------------------------------------------"
echo "Which server(s) should the user access?"
echo "1) VPS only (${VPS_USER}@${VPS_IP})"
echo "2) On-Prem only (${ONPREM_USER}@${ONPREM_IP})"
echo "3) Both VPS and On-Prem"
echo ""
read -p "Enter your choice (1-3): " SERVER_CHOICE

case $SERVER_CHOICE in
    1)
        SETUP_VPS=true
        SETUP_ONPREM=false
        ;;
    2)
        SETUP_VPS=false
        SETUP_ONPREM=true
        ;;
    3)
        SETUP_VPS=true
        SETUP_ONPREM=true
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Step 2: Get the new user's SSH public key${NC}"
echo "----------------------------------------------"
echo "The new user needs to generate an SSH key pair if they don't have one:"
echo ""
echo "  ssh-keygen -t ed25519 -C \"user@example.com\""
echo "  # or for RSA:"
echo "  ssh-keygen -t rsa -b 4096 -C \"user@example.com\""
echo ""
echo "Then they should send you their PUBLIC key (the .pub file):"
echo "  cat ~/.ssh/id_ed25519.pub"
echo "  # or"
echo "  cat ~/.ssh/id_rsa.pub"
echo ""
read -p "Paste the user's PUBLIC key here: " USER_PUBLIC_KEY

if [ -z "$USER_PUBLIC_KEY" ]; then
    echo -e "${RED}Error: No public key provided${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Add the public key to server(s)${NC}"
echo "----------------------------------------------"

# Create a temporary file with the public key
TEMP_KEY_FILE=$(mktemp)
echo "$USER_PUBLIC_KEY" > "$TEMP_KEY_FILE"

# Function to add key to a server
add_key_to_server() {
    local SERVER_USER=$1
    local SERVER_IP=$2
    local SERVER_NAME=$3
    
    echo ""
    echo -e "${BLUE}Adding key to ${SERVER_NAME} (${SERVER_USER}@${SERVER_IP})...${NC}"
    
    # SSH into the server and setup
    ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
# Ensure .ssh directory exists with correct permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Ensure authorized_keys file exists with correct permissions
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Backup current authorized_keys
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup.$(date +%Y%m%d_%H%M%S)

echo "Authorized keys backed up successfully"
ENDSSH

    # Add the new key
    cat "$TEMP_KEY_FILE" | ssh ${SERVER_USER}@${SERVER_IP} 'cat >> ~/.ssh/authorized_keys'
    
    echo -e "${GREEN}✓ Public key added successfully to ${SERVER_NAME}!${NC}"
}

# Add key to VPS if selected
if [ "$SETUP_VPS" = true ]; then
    add_key_to_server "$VPS_USER" "$VPS_IP" "VPS"
fi

# Add key to On-Prem if selected
if [ "$SETUP_ONPREM" = true ]; then
    add_key_to_server "$ONPREM_USER" "$ONPREM_IP" "On-Prem Server"
fi

# Clean up
rm "$TEMP_KEY_FILE"

echo ""
echo -e "${GREEN}✓ All keys added successfully!${NC}"
echo ""
echo -e "${YELLOW}Step 4: Instructions for the new user${NC}"
echo "----------------------------------------------"
echo "Send the following to the new user:"
echo ""
echo "---BEGIN INSTRUCTIONS---"
echo ""
echo "Your SSH access has been configured for the Kredit infrastructure."
echo ""
echo "1. Ensure you're connected to the Tailscale network"
echo ""
echo "2. Use these commands to connect:"
echo ""

if [ "$SETUP_VPS" = true ]; then
    echo "   VPS (Cloud Server):"
    echo "   ssh ${VPS_USER}@${VPS_IP}"
    echo ""
fi

if [ "$SETUP_ONPREM" = true ]; then
    echo "   On-Premise Server:"
    echo "   ssh ${ONPREM_USER}@${ONPREM_IP}"
    echo ""
fi

echo "3. If you get 'publickey denied', verify:"
echo "   - Your private key is in ~/.ssh/ (id_ed25519 or id_rsa)"
echo "   - The private key has correct permissions: chmod 600 ~/.ssh/id_ed25519"
echo "   - You're connected to Tailscale: tailscale status"
echo ""
echo "4. Optional: Add to your ~/.ssh/config for easier access:"
echo ""

if [ "$SETUP_VPS" = true ]; then
    echo "   Host kredit-vps"
    echo "       HostName ${VPS_IP}"
    echo "       User ${VPS_USER}"
    echo "       IdentityFile ~/.ssh/id_ed25519"
    echo ""
fi

if [ "$SETUP_ONPREM" = true ]; then
    echo "   Host kredit-onprem"
    echo "       HostName ${ONPREM_IP}"
    echo "       User ${ONPREM_USER}"
    echo "       IdentityFile ~/.ssh/id_ed25519"
    echo ""
fi

echo "   Then connect with:"
if [ "$SETUP_VPS" = true ]; then
    echo "   ssh kredit-vps"
fi
if [ "$SETUP_ONPREM" = true ]; then
    echo "   ssh kredit-onprem"
fi
echo ""
echo "---END INSTRUCTIONS---"
echo ""
echo -e "${GREEN}Setup complete!${NC}"

