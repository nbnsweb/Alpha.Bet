@echo off
echo ===================================================
echo       DEPLOYING TO GITHUB (AUTOMATED)
echo ===================================================

cd /d "%~dp0"

echo Initializing Git...
git init
git add .
git commit -m "Initial deploy"
git branch -M main

echo Adding Remote Origin...
git remote add origin https://github.com/nbnsweb/Alpha.Bet.git

echo Pushing to GitHub...
echo (A browser window might pop up to ask for your GitHub login)
git push -u origin main

echo.
echo ===================================================
echo       DONE! CHECK YOUR GITHUB REPO.
echo ===================================================
echo ===================================================
