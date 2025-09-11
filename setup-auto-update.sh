#!/bin/bash

# Setup automatic features list updating
echo "Setting up automatic features list updating..."

# Create a cron job that runs every 6 hours
(crontab -l 2>/dev/null; echo "0 */6 * * * cd $(pwd) && node auto-update-features.js") | crontab -

echo "Auto-update cron job installed!"
echo "The features list will now update automatically every 6 hours."
echo "To view current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e (then delete the line)"
