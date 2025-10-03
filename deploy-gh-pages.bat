@echo off

REM Check if we're in a git repository
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Not in a git repository. Please run this script from your project root.
    pause
    exit /b 1
)

REM Check if we're on main branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo Warning: Not on main branch. Current branch: %current_branch%
    echo Switching to main branch first...
    git checkout main
    if %errorlevel% neq 0 (
        echo Error: Failed to switch to main branch.
        pause
        exit /b 1
    )
)

REM Check for uncommitted changes and commit if needed
git diff --quiet
if %errorlevel% neq 0 (
    echo Warning: You have uncommitted changes. Committing them first...
    git add .
    git commit -m "Auto-commit before deployment - %date% %time%"
    echo Changes committed.
)

REM Build the project for GitHub Pages
echo Building project for GitHub Pages...
npm run build:gh-pages
if %errorlevel% neq 0 (
    echo Error: Build failed.
    pause
    exit /b 1
)

REM Switch to gh-pages branch
echo Switching to gh-pages branch...
git checkout gh-pages
if %errorlevel% neq 0 (
    echo Error: Failed to switch to gh-pages branch.
    pause
    exit /b 1
)

REM Copy built files to root
echo Copying built files...
xcopy /E /Y dist\* . >nul
if %errorlevel% neq 0 (
    echo Error: Failed to copy files.
    pause
    exit /b 1
)

REM Add all files
echo Adding files to git...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add files to git.
    pause
    exit /b 1
)

REM Commit changes
echo Committing changes...
git commit -m "Deploy to GitHub Pages - %date% %time%"
if %errorlevel% neq 0 (
    echo Warning: Nothing to commit or commit failed.
)

REM Push to gh-pages branch
echo Pushing to gh-pages branch...
git push origin gh-pages
if %errorlevel% neq 0 (
    echo Error: Failed to push to gh-pages branch.
    pause
    exit /b 1
)

REM Switch back to main
echo Switching back to main branch...
git checkout main
if %errorlevel% neq 0 (
    echo Error: Failed to switch back to main branch.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment complete!
echo Your app should be live at:
echo https://ghislaingirard.github.io/mmc-calendar/
echo ========================================
pause
