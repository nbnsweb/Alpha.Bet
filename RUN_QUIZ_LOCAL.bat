@echo off
setlocal enabledelayedexpansion
title ALPHA.BET Competition Launcher
color 0b

echo ==========================================
echo    ALPHA.BET COMPETITION LAUNCHER
echo ==========================================
echo.

:: 1. Check for Node.js
echo [1/4] Checking System Requirements...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is NOT installed on this computer.
    echo Please download and install "LTS" from: https://nodejs.org/
    echo.
    pause
    exit
)
echo Node.js is ready.
echo.

:: 2. Find Local IP (Very Robust)
echo [2/4] Detecting Local Network IP...
set "LOCAL_IP=localhost"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    set "temp_ip=%%a"
    set "temp_ip=!temp_ip: =!"
    if not "!temp_ip!"=="127.0.0.1" (
        set "LOCAL_IP=!temp_ip!"
    )
)

echo.
echo *** YOUR COMPETITION IP: !LOCAL_IP!
echo *** TELL PLAYERS TO OPEN: http://!LOCAL_IP!:5173
echo.
echo ==========================================

:: 3. Start Backend
echo [3/4] Starting Backend Server...
echo (Note: Installing dependencies... please wait...)
start "Quiz Backend" cmd /k "echo STARTING BACKEND... && cd server && npm install && node index.js"

:: 4. Start Frontend
echo [4/4] Starting Frontend (Vite)...
echo (Note: Installing dependencies... please wait...)
start "Quiz Frontend" cmd /k "echo STARTING FRONTEND... && cd client && npm install && npm run dev -- --host"

echo.
echo ==========================================
echo SUCCESS: Launch commands sent!
echo.
echo 1. KEEP ALL WINDOWS OPEN.
echo 2. Wait 1-2 minutes for the first setup to finish.
echo 3. Open this on PC: http://localhost:5173
echo 4. Open this on TV: http://!LOCAL_IP!:5173
echo ==========================================
pause
