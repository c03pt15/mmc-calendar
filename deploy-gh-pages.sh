#!/bin/bash

# Check if we're in a git repository
if ! git status >/dev/null 2>&1; then
    echo "Error: Not in a git repository. Please run this script from your project root."
    exit 1
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "Warning: Not on main branch. Current branch: $current_branch"
    echo "Switching to main branch first..."
    git checkout main
    if [ $? -ne 0 ]; then
        echo "Error: Failed to switch to main branch."
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff --quiet; then
    echo "Warning: You have uncommitted changes. Committing them first..."
    git add .
    git commit -m "Auto-commit before deployment - $(date)"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to commit changes."
        exit 1
    fi
fi

# Build the project for GitHub Pages
echo "Building project for GitHub Pages..."
npm run build:gh-pages
if [ $? -ne 0 ]; then
    echo "Error: Build failed."
    exit 1
fi

# Switch to gh-pages branch
echo "Switching to gh-pages branch..."
git checkout gh-pages
if [ $? -ne 0 ]; then
    echo "Error: Failed to switch to gh-pages branch."
    exit 1
fi

# Copy built files to root
echo "Copying built files..."
cp -r dist/* . 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Error: Failed to copy files."
    exit 1
fi

# Add all files
echo "Adding files to git..."
git add .
if [ $? -ne 0 ]; then
    echo "Error: Failed to add files to git."
    exit 1
fi

# Commit changes
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date)"
if [ $? -ne 0 ]; then
    echo "Warning: Nothing to commit or commit failed."
fi

# Push to gh-pages branch
echo "Pushing to gh-pages branch..."
git push origin gh-pages
if [ $? -ne 0 ]; then
    echo "Error: Failed to push to gh-pages branch."
    exit 1
fi

# Switch back to main
echo "Switching back to main branch..."
git checkout main
if [ $? -ne 0 ]; then
    echo "Error: Failed to switch back to main branch."
    exit 1
fi

echo ""
echo "========================================"
echo "Deployment complete!"
echo "Your app should be live at:"
echo "https://ghislaingirard.github.io/mmc-calendar/"
echo "========================================"
