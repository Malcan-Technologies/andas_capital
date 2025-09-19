#!/bin/bash

# Setup MTSA Container Monitoring
# This script sets up a cron job to monitor MTSA container health

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/monitor-mtsa.sh"

echo "🔧 Setting up MTSA container monitoring..."

# Check if monitor script exists
if [[ ! -f "$MONITOR_SCRIPT" ]]; then
    echo "❌ Monitor script not found: $MONITOR_SCRIPT"
    exit 1
fi

# Make sure monitor script is executable
chmod +x "$MONITOR_SCRIPT"

# Create log directory
LOG_DIR="$SCRIPT_DIR/../logs"
mkdir -p "$LOG_DIR"

# Add cron job to check MTSA every 5 minutes
CRON_JOB="*/5 * * * * $MONITOR_SCRIPT >> $LOG_DIR/mtsa-monitor.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "monitor-mtsa.sh"; then
    echo "⚠️  MTSA monitoring cron job already exists"
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ MTSA monitoring cron job added (runs every 5 minutes)"
fi

echo "📋 Current cron jobs:"
crontab -l | grep -E "(monitor-mtsa|MTSA)" || echo "No MTSA monitoring jobs found"

echo ""
echo "📁 Monitor logs will be saved to: $LOG_DIR/mtsa-monitor.log"
echo "🔧 To remove monitoring: crontab -e (then delete the monitor-mtsa.sh line)"
echo "🔍 To check logs: tail -f $LOG_DIR/mtsa-monitor.log"
