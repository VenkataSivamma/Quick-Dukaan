@echo off
echo ========================================
echo    Quick-Dukaan E-Commerce Platform
echo ========================================
echo.
echo Starting the application...
echo.

REM Start the backend server
echo [1/2] Starting Backend Server...
cd "Back-end"
start "Quick-Dukaan Backend" cmd /k "node server.js"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Open the frontend in default browser
echo [2/2] Opening Frontend Interface...
start "" "index.html"

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend Server: Running in separate window
echo Frontend: Opened in your default browser
echo.
echo To stop the application:
echo 1. Close the backend server window
echo 2. Close your browser
echo.
pause