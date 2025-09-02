#!/bin/bash

# Safety Backup Script
# Creates a backup before any potentially dangerous operations
# Usage: ./create-safety-backup.sh "reason for backup"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️  SAFETY BACKUP SYSTEM${NC}"
echo -e "${BLUE}========================${NC}"
echo ""

REASON="${1:-Manual safety backup}"
echo -e "${YELLOW}📝 Backup reason: ${REASON}${NC}"
echo ""

# Run the comprehensive backup
echo -e "${GREEN}🚀 Creating safety backup...${NC}"
"$(dirname "$0")/deploy-all.sh" backup

echo ""
echo -e "${GREEN}✅ Safety backup completed!${NC}"
echo -e "${BLUE}💡 Your data is now protected before any changes.${NC}"
echo ""
echo -e "${YELLOW}📋 To restore if something goes wrong:${NC}"
echo -e "   ./deploy-all.sh restore <backup-name>"
echo ""
