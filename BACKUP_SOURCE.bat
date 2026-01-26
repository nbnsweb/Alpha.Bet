@echo off
set "BACKUP_DIR=SAFE_SOURCE_BACKUP"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo ==========================================
echo      BACKING UP SOURCE CODE
echo ==========================================

echo [1/3] Backing up Client (Source only)...
robocopy "client" "%BACKUP_DIR%\client" /E /XD node_modules dist

echo [2/3] Backing up Server (Source only)...
robocopy "server" "%BACKUP_DIR%\server" /E /XD node_modules

echo [3/3] Backing up Scripts...
copy *.bat "%BACKUP_DIR%\"
copy *.json "%BACKUP_DIR%\"
copy *.md "%BACKUP_DIR%\"

echo.
echo ==========================================
echo SUCCESS! Backup saved to:
echo %CD%\%BACKUP_DIR%
echo ==========================================
pause
