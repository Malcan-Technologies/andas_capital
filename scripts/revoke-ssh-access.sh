#!/bin/bash

# SSH Access Revocation Script
# This script helps remove SSH public keys from servers to revoke access

set -e

echo "=== SSH Access Revocation Tool ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Server configurations
VPS_IP="100.85.61.82"
VPS_USER="root"
ONPREM_IP="100.76.8.62"
ONPREM_USER="admin-kapital"

# Function to list keys from a server
list_keys_from_server() {
    local SERVER_USER=$1
    local SERVER_IP=$2
    local SERVER_NAME=$3
    
    echo -e "${BLUE}Authorized keys on ${SERVER_NAME} (${SERVER_USER}@${SERVER_IP}):${NC}"
    echo "----------------------------------------"
    
    ssh ${SERVER_USER}@${SERVER_IP} 'grep -n "" ~/.ssh/authorized_keys | cat -n' 2>/dev/null || {
        echo -e "${RED}Could not retrieve keys from ${SERVER_NAME}${NC}"
        return 1
    }
    echo ""
}

# Function to revoke key from a server
revoke_key_from_server() {
    local SERVER_USER=$1
    local SERVER_IP=$2
    local SERVER_NAME=$3
    local LINE_NUMBER=$4
    
    echo -e "${YELLOW}Revoking key line ${LINE_NUMBER} from ${SERVER_NAME}...${NC}"
    
    # Backup first
    ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup.$(date +%Y%m%d_%H%M%S)
echo "Backup created"
ENDSSH
    
    # Remove the specified line
    ssh ${SERVER_USER}@${SERVER_IP} "sed -i.tmp '${LINE_NUMBER}d' ~/.ssh/authorized_keys && rm ~/.ssh/authorized_keys.tmp"
    
    echo -e "${GREEN}✓ Key revoked from ${SERVER_NAME}${NC}"
}

# Function to revoke by key content/pattern
revoke_key_by_pattern() {
    local SERVER_USER=$1
    local SERVER_IP=$2
    local SERVER_NAME=$3
    local PATTERN=$4
    
    echo -e "${YELLOW}Searching for keys matching pattern in ${SERVER_NAME}...${NC}"
    
    # Show matching keys
    local MATCHES=$(ssh ${SERVER_USER}@${SERVER_IP} "grep -n '${PATTERN}' ~/.ssh/authorized_keys" 2>/dev/null)
    
    if [ -z "$MATCHES" ]; then
        echo -e "${RED}No matching keys found on ${SERVER_NAME}${NC}"
        return 1
    fi
    
    echo "Found matching keys:"
    echo "$MATCHES"
    echo ""
    read -p "Remove these keys from ${SERVER_NAME}? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" = "yes" ]; then
        # Backup first
        ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup.$(date +%Y%m%d_%H%M%S)
echo "Backup created"
ENDSSH
        
        # Remove matching lines
        ssh ${SERVER_USER}@${SERVER_IP} "sed -i.tmp '/${PATTERN}/d' ~/.ssh/authorized_keys && rm ~/.ssh/authorized_keys.tmp"
        
        echo -e "${GREEN}✓ Matching keys revoked from ${SERVER_NAME}${NC}"
    else
        echo "Skipped ${SERVER_NAME}"
    fi
}

# Main menu
echo -e "${YELLOW}Select server to manage:${NC}"
echo "1) VPS (${VPS_USER}@${VPS_IP})"
echo "2) On-Prem (${ONPREM_USER}@${ONPREM_IP})"
echo "3) Both servers"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " SERVER_CHOICE

case $SERVER_CHOICE in
    1)
        MANAGE_VPS=true
        MANAGE_ONPREM=false
        ;;
    2)
        MANAGE_VPS=false
        MANAGE_ONPREM=true
        ;;
    3)
        MANAGE_VPS=true
        MANAGE_ONPREM=true
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Select revocation method:${NC}"
echo "1) List all keys and revoke by line number"
echo "2) Revoke by searching for email/comment"
echo "3) Revoke by partial key match"
echo "4) View authorized keys (no revocation)"
echo "5) Restore from backup"
echo ""
read -p "Enter your choice (1-5): " METHOD_CHOICE

