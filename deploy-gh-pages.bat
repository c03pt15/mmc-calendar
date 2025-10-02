@echo off

REM Build the project
echo Building project...
npm run build

REM Switch to gh-pages branch
echo Switching to gh-pages branch...
git checkout gh-pages

REM Copy built files to root
echo Copying built files...
xcopy /E /Y dist\* .

REM Add all files
echo Adding files to git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Deploy to GitHub Pages - %date%"

REM Push to gh-pages branch
echo Pushing to gh-pages branch...
git push origin gh-pages

REM Switch back to main
echo Switching back to main branch...
git checkout main

echo Deployment complete!
