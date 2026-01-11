@echo off
cd /d "%~dp0backend"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Activating virtual environment...
call venv\Scripts\activate.bat
if not exist venv\Lib\site-packages\fastapi (
    echo Installing dependencies...
    pip install -r requirements.txt
)
echo Starting backend server...
echo Backend will be available at http://localhost:8000
echo API Documentation: http://localhost:8000/docs
uvicorn app.main:app --reload --port 8000
pause
