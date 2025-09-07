#!/usr/bin/env node

/**
 * Automatic Backup Watcher for Baseball Manager Dashboard Algorithm
 * Watches for changes to BattingOrder.tsx and automatically updates backup
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// File to watch
const watchFile = path.join(__dirname, 'src', 'BattingOrder.tsx');
const backupScript = path.join(__dirname, 'update-backup.js');

let isUpdating = false;

console.log('🔄 Starting automatic backup watcher...');
console.log(`📁 Watching: ${watchFile}`);
console.log('⏹️  Press Ctrl+C to stop');

// Watch for changes
fs.watchFile(watchFile, { interval: 1000 }, (curr, prev) => {
  if (isUpdating) return; // Prevent multiple simultaneous updates
  
  // Check if file was actually modified (not just accessed)
  if (curr.mtime > prev.mtime) {
    isUpdating = true;
    console.log(`\n📝 Detected change in BattingOrder.tsx at ${new Date().toLocaleTimeString()}`);
    console.log('🔄 Updating algorithm backup...');
    
    // Run the backup script
    exec(`node "${backupScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error updating backup:', error.message);
      } else {
        console.log('✅ Backup updated automatically!');
        console.log(stdout);
      }
      isUpdating = false;
    });
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping automatic backup watcher...');
  fs.unwatchFile(watchFile);
  process.exit(0);
});

console.log('✅ Automatic backup watcher is now active!');
