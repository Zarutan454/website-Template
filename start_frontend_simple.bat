@echo off
echo 🚀 Starting BSN Frontend...

echo 📦 Installing dependencies if needed...
if not exist node_modules npm install

echo 🌐 Starting Vite development server on http://localhost:8080...
echo    Backend API: http://localhost:8000
echo    Frontend: http://localhost:8080
echo    Press Ctrl+C to stop the server
echo.

set VITE_API_BASE_URL=http://localhost:8000
set VITE_DJANGO_API_URL=http://localhost:8000/api
set VITE_WS_URL=ws://localhost:8000
set VITE_MEDIA_BASE_URL=http://localhost:8000

npm run dev 