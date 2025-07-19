# Error Monitoring Script für Windows PowerShell

Write-Host "###################################################" -ForegroundColor Cyan
Write-Host "#           Error Logger Monitor                  #" -ForegroundColor Cyan
Write-Host "###################################################" -ForegroundColor Cyan

# Funktion zum Überwachen der Backend-Logs
function Monitor-BackendLogs {
    Write-Host "🔍 Überwache Backend-Logs..." -ForegroundColor Yellow
    Write-Host "Drücke Ctrl+C zum Beenden" -ForegroundColor Gray
    Write-Host ""
    
    # Tail die Django-Logs
    if (Test-Path "backend/logs/bsn.log") {
        Get-Content "backend/logs/bsn.log" -Wait | Where-Object { $_ -match "(ERROR|WARNING|CRITICAL|frontend_error)" }
    } else {
        Write-Host "⚠️  Backend-Log-Datei nicht gefunden. Starte Backend mit:" -ForegroundColor Yellow
        Write-Host "   cd backend && python manage.py runserver" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔍 Überwache Django Console Output..." -ForegroundColor Yellow
        Write-Host "Drücke Ctrl+C zum Beenden" -ForegroundColor Gray
        Write-Host ""
    }
}

# Funktion zum Überwachen der Frontend-Logs
function Monitor-FrontendLogs {
    Write-Host "🔍 Überwache Frontend-Logs..." -ForegroundColor Yellow
    Write-Host "Öffne Browser DevTools und schaue in die Console" -ForegroundColor Gray
    Write-Host "Drücke Ctrl+C zum Beenden" -ForegroundColor Gray
    Write-Host ""
    
    # Zeige verfügbare DevTools Commands
    Write-Host "🔧 Verfügbare DevTools Commands:" -ForegroundColor Cyan
    Write-Host "   window.errorLogger.getLogs() - Zeige alle Error Logs" -ForegroundColor Green
    Write-Host "   window.errorLogger.clearLogs() - Lösche alle Logs" -ForegroundColor Green
    Write-Host "   window.logError('Test Error') - Test Error Log" -ForegroundColor Green
    Write-Host "   window.logWarning('Test Warning') - Test Warning Log" -ForegroundColor Green
    Write-Host "   window.logInfo('Test Info') - Test Info Log" -ForegroundColor Green
    Write-Host "   window.logDebug('Test Debug') - Test Debug Log" -ForegroundColor Green
    Write-Host ""
}

# Funktion zum Testen des Error Loggers
function Test-ErrorLogger {
    Write-Host "🧪 Teste Error Logger..." -ForegroundColor Yellow
    Write-Host "Öffne Browser Console und führe aus:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "window.logError('Test Error vom Terminal', 'TestContext', {test: true});" -ForegroundColor Green
    Write-Host "window.logWarning('Test Warning vom Terminal', 'TestContext', {test: true});" -ForegroundColor Green
    Write-Host "window.logInfo('Test Info vom Terminal', 'TestContext', {test: true});" -ForegroundColor Green
    Write-Host ""
}

# Hauptmenü
function Show-Menu {
    Write-Host ""
    Write-Host "Wähle eine Option:" -ForegroundColor Cyan
    Write-Host "1) Backend Logs überwachen" -ForegroundColor White
    Write-Host "2) Frontend Logs überwachen" -ForegroundColor White
    Write-Host "3) Error Logger testen" -ForegroundColor White
    Write-Host "4) Beide überwachen" -ForegroundColor White
    Write-Host "5) Beenden" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Deine Wahl (1-5)"
    return $choice
}

# Hauptschleife
while ($true) {
    $choice = Show-Menu
    
    switch ($choice) {
        "1" {
            Monitor-BackendLogs
        }
        "2" {
            Monitor-FrontendLogs
        }
        "3" {
            Test-ErrorLogger
        }
        "4" {
            Write-Host "🔍 Starte beide Monitor..." -ForegroundColor Yellow
            Write-Host "Backend: Terminal 1" -ForegroundColor Gray
            Write-Host "Frontend: Browser DevTools" -ForegroundColor Gray
            Write-Host ""
            Write-Host "⚠️  PowerShell unterstützt keine echten Background-Jobs für Tail" -ForegroundColor Yellow
            Write-Host "   Verwende Option 1 für Backend und Browser DevTools für Frontend" -ForegroundColor Gray
            Write-Host ""
        }
        "5" {
            Write-Host "👋 Beende Error Logger Monitor" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "❌ Ungültige Wahl. Bitte 1-5 wählen." -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Read-Host "Drücke Enter für Hauptmenü..."
} 