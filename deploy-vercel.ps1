Write-Host "Deploying to Vercel..." -ForegroundColor Cyan

# Build for Vercel
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Handle line endings and commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git config core.autocrlf false
git add .
git commit -m "Deploy to Vercel - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed! Trying to handle line endings..." -ForegroundColor Yellow
    git add --renormalize .
    git commit -m "Deploy to Vercel - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Push to main
Write-Host "Pushing to main..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed! Trying to force push..." -ForegroundColor Yellow
    git push --force-with-lease origin main
}

Write-Host "Vercel deployment triggered!" -ForegroundColor Green
