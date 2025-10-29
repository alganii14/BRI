@echo off
echo ========================================
echo  Pipeline Dashboard - Full Setup
echo ========================================
echo.

echo This script will start both Backend and Frontend
echo.
echo Prerequisites:
echo - XAMPP MySQL must be running
echo - Database 'pipeline_db' must exist
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Starting Backend in new window...
start "Pipeline Backend" cmd /k "%~dp0start-backend.bat"

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend in new window...
start "Pipeline Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo ========================================
echo  Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Two new terminal windows have been opened.
echo Close those windows to stop the servers.
echo.
pause
