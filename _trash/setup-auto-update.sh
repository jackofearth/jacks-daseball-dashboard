#!/bin/bash

# Setup script for automatic algorithm documentation updates
# This script configures git hooks and ensures the update system is working

set -e

echo "🚀 Setting up automatic algorithm documentation updates..."

# Get the project root directory
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed"
    echo "   Please install Node.js and try again"
    exit 1
fi

# Check if the update script exists
if [ ! -f "update-algorithm-docs.js" ]; then
    echo "❌ Error: update-algorithm-docs.js not found"
    exit 1
fi

# Make the update script executable
chmod +x update-algorithm-docs.js
echo "✅ Made update-algorithm-docs.js executable"

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
if [ -f ".git/hooks/pre-commit" ]; then
    echo "⚠️  Warning: Pre-commit hook already exists"
    echo "   Backing up existing hook to .git/hooks/pre-commit.backup"
    mv .git/hooks/pre-commit .git/hooks/pre-commit.backup
fi

# Create the pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to update algorithm documentation
# This ensures ALGORITHMS.md is always up-to-date with the latest algorithm implementations

echo "🔄 Pre-commit: Updating algorithm documentation..."

# Get the project root directory
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Check if the update script exists
if [ ! -f "update-algorithm-docs.js" ]; then
    echo "⚠️  Warning: update-algorithm-docs.js not found, skipping documentation update"
    exit 0
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "⚠️  Warning: Node.js not found, skipping documentation update"
    exit 0
fi

# Run the update script
if node update-algorithm-docs.js; then
    echo "✅ Algorithm documentation updated successfully"
    
    # Check if ALGORITHMS.md was modified
    if git diff --cached --name-only | grep -q "ALGORITHMS.md"; then
        echo "📝 ALGORITHMS.md was already staged for commit"
    elif git diff --name-only | grep -q "ALGORITHMS.md"; then
        echo "📝 Adding updated ALGORITHMS.md to commit"
        git add ALGORITHMS.md
    else
        echo "ℹ️  No changes to ALGORITHMS.md detected"
    fi
else
    echo "❌ Failed to update algorithm documentation"
    echo "   Commit will proceed, but documentation may be outdated"
    echo "   Run 'node update-algorithm-docs.js' manually to update"
fi

exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit
echo "✅ Installed pre-commit hook"

# Test the update script
echo "🧪 Testing the update script..."
if node update-algorithm-docs.js; then
    echo "✅ Update script test passed"
else
    echo "❌ Update script test failed"
    exit 1
fi

# Check if ALGORITHMS.md was created/updated
if [ -f "ALGORITHMS.md" ]; then
    echo "✅ ALGORITHMS.md exists and is up-to-date"
else
    echo "❌ ALGORITHMS.md was not created"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 What was configured:"
echo "   • Pre-commit git hook to auto-update documentation"
echo "   • Executable update script (update-algorithm-docs.js)"
echo "   • Initial ALGORITHMS.md documentation file"
echo ""
echo "🔄 How it works:"
echo "   • Every time you commit, the documentation will be automatically updated"
echo "   • The script parses your algorithm implementations and updates line numbers"
echo "   • Git metadata (commit dates, hashes) are automatically included"
echo ""
echo "🛠️  Manual usage:"
echo "   • Run 'node update-algorithm-docs.js' to update documentation manually"
echo "   • Run './setup-auto-update.sh' to reconfigure the system"
echo ""
echo "✨ Your algorithm documentation will now stay synchronized with your code!"