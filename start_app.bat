@echo off
set "NODE_Home=C:\Program Files\nodejs"
set "PATH=%NODE_Home%;%PATH%"

echo --- DIAGNOSTIC START ---
echo Node Version:
node -v
echo NPM Version:
call npm -v
echo -----------------------

echo Starting Backend Server...
start "Quiz Backend" cmd /k "cd server && echo Installing dependencies... && call npm install && echo Starting Node Server... && node index.js || echo SERVER CRASHED & pause"

echo Starting Frontend Client...
start "Quiz Frontend" cmd /k "cd client && echo Installing dependencies... && call npm install && echo Starting Vite Dev Server... && call npm run dev || echo CLIENT CRASHED & pause"

echo Launch commands sent. Please check the two new windows for any Red error messages.
pause
