# 🚀 BSN System - Komplette Startanleitung

**Letzte Aktualisierung:** 27. Dezember 2024  
**System:** Windows PowerShell  
**Status:** ✅ Alle Unicode-Probleme behoben, vollständig funktional

## 📋 Schnellstart (Alles in einem)

```powershell
# Terminal 1: Backend + Mining System starten
cd backend
.\\venv\\Scripts\\activate
python manage.py runserver

# Terminal 2: Celery Worker + Beat starten  
cd backend
.\\venv\\Scripts\\activate
python start_mining_system.py --start

# Terminal 3: Frontend starten
npm start
# oder
yarn start

# Terminal 4: System überwachen
cd backend
.\\venv\\Scripts\\activate
python start_mining_system.py --status
```

---

## 🔧 Detaillierte Startanleitungen

### 1. 🐍 Backend (Django) starten

```powershell
# Basis-Setup
cd backend
.\\venv\\Scripts\\activate

# Datenbank migrieren (falls nötig)
python manage.py migrate

# Django Development Server starten
python manage.py runserver

# Alternative: Mit spezifischem Port
python manage.py runserver 8000
```

**✅ Backend läuft auf:** `http://localhost:8000`

---

### 2. ⛏️ Mining System (Celery) starten

```powershell
# Terminal für Celery
cd backend
.\\venv\\Scripts\\activate

# Option A: Alles automatisch starten
python start_mining_system.py --start

# Option B: Manuell starten
# Celery Worker (separates Terminal)
celery -A bsn worker --loglevel=info --pool=solo

# Celery Beat (separates Terminal)  
celery -A bsn beat --loglevel=info
```

**✅ Mining System Features:**
- ⏰ Heartbeat-Überwachung alle 10 Minuten
- 🔄 Automatisches Stoppen bei Inaktivität (5 Min)
- 📊 Token-Akkumulation in Echtzeit

---

### 3. 🌐 Frontend (React) starten

```powershell
# Frontend-Setup
npm install
# oder
yarn install

# Development Server starten
npm start
# oder  
yarn start

# Alternative: Mit spezifischem Port
npm start -- --port 3001
```

**✅ Frontend läuft auf:** `http://localhost:3000`

---

## 📊 System-Überwachung & Debugging

### Mining System überwachen

```powershell
cd backend
.\\venv\\Scripts\\activate

# System-Status prüfen
python start_mining_system.py --status

# Heartbeat-System testen
python start_mining_system.py --test

# Hilfe anzeigen
python start_mining_system.py --help
```

### Django Admin & Shell

```powershell
cd backend
.\\venv\\Scripts\\activate

# Django Admin aufrufen
python manage.py createsuperuser  # Erstmalig
# Dann: http://localhost:8000/admin

# Django Shell für Debugging
python manage.py shell

# Spezifische User-Checks
python manage.py shell -c "
from bsn_social_network.models import User, MiningProgress
user = User.objects.get(email='fabian@bsn.com')
progress = MiningProgress.objects.get(user=user)
print(f'Mining: {progress.is_mining}')
print(f'Tokens: {progress.accumulated_tokens}')
"
```

---

## 🔄 Automatisierte Startscripts

### Windows PowerShell Script

```powershell
# Datei: start_all.ps1
Write-Host "🚀 Starting BSN System..." -ForegroundColor Green

# Backend starten (neues Terminal)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\\venv\\Scripts\\activate; python manage.py runserver"

# Celery starten (neues Terminal)  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\\venv\\Scripts\\activate; python start_mining_system.py --start"

# Frontend starten (neues Terminal)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "✅ All systems started!" -ForegroundColor Green
Write-Host "📊 Monitor: cd backend && python start_mining_system.py --status" -ForegroundColor Yellow
```

**Verwendung:**
```powershell
powershell -ExecutionPolicy Bypass -File start_all.ps1
```

---

## 🛠️ Entwicklungsumgebung Setup

### Einmaliges Setup

```powershell
# 1. Backend Setup
cd backend
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt

# 2. Datenbank erstellen
python manage.py migrate

# 3. Superuser erstellen
python manage.py createsuperuser

# 4. Frontend Setup
npm install
```

### Nach Git Pull

```powershell
# Backend aktualisieren
cd backend
.\\venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate

# Frontend aktualisieren  
npm install
```

---

## 📱 Production Deployment

### Backend (Production)

```powershell
# Mit Gunicorn (Production Server)
cd backend
.\\venv\\Scripts\\activate
pip install gunicorn
gunicorn bsn.wsgi:application --bind 0.0.0.0:8000

# Mit Redis (Production Celery)
# Redis installieren und starten
celery -A bsn worker --loglevel=info
celery -A bsn beat --loglevel=info
```

### Frontend (Production)

```powershell
# Build für Production
npm run build

# Serve static files
npm install -g serve
serve -s build -l 3000
```

---

## 🚨 Troubleshooting

### Häufige Probleme

**Problem:** Unicode/Emoji Fehler
```powershell
# Lösung: Encoding fix bereits implementiert
# System läuft automatisch mit korrektem Encoding
```

**Problem:** Celery Status zeigt Fehler
```powershell
# Normal! Memory Broker zeigt Status-Fehler, funktioniert aber
# Testen mit:
python start_mining_system.py --test
```

**Problem:** Port bereits belegt
```powershell
# Backend anderen Port
python manage.py runserver 8001

# Frontend anderen Port  
npm start -- --port 3001
```

**Problem:** Mining läuft offline weiter
```powershell
# Mining-Session manuell stoppen
cd backend
.\\venv\\Scripts\\activate
python manage.py shell -c "
from bsn_social_network.services.mining_service import MiningService
from bsn_social_network.models import User
user = User.objects.get(email='DEINE_EMAIL')
MiningService.stop_mining_session(user)
"
```

---

## 📞 Quick Commands Cheat Sheet

| Aktion | Befehl |
|--------|--------|
| **Backend starten** | `cd backend && .\\venv\\Scripts\\activate && python manage.py runserver` |
| **Celery starten** | `cd backend && .\\venv\\Scripts\\activate && python start_mining_system.py --start` |
| **Frontend starten** | `npm start` |
| **System überwachen** | `cd backend && python start_mining_system.py --status` |
| **Mining testen** | `cd backend && python start_mining_system.py --test` |
| **Admin aufrufen** | `http://localhost:8000/admin` |
| **Frontend aufrufen** | `http://localhost:3000` |

---

## 🎯 Systemstatus Checkliste

- [ ] **Backend läuft** (Django auf Port 8000)
- [ ] **Celery Worker aktiv** (Mining-Tasks)  
- [ ] **Celery Beat läuft** (Scheduled Cleanup)
- [ ] **Frontend läuft** (React auf Port 3000)
- [ ] **Heartbeat funktioniert** (Test erfolgreich)
- [ ] **Mining überwacht** (Inaktive Sessions = 0)

**Bei grünen Häkchen ist das System vollständig operational! 🎉**

---

**📧 Kontakt bei Problemen:** [Deine Email]  
**📂 Projektpfad:** `C:\Users\Latitude 5510\Documents\GitHub\website-Template` 