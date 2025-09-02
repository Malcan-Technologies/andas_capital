#!/bin/bash

# DocuSeal Deployment Testing Script
# Run this on your server after deployment to verify everything works

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/docuseal-onprem"

echo "🧪 DocuSeal Deployment Testing Suite"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo "Testing $test_name..."
    
    if output=$(eval "$test_command" 2>&1); then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "   Output: $output"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Error: $output"
        return 1
    fi
}

echo "1. 🐳 Docker Infrastructure Tests"
echo "--------------------------------"

run_test "Docker service running" "systemctl is-active docker"
run_test "Docker Compose available" "docker compose version"
run_test "DocuSeal containers running" "docker compose ps | grep -q 'Up'"

echo ""
echo "2. 🗄️ Database Tests"
echo "-------------------"

run_test "PostgreSQL container healthy" "docker compose ps docuseal-postgres | grep -q 'healthy'"
run_test "Database connection" "docker compose exec -T docuseal-postgres pg_isready -U docuseal -d docuseal"
run_test_with_output "Database version" "docker compose exec -T docuseal-postgres psql -U docuseal -d docuseal -c 'SELECT version();' -t"

echo ""
echo "3. 🌐 Network & Service Tests"
echo "-----------------------------"

run_test "Nginx proxy healthy" "curl -f http://localhost:8080/health"
run_test "DocuSeal app responding" "curl -f http://localhost:3001/health"
run_test "Port 8080 listening" "netstat -tlnp | grep -q ':8080'"
run_test "Port 3001 listening" "netstat -tlnp | grep -q ':3001'"
run_test "Port 5433 listening" "netstat -tlnp | grep -q ':5433'"

echo ""
echo "4. 📁 File System Tests"
echo "----------------------"

run_test "Storage directories exist" "test -d storage/documents && test -d storage/signed-agreements"
run_test "Storage permissions correct" "test -w storage/documents && test -w storage/signed-agreements"
run_test "Backup directory exists" "test -d postgres/backups"
run_test "Log directory exists" "test -d logs/nginx"

echo ""
echo "5. ⚙️ Configuration Tests"
echo "------------------------"

run_test "Environment file exists" "test -f .env"
run_test "Database password configured" "grep -q 'POSTGRES_PASSWORD=' .env && ! grep -q 'CHANGE_THIS' .env"
run_test "Secret key configured" "grep -q 'SECRET_KEY_BASE=' .env && ! grep -q 'your_secret_key_base_change_this' .env"
run_test "Host configured" "grep -q 'DOCUSEAL_HOST=' .env && ! grep -q 'localhost' .env"

echo ""
echo "6. 💾 Backup System Tests"
echo "-------------------------"

run_test "Backup script exists" "test -x scripts/backup.sh"
run_test "Restore script exists" "test -x scripts/restore.sh"

echo "Testing backup functionality..."
if ./scripts/backup.sh >/dev/null 2>&1; then
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} - Backup creation"
    
    # Check if backup file was created
    if ls postgres/backups/docuseal_backup_*.sql.gz >/dev/null 2>&1; then
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✅ PASS${NC} - Backup file created"
        
        # Get latest backup size
        LATEST_BACKUP=$(ls -t postgres/backups/docuseal_backup_*.sql.gz | head -1)
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
        echo "   Latest backup: $(basename "$LATEST_BACKUP") (Size: $BACKUP_SIZE)"
    else
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
        echo -e "${RED}❌ FAIL${NC} - Backup file not found"
    fi
else
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${RED}❌ FAIL${NC} - Backup creation failed"
fi

echo ""
echo "7. 🔐 Security Tests"
echo "-------------------"

run_test "Firewall configured" "command -v ufw >/dev/null && ufw status | grep -q '8080' || command -v firewall-cmd >/dev/null && firewall-cmd --list-ports | grep -q '8080'"
run_test "Non-root user running" "test \$(id -u) -ne 0"

echo ""
echo "8. 📊 Performance Tests"
echo "----------------------"

echo -n "Testing response time... "
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8080/health)
TESTS_TOTAL=$((TESTS_TOTAL + 1))
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} (${RESPONSE_TIME}s)"
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${RESPONSE_TIME}s - should be < 2s)"
fi

echo -n "Testing memory usage... "
MEMORY_USAGE=$(docker stats --no-stream --format "table {{.MemPerc}}" | tail -n +2 | head -1 | tr -d '%')
TESTS_TOTAL=$((TESTS_TOTAL + 1))
if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} (${MEMORY_USAGE}%)"
else
    echo -e "${YELLOW}⚠️  HIGH${NC} (${MEMORY_USAGE}% - should be < 80%)"
fi

echo -n "Testing disk usage... "
DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | tr -d '%')
TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ "$DISK_USAGE" -lt 90 ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} (${DISK_USAGE}%)"
else
    echo -e "${RED}❌ FAIL${NC} (${DISK_USAGE}% - should be < 90%)"
fi

echo ""
echo "9. 🔗 Integration Tests"
echo "----------------------"

# Test API endpoints (basic)
run_test "API root endpoint" "curl -f http://localhost:8080/api"
run_test "Health endpoint format" "curl -s http://localhost:8080/health | grep -q 'healthy'"

echo ""
echo "📋 Test Summary"
echo "==============="

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo ""
    echo "✅ Your DocuSeal deployment is fully functional!"
    echo ""
    echo "🌐 Access your DocuSeal instance at:"
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "   http://$SERVER_IP:8080"
    echo ""
    echo "📊 System Status:"
    echo "   Services: $(docker compose ps | grep -c 'Up') containers running"
    echo "   Storage: $(du -sh storage/ 2>/dev/null | cut -f1 || echo '0B') used"
    echo "   Backups: $(ls postgres/backups/docuseal_backup_*.sql.gz 2>/dev/null | wc -l) available"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Access the web interface and create your admin account"
    echo "   2. Upload a test document and create a template"
    echo "   3. Test the signing workflow"
    echo "   4. Configure SMTP for email notifications (if not done)"
    echo "   5. Set up SSL/HTTPS for production use"
    echo ""
    exit 0
else
    TESTS_FAILED=$((TESTS_TOTAL - TESTS_PASSED))
    echo -e "${RED}❌ $TESTS_FAILED/$TESTS_TOTAL TESTS FAILED${NC}"
    echo ""
    echo "🔍 Issues detected. Please review the failed tests above."
    echo ""
    echo "🛠️  Common fixes:"
    echo "   - Check Docker service: systemctl status docker"
    echo "   - Review logs: docker compose logs"
    echo "   - Verify .env configuration: cat .env"
    echo "   - Check firewall: ufw status"
    echo "   - Restart services: docker compose restart"
    echo ""
    echo "📋 For detailed troubleshooting, see:"
    echo "   STEP_BY_STEP_DEPLOYMENT_GUIDE.md - Phase 6: Troubleshooting"
    echo ""
    exit 1
fi
