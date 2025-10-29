@echo off
echo ========================================
echo  Pipeline Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking Go installation...
go version
if errorlevel 1 (
    echo ERROR: Go not found! Please install Go 1.21+
    pause
    exit /b 1
)
echo.

echo [2/3] Downloading dependencies...
go mod download
if errorlevel 1 (
    echo ERROR: Failed to download dependencies
    pause
    exit /b 1
)
echo.

echo [3/3] Starting backend server...
echo Server will run on http://localhost:8080
echo Press Ctrl+C to stop
echo.
go run main.go

pause
