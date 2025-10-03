Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MMC Calendar - Full Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository. Please run this script from your project root." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Switch to main branch if not already there
Write-Host "Checking current branch..."
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "Switching to main branch..." -ForegroundColor Yellow
    git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to switch to main branch." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Commit any uncommitted changes
Write-Host "Checking for uncommitted changes..."
$hasChanges = git diff --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "Found uncommitted changes. Committing them..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto-commit before deployment - $(Get-Date)"
    Write-Host "Changes committed." -ForegroundColor Green
} else {
    Write-Host "No uncommitted changes." -ForegroundColor Green
}

# Clean dist folder first (safely)
Write-Host "Cleaning dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Build for Vercel (main branch)
Write-Host ""
Write-Host "Building for Vercel (main branch)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Vercel build failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Vercel build completed." -ForegroundColor Green

# Commit the Vercel build to main
Write-Host "Committing Vercel build..." -ForegroundColor Yellow
git add dist/
git commit -m "Build for Vercel deployment - $(Get-Date)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Nothing to commit for Vercel build." -ForegroundColor Yellow
}

# Push to main branch (triggers Vercel deployment)
Write-Host "Pushing to main branch (triggers Vercel)..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push to main branch." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Vercel deployment triggered." -ForegroundColor Green

# Switch to gh-pages branch first
Write-Host "Switching to gh-pages branch..." -ForegroundColor Yellow
git checkout gh-pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to switch to gh-pages branch." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clean dist folder for GitHub Pages build (safely)
Write-Host "Cleaning dist folder for GitHub Pages build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Build for GitHub Pages
Write-Host ""
Write-Host "Building for GitHub Pages..." -ForegroundColor Yellow
npm run build:gh-pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: GitHub Pages build failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "GitHub Pages build completed." -ForegroundColor Green

# Copy built files to root
Write-Host "Copying built files..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force
Write-Host "Files copied." -ForegroundColor Green

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to add files to git." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy to GitHub Pages - $(Get-Date)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Nothing to commit or commit failed." -ForegroundColor Yellow
}

# Push to gh-pages branch
Write-Host "Pushing to gh-pages branch..." -ForegroundColor Yellow
git push origin gh-pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push to gh-pages branch." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Switch back to main
Write-Host "Switching back to main branch..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to switch back to main branch." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clean up dist folder (safely)
Write-Host "Cleaning up dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "GitHub Pages: https://ghislaingirard.github.io/mmc-calendar/" -ForegroundColor Cyan
Write-Host "Vercel: Check your Vercel dashboard for the URL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Read-Host "Press Enter to exit"
