#!/bin/bash

# SSH Access Audit Script
# This script provides comprehensive auditing of SSH access across servers

set -e

echo "=== SSH Access Audit Tool ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Server configurations
VPS_IP="100.85.61.82"
VPS_USER="root"
ONPREM_IP="100.76.8.62"
ONPREM_USER="admin-kapital"

# Output file with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="ssh_access_audit_${TIMESTAMP}.txt"

echo "Generating audit report..."
echo ""

# Function to audit a server
audit_server() {
    local SERVER_USER=$1
    local SERVER_IP=$2
    local SERVER_NAME=$3
    
    echo "" | tee -a "$REPORT_FILE"
    echo "========================================" | tee -a "$REPORT_FILE"
    echo -e "${BLUE}SERVER: ${SERVER_NAME}${NC}" | tee -a "$REPORT_FILE"
    echo "Host: ${SERVER_USER}@${SERVER_IP}" | tee -a "$REPORT_FILE"
    echo "========================================" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # Check connectivity
    if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} 'exit' 2>/dev/null; then
        echo -e "${RED}✗ Cannot connect to ${SERVER_NAME}${NC}" | tee -a "$REPORT_FILE"
        return 1
    fi
    
    echo -e "${GREEN}✓ Connection successful${NC}" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # System info
    echo -e "${CYAN}System Information:${NC}" | tee -a "$REPORT_FILE"
    echo "-------------------" | tee -a "$REPORT_FILE"
    ssh ${SERVER_USER}@${SERVER_IP} '
        echo "Hostname: $(hostname)"
        echo "OS: $(uname -s)"
        echo "Kernel: $(uname -r)"
        echo "Uptime: $(uptime -p 2>/dev/null || uptime)"
    ' | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # SSH daemon config
    echo -e "${CYAN}SSH Configuration:${NC}" | tee -a "$REPORT_FILE"
    echo "-------------------" | tee -a "$REPORT_FILE"
    ssh ${SERVER_USER}@${SERVER_IP} '
        echo "PubkeyAuthentication: $(grep "^PubkeyAuthentication" /etc/ssh/sshd_config || echo "default (yes)")"
        echo "PasswordAuthentication: $(grep "^PasswordAuthentication" /etc/ssh/sshd_config || echo "default (yes)")"
        echo "PermitRootLogin: $(grep "^PermitRootLogin" /etc/ssh/sshd_config || echo "default (yes)")"
    ' | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # Authorized keys
    echo -e "${CYAN}Authorized SSH Keys:${NC}" | tee -a "$REPORT_FILE"
    echo "--------------------" | tee -a "$REPORT_FILE"
    local KEY_COUNT=$(ssh ${SERVER_USER}@${SERVER_IP} 'wc -l < ~/.ssh/authorized_keys 2>/dev/null || echo 0')
    echo "Total keys: ${KEY_COUNT}" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    if [ "$KEY_COUNT" -gt 0 ]; then
        ssh ${SERVER_USER}@${SERVER_IP} '
            i=1
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    # Extract key type
                    key_type=$(echo "$line" | awk "{print \$1}")
                    
                    # Extract comment (usually email)
                    comment=$(echo "$line" | awk "{print \$NF}")
                    
                    # Get key fingerprint
                    fingerprint=$(echo "$line" | ssh-keygen -lf - 2>/dev/null | awk "{print \$2}" || echo "N/A")
                    
                    echo "Key #${i}:"
                    echo "  Type: ${key_type}"
                    echo "  Comment: ${comment}"
                    echo "  Fingerprint: ${fingerprint}"
                    echo ""
                    i=$((i + 1))
                fi
            done < ~/.ssh/authorized_keys
        ' | tee -a "$REPORT_FILE"
    fi
    
    # Recent SSH logins
    echo -e "${CYAN}Recent SSH Login Activity (Last 20):${NC}" | tee -a "$REPORT_FILE"
    echo "-------------------------------------" | tee -a "$REPORT_FILE"
    ssh ${SERVER_USER}@${SERVER_IP} 'last -20 | grep -E "pts|tty" | head -20' | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # Current SSH sessions
    echo -e "${CYAN}Current SSH Sessions:${NC}" | tee -a "$REPORT_FILE"
    echo "---------------------" | tee -a "$REPORT_FILE"
    ssh ${SERVER_USER}@${SERVER_IP} 'who' | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # Failed login attempts
    echo -e "${CYAN}Recent Failed Login Attempts:${NC}" | tee -a "$REPORT_FILE"
    echo "------------------------------" | tee -a "$REPORT_FILE"
    ssh ${SERVER_USER}@${SERVER_IP} '
        if [ -f /var/log/auth.log ]; then
            grep "Failed password" /var/log/auth.log 2>/dev/null | tail -10 || echo "No failed attempts found"
        elif [ -f /var/log/secure ]; then
            grep "Failed password" /var/log/secure 2>/dev/null | tail -10 || echo "No failed attempts found"
        else
            echo "Auth log not accessible"
        fi
    ' | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # Backup history
    echo -e "${CYAN}Authorized Keys Backup History:${NC}" | tee -a "$REPORT_FILE"
    echo "--------------------------------" | tee -a "$REPORT_FILE"
    ssh ${SERVER_USER}@${SERVER_IP} '
        backup_count=$(ls ~/.ssh/authorized_keys.backup.* 2>/dev/null | wc -l)
        echo "Total backups: ${backup_count}"
        if [ ${backup_count} -gt 0 ]; then
            echo ""
            echo "Most recent backups:"
            ls -lht ~/.ssh/authorized_keys.backup.* 2>/dev/null | head -5
        fi
    ' | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
}

