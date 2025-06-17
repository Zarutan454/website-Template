# BSN Datenbank - Entwicklungsbefehle

Dieses Dokument enthält alle wichtigen Befehle für die Entwicklung des BSN Datenbank-Projekts.

## Projektstruktur

- `backend/`: Django-Backend
- `frontend/`: Next.js-Frontend

## Server starten

### Automatisierte Startup-Skripte

#### Windows

Für Windows-Benutzer wurden Batch-Skripte erstellt, um das Starten der Server zu vereinfachen:

- `startup.bat`: Startet sowohl Backend- als auch Frontend-Server in separaten Fenstern
- `backend/startup.bat`: Startet nur den Backend-Server mit Daphne (WebSocket-Unterstützung)
- `frontend/startup.bat`: Startet nur den Frontend-Server

Zum Starten des gesamten Projekts einfach im Hauptverzeichnis ausführen:

```bash
startup.bat
```

#### Linux/Mac

Für Linux/Mac-Benutzer gibt es ein Shell-Skript:

- `start.sh`: Startet sowohl Backend- als auch Frontend-Server

Vor der ersten Verwendung muss das Skript ausführbar gemacht werden:

```bash
chmod +x start.sh
```

Danach kann das Projekt gestartet werden mit:

```bash
./start.sh
```

### Backend

Es gibt zwei Möglichkeiten, das Backend zu starten:

#### Option 1: Django-Entwicklungsserver (ohne WebSocket-Unterstützung)

```bash
cd backend
python manage.py runserver
```

Dieser Befehl startet den Django-Entwicklungsserver auf http://127.0.0.1:8000/, unterstützt aber keine WebSockets für Echtzeit-Chats.

#### Option 2: Daphne ASGI-Server (mit WebSocket-Unterstützung)

```bash
cd backend
daphne -b 0.0.0.0 -p 8000 bsn_social_network.asgi:application
```

Dieser Befehl startet den Daphne-Server, der sowohl HTTP- als auch WebSocket-Verbindungen unterstützt. Dies ist erforderlich, um die Echtzeit-Chat-Funktionalität zu nutzen.

### Frontend

```bash
cd frontend
npm run dev
```

Startet den Next.js-Entwicklungsserver auf http://localhost:3000/.

## Datenbank-Verwaltung

### Migrationen erstellen

```bash
cd backend
python manage.py makemigrations
```

### Migrationen anwenden

```bash
cd backend
python manage.py migrate
```

### Django-Admin erstellen

```bash
cd backend
python manage.py createsuperuser
```

## Paketinstallation

### Backend

```bash
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Entwicklungsworkflow

Für die vollständige Funktionalität des Projekts, inklusive Echtzeit-Chat, müssen folgende Server gestartet werden:

1. **Daphne ASGI-Server für Backend mit WebSocket-Unterstützung**:
   ```bash
   cd backend
   daphne -b 0.0.0.0 -p 8000 bsn_social_network.asgi:application
   ```

2. **Next.js-Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Troubleshooting

### WebSocket-Verbindungsprobleme

Wenn WebSocket-Verbindungen nicht funktionieren:

1. Stelle sicher, dass der Daphne-Server läuft statt des normalen Django-Entwicklungsservers
2. Überprüfe, ob die CORS-Einstellungen korrekt sind
3. Prüfe, ob der JWT-Token korrekt übergeben wird

### Fehlende Pakete

Wenn Fehlermeldungen zu fehlenden Paketen angezeigt werden:

```bash
pip install <paketname>
```

Zum Beispiel:
```bash
pip install drf-nested-routers
pip install channels daphne
```

## Produktions-Deployment

Für die Produktion wird empfohlen, Daphne mit einem ASGI-kompatiblen Server wie Uvicorn zu verwenden:

```bash
pip install uvicorn
uvicorn bsn_social_network.asgi:application --host 0.0.0.0 --port 8000
```

## Wichtige URLs

- Django-Admin: http://localhost:8000/admin/
- API-Dokumentation: http://localhost:8000/api/docs/
- Frontend: http://localhost:3000/

## WebSocket-Test

Um WebSocket-Verbindungen zu testen, kann man einen Chat öffnen und Nachrichten senden. Die URL für WebSocket-Verbindungen hat folgendes Format:

```
ws://localhost:8000/ws/chat/<chat_id>/?token=<jwt_token>
```

Hinweis: Im Frontend wird die WebSocket-URL automatisch aus dem API-Endpunkt `/api/v1/chats/<id>/websocket_url/` bezogen. 