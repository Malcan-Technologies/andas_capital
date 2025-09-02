#!/bin/bash

# Quick On-Prem Deployment Wrapper
# This script provides easy access to on-prem deployment from the root directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONPREM_SCRIPTS_DIR="$SCRIPT_DIR/on-prem/scripts"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 On-Premises Deployment Wrapper${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Check if on-prem directory exists
if [ ! -d "$ONPREM_SCRIPTS_DIR" ]; then
    echo "❌ Error: On-prem scripts directory not found at $ONPREM_SCRIPTS_DIR"
    exit 1
fi

# Pass all arguments to the main deployment script
echo -e "${GREEN}📁 Executing: $ONPREM_SCRIPTS_DIR/deploy-all.sh $*${NC}"
echo ""

exec "$ONPREM_SCRIPTS_DIR/deploy-all.sh" "$@"
