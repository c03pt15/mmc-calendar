Write-Host "Deploying to Vercel..." -ForegroundColor Cyan

# Build for Vercel
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Commit and push to main
git add .
git commit -m "Deploy to Vercel - $(Get-Date)"
git push origin main

Write-Host "Vercel deployment triggered!" -ForegroundColor Green
