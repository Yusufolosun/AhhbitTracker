#!/bin/bash
# Example cron job for automated monitoring
# Add to crontab: 0 */6 * * * /path/to/cron-example.sh

cd /path/to/AhhbitTracker

# Track pool every 6 hours
npm run analytics:pool >> logs/pool-tracking.log 2>&1

# Generate dashboard daily
if [ $(date +%H) -eq 0 ]; then
  npm run analytics:dashboard >> logs/dashboard.log 2>&1
fi
