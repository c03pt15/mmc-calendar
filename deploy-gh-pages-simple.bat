@echo off

echo ========================================
echo MMC Calendar - GitHub Pages Deployment
echo ========================================

REM Check if we're in a git repository
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Not in a git repository. Please run this script from your project root.
    pause
    exit /b 1
)

REM Switch to main branch if not already there
echo Checking current branch...
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo Switching to main branch...
    git checkout main
)

REM Commit any uncommitted changes
echo Checking for uncommitted changes...
git diff --quiet
if %errorlevel% neq 0 (
    echo Found uncommitted changes. Committing them...
    git add .
    git commit -m "Auto-commit before deployment - %date% %time%"
    echo Changes committed.
) else (
    echo No uncommitted changes.
)

REM Build the project for GitHub Pages
echo.
echo Building project for GitHub Pages...
npm run build:gh-pages
echo Build completed.

REM Switch to gh-pages branch
echo.
echo Switching to gh-pages branch...
git checkout gh-pages

REM Copy built files to root
echo Copying built files...
xcopy /E /Y dist\* . >nul

REM Add all files
echo Adding files to git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Deploy to GitHub Pages - %date% %time%"

REM Push to gh-pages branch
echo Pushing to gh-pages branch...
git push origin gh-pages

REM Switch back to main
echo Switching back to main branch...
git checkout main

echo.
echo ========================================
echo Deployment complete!
echo Your app should be live at:
echo https://ghislaingirard.github.io/mmc-calendar/
echo ========================================
pause
