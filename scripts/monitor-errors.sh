#!/bin/bash
# Error Monitoring Script für Development

echo "###################################################"
echo "#           Error Logger Monitor                  #"
echo "###################################################"

# Funktion zum Überwachen der Backend-Logs
monitor_backend_logs() {
    echo "🔍 Überwache Backend-Logs..."
    echo "Drücke Ctrl+C zum Beenden"
    echo ""
    
    # Tail die Django-Logs
    if [ -f "backend/logs/bsn.log" ]; then
        tail -f backend/logs/bsn.log | grep -E "(ERROR|WARNING|CRITICAL|frontend_error)"
    else
        echo "⚠️  Backend-Log-Datei nicht gefunden. Starte Backend mit:"
        echo "   cd backend && python manage.py runserver"
        echo ""
        echo "🔍 Überwache Django Console Output..."
        echo "Drücke Ctrl+C zum Beenden"
        echo ""
    fi
}

# Funktion zum Überwachen der Frontend-Logs
monitor_frontend_logs() {
    echo "🔍 Überwache Frontend-Logs..."
    echo "Öffne Browser DevTools und schaue in die Console"
    echo "Drücke Ctrl+C zum Beenden"
    echo ""
    
    # Zeige verfügbare DevTools Commands
    echo "🔧 Verfügbare DevTools Commands:"
    echo "   window.errorLogger.getLogs() - Zeige alle Error Logs"
    echo "   window.errorLogger.clearLogs() - Lösche alle Logs"
    echo "   window.logError('Test Error') - Test Error Log"
    echo "   window.logWarning('Test Warning') - Test Warning Log"
    echo "   window.logInfo('Test Info') - Test Info Log"
    echo "   window.logDebug('Test Debug') - Test Debug Log"
    echo ""
}

# Funktion zum Testen des Error Loggers
test_error_logger() {
    echo "🧪 Teste Error Logger..."
    echo "Öffne Browser Console und führe aus:"
    echo ""
    echo "window.logError('Test Error vom Terminal', 'TestContext', {test: true});"
    echo "window.logWarning('Test Warning vom Terminal', 'TestContext', {test: true});"
    echo "window.logInfo('Test Info vom Terminal', 'TestContext', {test: true});"
    echo ""
}

# Hauptmenü
show_menu() {
    echo ""
    echo "Wähle eine Option:"
    echo "1) Backend Logs überwachen"
    echo "2) Frontend Logs überwachen"
    echo "3) Error Logger testen"
    echo "4) Beide überwachen"
    echo "5) Beenden"
    echo ""
    read -p "Deine Wahl (1-5): " choice
}

# Hauptschleife
while true; do
    show_menu
    
    case $choice in
        1)
            monitor_backend_logs
            ;;
        2)
            monitor_frontend_logs
            ;;
        3)
            test_error_logger
            ;;
        4)
            echo "🔍 Starte beide Monitor..."
            echo "Backend: Terminal 1"
            echo "Frontend: Browser DevTools"
            echo ""
            monitor_backend_logs &
            backend_pid=$!
            echo "Backend Monitor PID: $backend_pid"
            echo "Drücke Ctrl+C zum Beenden"
            wait $backend_pid
            ;;
        5)
            echo "👋 Beende Error Logger Monitor"
            exit 0
            ;;
        *)
            echo "❌ Ungültige Wahl. Bitte 1-5 wählen."
            ;;
    esac
    
    echo ""
    read -p "Drücke Enter für Hauptmenü..."
done 