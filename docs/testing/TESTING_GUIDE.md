# BSN Website - Vollständige Funktionalitätstests

## 🚀 Setup und Start

### Backend (Django)
```bash
cd backend
python manage.py runserver
# Backend läuft auf: http://127.0.0.1:8000
```

### Frontend (React + Vite)
```bash
npm run dev
# Frontend läuft auf: http://localhost:5174
```

## 📋 Systematische Test-Checkliste

### 1. ✅ Basis-Funktionalität (BEHOBEN)
- [x] Backend startet ohne Fehler
- [x] Frontend startet ohne Fehler  
- [x] Alle Seiten laden korrekt
- [x] Einheitliches Design auf allen Seiten
- [x] CORS korrekt konfiguriert

### 2. 🔐 Authentifizierung (WEB1 - Klassisch)

#### Login-Funktionalität
**Test-Schritte:**
1. Gehe zu `/login`
2. Gib Test-Credentials ein:
   - Email: `test@example.com`
   - Password: `testpassword123`
3. Klicke "Sign In"

**Erwartetes Verhalten:**
- ✅ Login-Form wird angezeigt
- 🔄 API-Call an `/api/users/login/`
- 🔄 Bei Erfolg: Redirect zum Dashboard
- 🔄 Bei Fehler: Fehlermeldung anzeigen

#### Registrierung
**Test-Schritte:**
1. Gehe zu `/register`
2. Wähle "Email Registration"
3. Fülle alle Felder aus
4. Klicke "Create Account"

**Erwartetes Verhalten:**
- ✅ Registrierungs-Form wird angezeigt
- 🔄 Validierung funktioniert
- 🔄 API-Call an `/api/users/register/`

### 3. 🌐 Web3-Funktionalität (WEB3 - Blockchain)

#### MetaMask-Verbindung
**Test-Schritte:**
1. Gehe zu `/register`
2. Wähle "Wallet Connect"
3. Klicke "Connect MetaMask"

**Erwartetes Verhalten:**
- 🔄 MetaMask-Popup öffnet sich
- 🔄 Wallet-Adresse wird angezeigt

### 4. 📊 Dashboard-Funktionalität

#### Dashboard-Zugriff
**Test-Schritte:**
1. Logge dich ein
2. Gehe zu `/dashboard`

**Erwartetes Verhalten:**
- ✅ Dashboard lädt korrekt
- ✅ Benutzer-Informationen werden angezeigt

## 🐛 Bekannte Probleme & Lösungen

### Problem 1: API-Endpoints nicht erreichbar
**Lösung:** Backend starten und CORS prüfen

### Problem 2: MetaMask-Verbindung schlägt fehl
**Lösung:** MetaMask installieren und entsperren

## 📊 Test-Status Übersicht

| Kategorie | Status | Bemerkungen |
|-----------|--------|-------------|
| 🎨 Design | ✅ | Einheitlich auf allen Seiten |
| 🔐 Auth (Email) | 🔄 | Needs API testing |
| 🌐 Auth (Web3) | 🔄 | Needs MetaMask testing |
| 📊 Dashboard | ✅ | UI complete, needs API |
| 💰 Faucet | ✅ | UI complete, needs API |
| 🎯 Referral | ✅ | UI complete, needs API |
| 💎 Token Reservation | ✅ | UI complete, needs API |

---

**Status:** 🟡 Teilweise funktionsfähig - Frontend komplett, Backend-Integration in Arbeit 