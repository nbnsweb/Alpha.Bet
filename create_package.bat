@echo off
echo ==========================================
echo      CREATING DEPLOYMENT PACKAGE
echo ==========================================

:: 1. Build Client
echo [1/4] Building React Client...
cd client
call npm install
call npm run build
cd ..

:: 2. Prepare Directory
echo [2/4] Creating Directory Structure...
if exist DEPLOY_PACKAGE rmdir /s /q DEPLOY_PACKAGE
mkdir DEPLOY_PACKAGE
mkdir DEPLOY_PACKAGE\server
mkdir DEPLOY_PACKAGE\client\dist

:: 3. Copy Files
echo [3/4] Copying Files...
xcopy server DEPLOY_PACKAGE\server /E /I /Y
xcopy client\dist DEPLOY_PACKAGE\client\dist /E /I /Y
copy package.json DEPLOY_PACKAGE\

:: 4. Create Launch Script
echo [4/4] Creating Launch Script...
if exist START_TEMPLATE.bat (
    copy START_TEMPLATE.bat DEPLOY_PACKAGE\START_APP.bat
) else (
    echo ERROR: START_TEMPLATE.bat not found!
)

:: 5. Create Instructions
echo [5] Creating Install Instructions...
echo ================================================== > DEPLOY_PACKAGE\README_INSTALL.txt
echo           QUIZ APP INSTALLATION GUIDE >> DEPLOY_PACKAGE\README_INSTALL.txt
echo ================================================== >> DEPLOY_PACKAGE\README_INSTALL.txt
echo. >> DEPLOY_PACKAGE\README_INSTALL.txt
echo 1. Install Node.js >> DEPLOY_PACKAGE\README_INSTALL.txt
echo    - Download and install from: https://nodejs.org/ >> DEPLOY_PACKAGE\README_INSTALL.txt
echo    - This is required to run the server. >> DEPLOY_PACKAGE\README_INSTALL.txt
echo. >> DEPLOY_PACKAGE\README_INSTALL.txt
echo 2. Start the App >> DEPLOY_PACKAGE\README_INSTALL.txt
echo    - Double-click 'START_APP.bat'. >> DEPLOY_PACKAGE\README_INSTALL.txt
echo    - The first time you run it, it will automatically >> DEPLOY_PACKAGE\README_INSTALL.txt
echo      install necessary files (this takes 1-2 mins). >> DEPLOY_PACKAGE\README_INSTALL.txt
echo. >> DEPLOY_PACKAGE\README_INSTALL.txt
echo 3. Connect >> DEPLOY_PACKAGE\README_INSTALL.txt
echo    - The app will open and show you the URL to use. >> DEPLOY_PACKAGE\README_INSTALL.txt
echo      (e.g., http://192.168.1.5:3001) >> DEPLOY_PACKAGE\README_INSTALL.txt
echo. >> DEPLOY_PACKAGE\README_INSTALL.txt

echo.
echo SUCCESS! Deployment package created in 'DEPLOY_PACKAGE' folder.
pause
