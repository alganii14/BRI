@echo off
echo ========================================
echo  Pipeline Frontend (React + Vite)
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/3] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)
echo.

echo [2/3] Installing dependencies...
if not exist "node_modules\" (
    echo Installing npm packages... (this may take a few minutes)
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

echo [3/3] Starting development server...
echo Frontend will run on http://localhost:3000
echo Browser will open automatically
echo Press Ctrl+C to stop
echo.
call npm run dev

pause
