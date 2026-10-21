@echo off
echo Starting TaxiAPP - Abuja Express Taxi Platform
echo ================================================
echo.

echo [1/3] Starting Backend Server (port 5000)...
start "TaxiAPP Backend" cmd /k "cd /d C:\Users\Lenovo\Documents\GitHub\TaxiAPP\backend && node server.js"
timeout /t 2 /nobreak > nul

echo [2/3] Starting Customer App (port 5175)...
start "TaxiAPP Customer" cmd /k "cd /d C:\Users\Lenovo\Documents\GitHub\TaxiAPP\customer-app && npm run dev"
timeout /t 2 /nobreak > nul

echo [3/3] Starting Driver App (port 5174)...
start "TaxiAPP Driver" cmd /k "cd /d C:\Users\Lenovo\Documents\GitHub\TaxiAPP\driver-app && npm run dev"

echo.
echo ================================================
echo All services starting...
echo Customer App: http://localhost:5175
echo Driver App:   http://localhost:5174
echo Backend API:  http://localhost:5000
echo ================================================
pause
