#!/bin/bash

# Manual Retrospective Runner
# Run this script to manually execute the Doctrine Evolution Protocol

echo "🚀 Manual Doctrine Evolution Protocol Runner"
echo "============================================="
echo ""

# Get the project root directory
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Check if the retrospective script exists
if [ ! -f "run-post-commit-retrospective.sh" ]; then
    echo "❌ Error: run-post-commit-retrospective.sh not found"
    exit 1
fi

# Run the retrospective script
echo "🔄 Executing Doctrine Evolution Protocol..."
echo ""
./run-post-commit-retrospective.sh

echo ""
echo "🎯 Manual retrospective complete!"
echo "📚 Doctrine has been evolved based on current session analysis"
