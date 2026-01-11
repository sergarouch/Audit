@echo off
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Starting frontend development server...
echo Frontend will be available at http://localhost:5173
npm run dev
pause
