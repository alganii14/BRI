@echo off
echo ========================================
echo  Pipeline Dashboard - System Check
echo ========================================
echo.

set "allok=1"

echo [1/5] Checking Go installation...
go version >nul 2>&1
if errorlevel 1 (
    echo [X] FAIL - Go not found!
    echo     Please install Go 1.21+ from: https://go.dev/dl/
    set "allok=0"
) else (
    go version
    echo [OK] Go is installed
)
echo.

echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] FAIL - Node.js not found!
    echo     Please install Node.js 18+ from: https://nodejs.org/
    set "allok=0"
) else (
    node --version
    echo [OK] Node.js is installed
)
echo.

echo [3/5] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [X] FAIL - npm not found!
    echo     npm should come with Node.js installation
    set "allok=0"
) else (
    npm --version
    echo [OK] npm is installed
)
echo.

echo [4/5] Checking MySQL (XAMPP)...
netstat -an | findstr ":3306" >nul 2>&1
if errorlevel 1 (
    echo [!] WARNING - MySQL might not be running on port 3306
    echo     Please start MySQL in XAMPP Control Panel
    echo     Or check if MySQL is running on different port
) else (
    echo [OK] MySQL is listening on port 3306
)
echo.

echo [5/5] Checking backend .env file...
if exist "backend\.env" (
    echo [OK] .env file exists
) else (
    echo [!] WARNING - .env file not found
    echo     Copying .env.example to .env...
    copy "backend\.env.example" "backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo [X] FAIL - Could not create .env file
        set "allok=0"
    ) else (
        echo [OK] Created .env file from .env.example
    )
)
echo.

echo ========================================
echo  System Check Results
echo ========================================
echo.

if "%allok%"=="1" (
    echo [✓] ALL CHECKS PASSED!
    echo.
    echo You are ready to start the application.
    echo.
    echo Next steps:
    echo 1. Import database: backend\init.sql
    echo 2. Run: start-all.bat
    echo.
) else (
    echo [X] SOME CHECKS FAILED!
    echo.
    echo Please install missing software and try again.
    echo.
)

echo ========================================
echo.
pause
