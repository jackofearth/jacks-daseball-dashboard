#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current date
const now = new Date();
const dateString = now.toISOString().split('T')[0];

// Read the current features file
const featuresPath = path.join(__dirname, 'FEATURES.md');
let content = fs.readFileSync(featuresPath, 'utf8');

// Source files to monitor
const sourceFiles = [
  'src/App.tsx',
  'src/PlayerManager.tsx', 
  'src/DraggableBattingOrder.tsx',
  'src/StorageService.ts',
  'src/HelpPage.tsx',
  'src/StrategyInfoModal.tsx',
  'src/ThemeCustomizer.tsx',
  'src/ConfirmationDialog.tsx'
];

// Check if any source files have been modified since last features update
const featuresStats = fs.statSync(featuresPath);
let hasSourceChanges = false;

for (const file of sourceFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    
    // If source file is newer than features file, there are changes
    if (stats.mtime > featuresStats.mtime) {
      hasSourceChanges = true;
      console.log(`Source file changed: ${file}`);
      break;
    }
  }
}

// Only update if source files have changed
if (hasSourceChanges) {
  // Update the last updated date
  content = content.replace(/\*Last updated: \d{4}-\d{2}-\d{2}\*/g, `*Last updated: ${dateString}*`);
  
  fs.writeFileSync(featuresPath, content);
  console.log(`Features file updated due to source changes - ${dateString}`);
  
  // Commit the changes
  try {
    execSync('git add FEATURES.md', { stdio: 'pipe' });
    execSync(`git commit -m "Auto-update features list - source files changed"`, { stdio: 'pipe' });
    console.log('Changes committed to git');
  } catch (error) {
    console.log('Could not commit to git (this is normal if no changes)');
  }
} else {
  console.log('No source file changes detected since last update, features file not modified');
}
