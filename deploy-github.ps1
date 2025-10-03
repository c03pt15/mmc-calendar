Write-Host "Deploying to GitHub Pages..." -ForegroundColor Cyan

# Build for GitHub Pages
npm run build:gh-pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Switch to gh-pages branch
git checkout gh-pages

# Copy built files
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages - $(Get-Date)"
git push origin gh-pages

# Switch back to main
git checkout main

Write-Host "GitHub Pages deployment complete!" -ForegroundColor Green
