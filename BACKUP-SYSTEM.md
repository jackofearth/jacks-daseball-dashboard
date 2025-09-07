# 🔄 Automatic Backup System

This project includes an automatic backup system for the batting order algorithm to ensure no changes are lost.

## 📁 Files

- `algorithm-backup.txt` - Current algorithm documentation
- `update-backup.js` - Manual backup script
- `auto-backup.js` - File watcher for automatic backups
- `.git/hooks/pre-commit` - Git hook for commit-time backups

## 🚀 Usage Options

### Option 1: Manual Backup
```bash
npm run backup
# or
node update-backup.js
```

### Option 2: Automatic File Watching
```bash
npm run watch-backup
# or
node auto-backup.js
```
This watches `src/BattingOrder.tsx` and automatically updates the backup when you save changes.

### Option 3: Development Mode (Auto-backup + React)
```bash
npm run dev
```
This starts both the file watcher and React development server.

### Option 4: Git Commit Hooks
The system automatically backs up when you commit changes to `BattingOrder.tsx`:
```bash
git add src/BattingOrder.tsx
git commit -m "Updated algorithm"
# Backup runs automatically before commit
```

## 📋 What Gets Backed Up

- Complete algorithm documentation
- Player interface structure
- Column detection logic
- Batting order strategy with weight formulas
- Technical implementation details
- Timestamp and change log

## 🔧 Customization

To modify what gets backed up, edit `update-backup.js` and adjust the backup content template.

## ⚠️ Notes

- The file watcher runs continuously until stopped (Ctrl+C)
- Git hooks only run when committing changes to the algorithm file
- All backups include timestamps for tracking changes
