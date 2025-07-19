# Backend Start Script für Windows

Write-Host "###################################################" -ForegroundColor Cyan
Write-Host "#           Backend Start Script                 #" -ForegroundColor Cyan
Write-Host "###################################################" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 Starting Django Backend..." -ForegroundColor Yellow

# Prüfe ob Python verfügbar ist
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python gefunden: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python nicht gefunden!" -ForegroundColor Red
    Write-Host "   Bitte installiere Python 3.8+ und versuche es erneut." -ForegroundColor Gray
    exit 1
}

# Wechsle ins Backend-Verzeichnis
if (Test-Path "backend") {
    Set-Location "backend"
    Write-Host "✅ Backend-Verzeichnis gefunden" -ForegroundColor Green
} else {
    Write-Host "❌ Backend-Verzeichnis nicht gefunden!" -ForegroundColor Red
    Write-Host "   Stelle sicher, dass du im Projekt-Root-Verzeichnis bist." -ForegroundColor Gray
    exit 1
}

# Prüfe ob Virtual Environment existiert
if (Test-Path "venv_new") {
    Write-Host "✅ Virtual Environment gefunden" -ForegroundColor Green
    Write-Host "🔧 Aktiviere Virtual Environment..." -ForegroundColor Yellow
    
    # Aktiviere Virtual Environment
    & ".\venv_new\Scripts\Activate.ps1"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Virtual Environment aktiviert" -ForegroundColor Green
    } else {
        Write-Host "❌ Virtual Environment Aktivierung fehlgeschlagen!" -ForegroundColor Red
        Write-Host "   Versuche: .\venv_new\Scripts\Activate.ps1" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "❌ Virtual Environment nicht gefunden!" -ForegroundColor Red
    Write-Host "   Erstelle Virtual Environment mit: python -m venv venv_new" -ForegroundColor Gray
    exit 1
}

# Prüfe ob Django installiert ist
try {
    $djangoVersion = python -c "import django; print(django.get_version())" 2>&1
    Write-Host "✅ Django gefunden: $djangoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Django nicht installiert!" -ForegroundColor Red
    Write-Host "   Installiere Django mit: pip install django" -ForegroundColor Gray
    exit 1
}

# Starte Django Server
Write-Host ""
Write-Host "🚀 Starte Django Server auf http://localhost:8000..." -ForegroundColor Yellow
Write-Host "   Drücke Ctrl+C zum Beenden" -ForegroundColor Gray
Write-Host ""

try {
    python manage.py runserver 8000
} catch {
    Write-Host "❌ Django Server Start fehlgeschlagen!" -ForegroundColor Red
    Write-Host "   Prüfe die Fehlermeldung oben." -ForegroundColor Gray
    exit 1
} 