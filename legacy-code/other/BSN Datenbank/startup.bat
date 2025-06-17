@echo off
echo BSN Datenbank - Starte alle Server...

echo Starte Backend-Server mit Daphne (WebSocket-Unterstützung)...
start "BSN Backend" cmd /k "cd backend && daphne -b 0.0.0.0 -p 8000 bsn_social_network.asgi:application"

echo Starte Frontend-Server mit Next.js...
start "BSN Frontend" cmd /k "cd frontend && npm run dev"

echo Alle Server wurden gestartet!
echo Backend: http://localhost:8000/
echo Frontend: http://localhost:3000/ 