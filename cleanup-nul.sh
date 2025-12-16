#!/bin/bash

# Script to clean up 'nul' files created by Windows redirect commands
# These files are created when using '> nul' in Git Bash/WSL

echo "🧹 Cleaning up 'nul' files..."

# Find and delete all 'nul' files
count=$(find . -name "nul" -type f | wc -l)

if [ $count -eq 0 ]; then
    echo "✅ No 'nul' files found. Everything is clean!"
else
    echo "Found $count 'nul' file(s). Deleting..."
    find . -name "nul" -type f -delete
    echo "✅ Deleted $count 'nul' file(s)"
fi

echo "Done!"
