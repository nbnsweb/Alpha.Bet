@echo off
echo ==========================================
echo        MINIMAL DEBUG LAUNCHER
echo ==========================================
echo.
echo 1. Checking folders...
if exist client (echo [OK] client folder found) else (echo [ERR] client folder MISSING)
if exist server (echo [OK] server folder found) else (echo [ERR] server folder MISSING)
echo.

echo 2. Starting Backend...
start "BACKEND" cmd /k "cd server && npm install && node index.js"

echo 3. Starting Frontend...
start "FRONTEND" cmd /k "cd client && npm install && npm run dev"

echo.
echo ==========================================
echo If the other windows closed, tell me what 
echo error you see in THIS window.
echo ==========================================
pause