case $METHOD_CHOICE in
    1)
        # Revoke by line number
        echo ""
        if [ "$MANAGE_VPS" = true ]; then
            list_keys_from_server "$VPS_USER" "$VPS_IP" "VPS"
            read -p "Enter line number to revoke from VPS (or 0 to skip): " VPS_LINE
            if [ "$VPS_LINE" != "0" ]; then
                revoke_key_from_server "$VPS_USER" "$VPS_IP" "VPS" "$VPS_LINE"
            fi
        fi
        
        if [ "$MANAGE_ONPREM" = true ]; then
            list_keys_from_server "$ONPREM_USER" "$ONPREM_IP" "On-Prem"
            read -p "Enter line number to revoke from On-Prem (or 0 to skip): " ONPREM_LINE
            if [ "$ONPREM_LINE" != "0" ]; then
                revoke_key_from_server "$ONPREM_USER" "$ONPREM_IP" "On-Prem" "$ONPREM_LINE"
            fi
        fi
        ;;
        
    2)
        # Revoke by email/comment
        echo ""
        read -p "Enter email or comment to search for: " SEARCH_PATTERN
        
        if [ "$MANAGE_VPS" = true ]; then
            revoke_key_by_pattern "$VPS_USER" "$VPS_IP" "VPS" "$SEARCH_PATTERN"
        fi
        
        if [ "$MANAGE_ONPREM" = true ]; then
            revoke_key_by_pattern "$ONPREM_USER" "$ONPREM_IP" "On-Prem" "$SEARCH_PATTERN"
        fi
        ;;
        
    3)
        # Revoke by partial key
        echo ""
        echo "Enter a unique portion of the SSH key to search for"
        read -p "(e.g., last 20 characters of the key): " KEY_PATTERN
        
        if [ "$MANAGE_VPS" = true ]; then
            revoke_key_by_pattern "$VPS_USER" "$VPS_IP" "VPS" "$KEY_PATTERN"
        fi
        
        if [ "$MANAGE_ONPREM" = true ]; then
            revoke_key_by_pattern "$ONPREM_USER" "$ONPREM_IP" "On-Prem" "$KEY_PATTERN"
        fi
        ;;
        
    4)
        # View only
        echo ""
        if [ "$MANAGE_VPS" = true ]; then
            list_keys_from_server "$VPS_USER" "$VPS_IP" "VPS"
        fi
        
        if [ "$MANAGE_ONPREM" = true ]; then
            list_keys_from_server "$ONPREM_USER" "$ONPREM_IP" "On-Prem"
        fi
        ;;
        
    5)
        # Restore from backup
        echo ""
        echo -e "${YELLOW}Available backups:${NC}"
        
        if [ "$MANAGE_VPS" = true ]; then
            echo ""
            echo -e "${BLUE}VPS Backups:${NC}"
            ssh ${VPS_USER}@${VPS_IP} 'ls -lht ~/.ssh/authorized_keys.backup.* 2>/dev/null | head -10' || echo "No backups found"
            echo ""
            read -p "Enter backup filename to restore on VPS (or 'skip'): " VPS_BACKUP
            
            if [ "$VPS_BACKUP" != "skip" ] && [ -n "$VPS_BACKUP" ]; then
                ssh ${VPS_USER}@${VPS_IP} "cp ~/.ssh/${VPS_BACKUP} ~/.ssh/authorized_keys"
                echo -e "${GREEN}✓ Backup restored on VPS${NC}"
            fi
        fi
        
        if [ "$MANAGE_ONPREM" = true ]; then
            echo ""
            echo -e "${BLUE}On-Prem Backups:${NC}"
            ssh ${ONPREM_USER}@${ONPREM_IP} 'ls -lht ~/.ssh/authorized_keys.backup.* 2>/dev/null | head -10' || echo "No backups found"
            echo ""
            read -p "Enter backup filename to restore on On-Prem (or 'skip'): " ONPREM_BACKUP
            
            if [ "$ONPREM_BACKUP" != "skip" ] && [ -n "$ONPREM_BACKUP" ]; then
                ssh ${ONPREM_USER}@${ONPREM_IP} "cp ~/.ssh/${ONPREM_BACKUP} ~/.ssh/authorized_keys"
                echo -e "${GREEN}✓ Backup restored on On-Prem${NC}"
            fi
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Operation complete!${NC}"
echo ""
echo -e "${CYAN}Tips:${NC}"
echo "- Backups are automatically created before any revocation"
echo "- Backup format: authorized_keys.backup.YYYYMMDD_HHMMSS"
echo "- To view current keys anytime, re-run this script and choose option 4"
echo "- To restore a backup, re-run this script and choose option 5"