# Generate report header
{
    echo "========================================"
    echo "     SSH ACCESS AUDIT REPORT"
    echo "========================================"
    echo "Generated: $(date)"
    echo "Auditor: $(whoami)"
    echo "========================================"
} > "$REPORT_FILE"

# Audit VPS
audit_server "$VPS_USER" "$VPS_IP" "VPS (Cloud Server)"

# Audit On-Prem
audit_server "$ONPREM_USER" "$ONPREM_IP" "On-Premise Server"

# Summary
echo "" | tee -a "$REPORT_FILE"
echo "========================================" | tee -a "$REPORT_FILE"
echo -e "${MAGENTA}AUDIT SUMMARY${NC}" | tee -a "$REPORT_FILE"
echo "========================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

VPS_KEYS=$(ssh ${VPS_USER}@${VPS_IP} 'wc -l < ~/.ssh/authorized_keys 2>/dev/null || echo 0')
ONPREM_KEYS=$(ssh ${ONPREM_USER}@${ONPREM_IP} 'wc -l < ~/.ssh/authorized_keys 2>/dev/null || echo 0')
TOTAL_KEYS=$((VPS_KEYS + ONPREM_KEYS))

echo "Total authorized keys across all servers: ${TOTAL_KEYS}" | tee -a "$REPORT_FILE"
echo "  - VPS: ${VPS_KEYS} keys" | tee -a "$REPORT_FILE"
echo "  - On-Prem: ${ONPREM_KEYS} keys" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Recommendations
echo -e "${YELLOW}SECURITY RECOMMENDATIONS:${NC}" | tee -a "$REPORT_FILE"
echo "------------------------" | tee -a "$REPORT_FILE"
echo "1. Review all authorized keys and remove any that are no longer needed" | tee -a "$REPORT_FILE"
echo "2. Ensure each key has a meaningful comment (email) for identification" | tee -a "$REPORT_FILE"
echo "3. Monitor failed login attempts regularly" | tee -a "$REPORT_FILE"
echo "4. Keep regular backups of authorized_keys (done automatically by scripts)" | tee -a "$REPORT_FILE"
echo "5. Implement key rotation policy (recommend annually)" | tee -a "$REPORT_FILE"
echo "6. Disable PasswordAuthentication in SSH config if not already disabled" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "========================================" | tee -a "$REPORT_FILE"
echo "End of Audit Report" | tee -a "$REPORT_FILE"
echo "========================================" | tee -a "$REPORT_FILE"

echo ""
echo -e "${GREEN}✓ Audit complete!${NC}"
echo ""
echo -e "Full report saved to: ${CYAN}${REPORT_FILE}${NC}"
echo ""
echo "To view the report:"
echo "  cat ${REPORT_FILE}"
echo ""
echo "To share the report:"
echo "  cat ${REPORT_FILE} | pbcopy    # Copy to clipboard (macOS)"
echo ""

