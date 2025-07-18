@echo off
echo 🚀 Starting BSN Backend...

cd backend

echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

echo 🗄️ Running database migrations...
python manage.py migrate

echo 🌐 Starting Django server on http://localhost:8000...
echo    Press Ctrl+C to stop the server
echo.

python manage.py runserver 8000 