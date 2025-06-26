#!/bin/bash

# Check Cron Job Status Script
echo "🔍 Checking Late Fee System Cron Status"
echo "═══════════════════════════════════════"

# Check if cron service is running
echo "📋 Cron Service Status:"
if service cron status > /dev/null 2>&1; then
    echo "✅ Cron service is running"
    service cron status
else
    echo "❌ Cron service is not running"
fi

echo ""

# Check installed cron jobs
echo "📅 Installed Cron Jobs:"
crontab -l 2>/dev/null | while read line; do
    if [[ $line == *"late-fees"* ]]; then
        echo "✅ Late Fee Processing: $line"
    elif [[ ! $line == \#* ]] && [[ -n "$line" ]]; then
        echo "ℹ️  Other: $line"
    fi
done

echo ""

# Check log directories
echo "📁 Log Directory Status:"
if [ -d "/app/logs/cron" ]; then
    echo "✅ Cron log directory exists"
    echo "   Files in /app/logs/cron:"
    ls -la /app/logs/cron/ 2>/dev/null | sed 's/^/   /'
else
    echo "❌ Cron log directory missing"
    echo "   Creating directory..."
    mkdir -p /app/logs/cron
    echo "✅ Directory created"
fi

echo ""

# Check recent cron logs
echo "📄 Recent Cron Execution Logs:"
if [ -f "/app/logs/cron/late-fees.log" ]; then
    echo "Late Fee Processing Log (last 5 lines):"
    tail -5 /app/logs/cron/late-fees.log 2>/dev/null | sed 's/^/   /'
else
    echo "❌ No late fee processing logs found yet"
fi

echo ""

# Check system logs for cron activity
echo "🔍 System Cron Activity (last 10 entries):"
if [ -f "/var/log/cron.log" ]; then
    tail -10 /var/log/cron.log | grep -E "late-fees" | sed 's/^/   /'
elif [ -f "/var/log/syslog" ]; then
    tail -20 /var/log/syslog | grep -E "(cron|CRON)" | tail -5 | sed 's/^/   /'
else
    echo "   No system cron logs available"
fi

echo ""
echo "✅ Cron status check completed" 