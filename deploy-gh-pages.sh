#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Switch to gh-pages branch
echo "Switching to gh-pages branch..."
git checkout gh-pages

# Copy built files to root
echo "Copying built files..."
cp -r dist/* .

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date)"

# Push to gh-pages branch
echo "Pushing to gh-pages branch..."
git push origin gh-pages

# Switch back to main
echo "Switching back to main branch..."
git checkout main

echo "Deployment complete!"
