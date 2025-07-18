# BSN System - Automatischer Start aller Komponenten
# Verwendung: powershell -ExecutionPolicy Bypass -File start_all.ps1

Write-Host "🚀 Starting BSN Complete System..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Blue

# Überprüfe ob alle Verzeichnisse existieren
if (!(Test-Path "backend")) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "package.json")) {
    Write-Host "❌ Frontend package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Directories found - Starting components..." -ForegroundColor Yellow

# 1. Backend Django Server starten
Write-Host "🐍 Starting Django Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-Command", 
    "cd backend; .\\venv\\Scripts\\activate; Write-Host '🚀 Django Server starting on http://localhost:8000' -ForegroundColor Green; python manage.py runserver"
)

# Kurz warten
Start-Sleep -Seconds 2

# 2. Celery Mining System starten  
Write-Host "⛏️ Starting Celery Mining System..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command", 
    "cd backend; .\\venv\\Scripts\\activate; Write-Host '⚡ Starting Mining System with Celery...' -ForegroundColor Green; python start_mining_system.py --start; Write-Host '✅ Mining System started! Monitor with: python start_mining_system.py --status' -ForegroundColor Green"
)

# Kurz warten
Start-Sleep -Seconds 2

# 3. Frontend React App starten
Write-Host "🌐 Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command", 
    "Write-Host '🚀 React Frontend starting on http://localhost:3000' -ForegroundColor Green; npm start"
)

# Kurz warten für alle Starts
Start-Sleep -Seconds 3

# 4. System Monitor öffnen
Write-Host "📊 Opening System Monitor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command", 
    "cd backend; .\\venv\\Scripts\\activate; Write-Host '📊 BSN System Monitor - Use these commands:' -ForegroundColor Yellow; Write-Host '  python start_mining_system.py --status   # System status' -ForegroundColor White; Write-Host '  python start_mining_system.py --test     # Test heartbeat' -ForegroundColor White; Write-Host '  python manage.py shell                   # Django shell' -ForegroundColor White; Write-Host '📊 Checking initial status...' -ForegroundColor Yellow; python start_mining_system.py --status"
)

Write-Host ""
Write-Host "✅ BSN System Startup Complete!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Blue
Write-Host "🌐 Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "🐍 Backend:   http://localhost:8000" -ForegroundColor Yellow  
Write-Host "🔧 Admin:     http://localhost:8000/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Monitor your system with the opened monitor terminal" -ForegroundColor Cyan
Write-Host "🔄 All terminals will remain open for monitoring" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 To stop: Close all PowerShell windows or Ctrl+C in each" -ForegroundColor Red
Write-Host "=" * 50 -ForegroundColor Blue

# Optional: Browser automatisch öffnen
$openBrowser = Read-Host "🌐 Open browser automatically? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Sleep -Seconds 5  # Warten bis Server gestartet sind
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:8000"
    Write-Host "🌐 Browser windows opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 System is starting up... Please wait a moment for all services to initialize" -ForegroundColor Green
Read-Host "Press Enter to exit this startup script (services will continue running)" 