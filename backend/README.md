# BSN Backend

Dieses Django-Backend dient als API für die BSN (Blockchain Social Network) Landing-Plattform.

## Projektstruktur

```
backend/
├── bsn/                   # Django-Hauptprojekt
│   ├── __init__.py
│   ├── asgi.py
│   ├── celery.py          # Celery-Konfiguration
│   ├── settings.py        # Projekteinstellungen
│   ├── urls.py            # Haupt-URL-Routing
│   └── wsgi.py
├── landing/               # App für Landing-Funktionen
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/
│   ├── models.py          # Modelle für Faucet, Referral, Token-Reservierung
│   ├── serializers.py     # API-Serialisierer
│   ├── tasks.py           # Celery-Tasks
│   ├── tests/             # Tests für die App
│   ├── urls.py            # URL-Routing für die App
│   └── views.py           # API-Views
├── users/                 # App für Benutzer-Management
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/
│   ├── models.py          # Erweitertes User-Modell
│   ├── serializers.py     # User-Serialisierer
│   ├── tests/             # Tests für die App
│   ├── urls.py            # URL-Routing für die App
│   └── views.py           # Auth-Views
├── manage.py              # Django-Management-Skript
├── requirements.txt       # Projektabhängigkeiten
└── .env.example           # Beispiel für Umgebungsvariablen
```

## Einrichtung

1. Python-Umgebung erstellen und aktivieren:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Unter Windows: venv\Scripts\activate
   ```

2. Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```

3. Umgebungsvariablen konfigurieren:
   ```bash
   cp .env.example .env
   # Bearbeite die .env-Datei mit deinen Einstellungen
   ```

4. Datenbank-Migrationen durchführen:
   ```bash
   python manage.py migrate
   ```

5. Superuser erstellen:
   ```bash
   python manage.py createsuperuser
   ```

6. Entwicklungsserver starten:
   ```bash
   python manage.py runserver
   ```

## API-Endpunkte

### Authentifizierung
- `POST /api/auth/register/` - Benutzer registrieren
- `POST /api/auth/login/` - Benutzer anmelden
- `POST /api/auth/token/refresh/` - Token aktualisieren
- `POST /api/auth/logout/` - Benutzer abmelden

### Faucet
- `GET /api/faucet/status/` - Status des Faucets abfragen
- `POST /api/faucet/claim/` - Token beanspruchen

### Referral
- `GET /api/referral/code/` - Referral-Code abfragen/generieren
- `GET /api/referral/stats/` - Statistiken zu Referrals abfragen

### Token-Reservierung
- `POST /api/token-reserve/` - Token reservieren
- `GET /api/token-reserve/status/` - Status der Reservierung abfragen

### Newsletter
- `POST /api/newsletter/subscribe/` - Newsletter abonnieren
- `GET /api/newsletter/confirm/` - E-Mail-Adresse bestätigen

## Entwicklung

- API-Dokumentation: `/api/docs/`
- Admin-Interface: `/admin/`

## Tests ausführen

```bash
pytest
```

## Celery-Worker starten

```bash
celery -A bsn worker -l info
```

## Celery-Beat für geplante Aufgaben starten

```bash
celery -A bsn beat -l info
```
