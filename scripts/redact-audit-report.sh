#!/bin/bash

# Audit Report Redaction Script
# Automatically redacts sensitive information from audit reports

set -e

echo "=== Audit Report Redaction Tool ==="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}This tool creates shareable versions of audit reports by redacting sensitive information.${NC}"
echo ""
echo "What will be redacted:"
echo "  • Internal IP addresses (Tailscale IPs)"
echo "  • Server paths (/etc/...)"
echo "  • Usernames (root, admin-kapital)"
echo "  • SSH public keys"
echo "  • Email addresses"
echo ""
echo "What will be preserved:"
echo "  ✓ Certificate details (subject, issuer, dates)"
echo "  ✓ Expiry information"
echo "  ✓ TLS configuration"
echo "  ✓ Security compliance status"
echo ""

# Select file to redact
echo -e "${YELLOW}Select audit file to redact:${NC}"
echo ""

# List available audit files
SSL_AUDITS=$(ls ssl_cert_audit_*.txt 2>/dev/null | grep -v "REDACTED\|SHAREABLE")
SSH_AUDITS=$(ls ssh_access_audit_*.txt 2>/dev/null | grep -v "REDACTED\|SHAREABLE")

if [ -n "$SSL_AUDITS" ]; then
    echo "SSL Certificate Audits:"
    i=1
    for file in $SSL_AUDITS; do
        size=$(ls -lh "$file" | awk '{print $5}')
        date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d' ' -f1,2)
        echo "  $i) $file ($size, $date)"
        SSL_FILES[$i]=$file
        i=$((i + 1))
    done
    echo ""
fi

if [ -n "$SSH_AUDITS" ]; then
    echo "SSH Access Audits:"
    for file in $SSH_AUDITS; do
        size=$(ls -lh "$file" | awk '{print $5}')
        date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d' ' -f1,2)
        echo "  $i) $file ($size, $date)"
        SSH_FILES[$i]=$file
        i=$((i + 1))
    done
    echo ""
fi

if [ -z "$SSL_AUDITS" ] && [ -z "$SSH_AUDITS" ]; then
    echo -e "${RED}No audit files found in current directory.${NC}"
    echo ""
    echo "Generate an audit first:"
    echo "  bash scripts/audit-ssl-certs.sh"
    echo "  bash scripts/audit-ssh-access.sh"
    exit 1
fi

read -p "Enter file number: " FILE_NUM

# Get selected file
if [ -n "${SSL_FILES[$FILE_NUM]}" ]; then
    INPUT_FILE="${SSL_FILES[$FILE_NUM]}"
elif [ -n "${SSH_FILES[$FILE_NUM]}" ]; then
    INPUT_FILE="${SSH_FILES[$FILE_NUM]}"
else
    echo -e "${RED}Invalid selection${NC}"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}File not found: $INPUT_FILE${NC}"
    exit 1
fi

# Generate output filename
OUTPUT_FILE="${INPUT_FILE%.txt}_SHAREABLE.txt"

echo ""
echo -e "${BLUE}Redacting: ${INPUT_FILE}${NC}"
echo -e "${BLUE}Output: ${OUTPUT_FILE}${NC}"
echo ""

# Perform redaction
cat "$INPUT_FILE" | \
    # Redact Tailscale IPs
    sed -E 's/100\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[INTERNAL_IP]/g' | \
    # Redact other private IPs
    sed -E 's/192\.168\.[0-9]{1,3}\.[0-9]{1,3}/[INTERNAL_IP]/g' | \
    sed -E 's/10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[INTERNAL_IP]/g' | \
    sed -E 's/172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3}/[INTERNAL_IP]/g' | \
    # Redact system paths
    sed -E 's/\/etc\/[^ ]*/[SERVER_PATH]/g' | \
    sed -E 's/\/opt\/[^ ]*/[SERVER_PATH]/g' | \
    sed -E 's/\/var\/[^ ]*/[SERVER_PATH]/g' | \
    sed -E 's/\/home\/[^ ]*/[SERVER_PATH]/g' | \
    # Redact usernames
    sed -E 's/(root|admin-kapital)@/[USER]@/g' | \
    sed -E 's/User (root|admin-kapital)/User [USER]/g' | \
    # Redact email addresses (keep format but hide actual emails)
    sed -E 's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/[EMAIL_REDACTED]/g' | \
    # Redact SSH public keys (keep type, remove key content)
    sed -E 's/(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp256) [A-Za-z0-9+\/=]{50,}/\1 [KEY_REDACTED]/g' | \
    # Redact hostnames
    sed -E 's/Hostname: [^ ]*/Hostname: [HOSTNAME]/g' \
    > "$OUTPUT_FILE"

# Add redaction notice at the top
{
    echo "==============================================="
    echo "  REDACTED AUDIT REPORT - SHAREABLE VERSION"
    echo "==============================================="
    echo ""
    echo "This report has been automatically redacted to remove:"
    echo "  • Internal IP addresses"
    echo "  • Server paths and hostnames"
    echo "  • User credentials"
    echo "  • Email addresses"
    echo "  • SSH keys"
    echo ""
    echo "Original file: $INPUT_FILE"
    echo "Redacted on: $(date)"
    echo ""
    echo "==============================================="
    echo ""
    cat "$OUTPUT_FILE"
} > "$OUTPUT_FILE.tmp" && mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"

echo -e "${GREEN}✓ Redaction complete!${NC}"
echo ""
echo "Files:"
echo "  Original: ${INPUT_FILE}"
echo "  Redacted: ${OUTPUT_FILE}"
echo ""

# Show file sizes
ORIGINAL_SIZE=$(ls -lh "$INPUT_FILE" | awk '{print $5}')
REDACTED_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo "Size: ${ORIGINAL_SIZE} → ${REDACTED_SIZE}"
echo ""

# Preview redacted content
echo -e "${YELLOW}Preview (first 30 lines):${NC}"
echo "---"
head -30 "$OUTPUT_FILE"
echo "..."
echo "---"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the redacted file: cat ${OUTPUT_FILE}"
echo "2. Manually verify no sensitive info remains"
echo "3. Look for any patterns the script might have missed"
echo "4. Add any additional context needed for auditors"
echo ""

echo -e "${BLUE}Manual review checklist:${NC}"
echo "  [ ] No IP addresses visible"
echo "  [ ] No internal paths exposed"
echo "  [ ] No SSH keys or credentials"
echo "  [ ] Certificate info preserved (if SSL audit)"
echo "  [ ] Security status preserved"
echo "  [ ] Add any context or notes for recipient"
echo ""

echo -e "${GREEN}Redacted file ready for sharing: ${OUTPUT_FILE}${NC}"

