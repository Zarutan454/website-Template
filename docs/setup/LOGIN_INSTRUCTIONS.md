# 🔐 BSN Login-Anleitung

## ✅ Testbenutzer erfolgreich erstellt!

### 👤 Benutzerdaten:
- **Username**: `test`
- **Email**: `test@bsn.network`
- **Password**: `Ostblokk1993`
- **User ID**: 2

---

## 🚀 Anmeldung durchführen:

### 1. Backend starten (bereits läuft):
```bash
cd backend
python manage.py runserver
```
**Status**: ✅ Läuft auf http://localhost:8000

### 2. Frontend starten:
```bash
# Im Hauptverzeichnis
npm run dev
```
**Erwartete URL**: http://localhost:5176

### 3. Anmeldung:
1. Gehe zu: http://localhost:5176/login
2. Verwende die obigen Benutzerdaten
3. Klicke auf "Sign In"

---

## 🔧 API-Endpoints verfügbar:

### Authentifizierung:
- `POST http://localhost:8000/api/v1/users/login/` - Login
- `POST http://localhost:8000/api/v1/users/register/` - Registrierung
- `POST http://localhost:8000/api/v1/users/logout/` - Logout
- `POST http://localhost:8000/api/v1/users/metamask/` - MetaMask Login

### Benutzerprofile:
- `GET http://localhost:8000/api/v1/users/profile/` - Profil abrufen
- `PUT http://localhost:8000/api/v1/users/profile/` - Profil aktualisieren

### Landing Page:
- `GET http://localhost:8000/api/v1/landing/ico/overview/` - ICO Übersicht
- `GET http://localhost:8000/api/v1/landing/faucet/` - Faucet Status

---

## 🧪 Test der API:

### Login-Test mit curl:
```bash
curl -X POST http://localhost:8000/api/v1/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "Ostblokk1993"
  }'
```

### Erwartete Antwort:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "username": "test",
    "email": "test@bsn.network",
    "first_name": "Test",
    "last_name": "User",
    "is_verified": true,
    "created_at": "2024-12-19T...",
    ...
  }
}
```

---

## 🔍 Troubleshooting:

### Falls Login nicht funktioniert:

1. **Backend läuft?**
   ```bash
   curl http://localhost:8000/api/v1/users/login/
   # Sollte 405 Method Not Allowed zurückgeben (nicht 404)
   ```

2. **CORS-Probleme?**
   - Prüfe Browser-Console auf CORS-Fehler
   - Backend CORS ist für localhost:5176 konfiguriert

3. **Datenbank-Probleme?**
   ```bash
   cd backend
   python manage.py shell
   >>> from django.contrib.auth import get_user_model
   >>> User = get_user_model()
   >>> User.objects.filter(username='test').exists()
   # Sollte True zurückgeben
   ```

4. **Frontend API-URL?**
   - Prüfe `src/utils/api.js` - API_BASE_URL sollte auf `http://localhost:8000/api/v1/` zeigen

---

## 📊 Status:

- ✅ **Backend**: Läuft auf http://localhost:8000
- ✅ **Datenbank**: Migriert und Testbenutzer erstellt
- ✅ **API**: Alle Endpoints verfügbar
- 🔄 **Frontend**: Muss gestartet werden
- 🔄 **Login**: Bereit zum Testen

---

## 🎯 Nächste Schritte:

1. **Frontend starten**: `npm run dev`
2. **Browser öffnen**: http://localhost:5176/login
3. **Anmelden** mit den Testdaten
4. **Dashboard testen** nach erfolgreicher Anmeldung

**Viel Erfolg beim Testen! 🚀** 