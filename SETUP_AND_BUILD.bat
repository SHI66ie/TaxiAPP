@echo off
cd /d "%~dp0"
echo ================================================
echo 1. Installing Backend dependencies...
cd backend
call npm install
cd ..

echo ================================================
echo 2. Installing Customer App dependencies...
cd customer-app
call npm install
echo Building Customer App...
call npm run build
cd ..

echo ================================================
echo 3. Installing Driver App dependencies...
cd driver-app
call npm install
echo Building Driver App...
call npm run build
cd ..

echo ================================================
echo Setup & Build Completed Successfully!
pause
