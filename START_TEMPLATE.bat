@echo off
setlocal enabledelayedexpansion
title Quiz App Server
echo ==========================================
echo      STARTING QUIZ APPLICATION
echo ==========================================

:: Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    pause
    exit
)

:: Detect IP
set "LOCAL_IP=localhost"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
   set "temp_ip=%%a"
   set "temp_ip=!temp_ip: =!"
   if not "!temp_ip!"=="127.0.0.1" set "LOCAL_IP=!temp_ip!"
)

echo.
echo Server starting at:
echo   Local:   http://localhost:3001
echo   Network: http://%LOCAL_IP%:3001
echo.

cd server
if not exist node_modules (
    echo Installing production dependencies...
    call npm install --production
)
node index.js
pause
