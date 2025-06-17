#!/bin/bash
echo "BSN Datenbank - Starte alle Server..."

# Starte Backend-Server mit Daphne
echo "Starte Backend-Server mit Daphne (WebSocket-Unterstützung)..."
cd backend && daphne -b 0.0.0.0 -p 8000 bsn_social_network.asgi:application &
BACKEND_PID=$!

# Warte kurz, damit das Backend Zeit hat zu starten
sleep 2

# Starte Frontend-Server mit Next.js
echo "Starte Frontend-Server mit Next.js..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "Alle Server wurden gestartet!"
echo "Backend: http://localhost:8000/"
echo "Frontend: http://localhost:3000/"
echo "Drücke Strg+C, um beide Server zu beenden."

# Warte auf Benutzerabbruch und beende dann beide Prozesse
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait 