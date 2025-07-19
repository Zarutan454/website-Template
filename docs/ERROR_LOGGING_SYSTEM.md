# Error Logging System - Dokumentation

## Übersicht

Das Error-Logging-System ist ein sicheres, umfassendes System zur Überwachung und Protokollierung von Frontend-Fehlern in Echtzeit. Es wurde nach Best Practices entwickelt und ist nur in der Development-Umgebung aktiv.

## Features

### ✅ Sicherheitsfeatures

- **Nur in Development aktiv** - Keine Produktionsdaten
- **Silent Fail** - Keine App-Crashes durch Logger-Fehler
- **Daten-Sanitization** - Sensitive Daten werden entfernt
- **Begrenzte Log-Anzahl** - Maximal 50 Logs im Speicher
- **WebSocket-Fallback** - Automatische Reconnect-Versuche

### ✅ Monitoring-Features

- **Echtzeit-Überwachung** - WebSocket-Verbindung zum Backend
- **Console-Interception** - Automatische Erfassung von console.error/warn/info
- **Global Error Handling** - Erfassung von unhandled errors und promise rejections
- **DevTools Integration** - Direkter Zugriff über Browser Console
- **Terminal Monitoring** - Scripts für Backend-Log-Überwachung

## Architektur

### Frontend (TypeScript)

```
src/utils/debugUtils.ts     - Hauptlogger mit SafeErrorLogger Klasse
src/utils/devTools.ts       - DevTools Integration
src/App.tsx                - Integration in App
```

### Backend (Python/Django)

```
backend/bsn_social_network/consumers.py  - SafeErrorLoggerConsumer
backend/bsn_social_network/views.py      - API Endpoint für Error Logs
backend/bsn_social_network/urls.py       - URL Routing
backend/bsn_social_network/routing.py    - WebSocket Routing
```

### Monitoring Scripts

```
scripts/monitor-errors.sh   - Bash Script für Linux/Mac
scripts/monitor-errors.ps1  - PowerShell Script für Windows
```

## Verwendung

### 1. Automatische Aktivierung

Das System wird automatisch in der Development-Umgebung aktiviert:

```typescript
// Nur aktiv wenn import.meta.env.DEV === true
if (import.meta.env.DEV) {
  // Error Logger wird automatisch initialisiert
}
```

### 2. Manuelle Logging

```typescript
import { DebugUtils } from './utils/debugUtils';

// Verschiedene Log-Level
DebugUtils.logError('Kritischer Fehler', 'ComponentName', { additionalData: true });
DebugUtils.logWarning('Warnung', 'ComponentName', { additionalData: true });
DebugUtils.logInfo('Information', 'ComponentName', { additionalData: true });
DebugUtils.logDebug('Debug Info', 'ComponentName', { additionalData: true });
```

### 3. DevTools Zugriff

Im Browser Console verfügbar:

```javascript
// Alle Logs anzeigen
window.errorLogger.getLogs()

// Logs löschen
window.errorLogger.clearLogs()

// Direkte Logging-Methoden
window.logError('Test Error')
window.logWarning('Test Warning')
window.logInfo('Test Info')
window.logDebug('Test Debug')
```

### 4. Terminal Monitoring

```bash
# Linux/Mac
./scripts/monitor-errors.sh

# Windows PowerShell
.\scripts\monitor-errors.ps1
```

## Konfiguration

### Environment Variables

```env
# Frontend (.env)
VITE_WS_URL=ws://localhost:8000  # WebSocket URL
VITE_APP_VERSION=1.0.0           # App Version für Logs

# Backend (settings.py)
DEBUG=True                        # Nur wenn True ist Logger aktiv
```

### WebSocket URLs

- **Error Logger**: `ws://localhost:8000/ws/error-logger/`
- **API Endpoint**: `http://localhost:8000/api/error-logs/`

## Datenstruktur

### ErrorLog Interface

```typescript
interface ErrorLog {
  timestamp: string;                    // ISO Timestamp
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;                      // Sanitized message (max 500 chars)
  context?: string;                     // Component/Context name
  url: string;                          // Current page URL
  userAgent: string;                    // Browser user agent
  userId?: string;                      // User ID if logged in
  component?: string;                   // Current component
  additionalData?: Record<string, unknown>; // Sanitized additional data
  sessionId?: string;                   // Unique session ID
}
```

### Backend EventLog Model

```python
EventLog.objects.create(
    event_type='frontend_error',
    level=level,                        # debug, info, warning, error, critical
    user_id=user_id,                   # Optional user ID
    message=message,                    # Sanitized message
    metadata={                          # Additional context
        'url': url,
        'component': component,
        'context': context,
        'sessionId': session_id,
        'additionalData': additional_data
    }
)
```

## Sicherheitsmaßnahmen

### 1. Daten-Sanitization

```typescript
// Sensitive Daten werden automatisch entfernt
private sanitizeMessage(message: string): string {
  return message
    .replace(/password[=:]\s*\w+/gi, 'password=***')
    .replace(/token[=:]\s*\w+/gi, 'token=***')
    .replace(/key[=:]\s*\w+/gi, 'key=***')
    .substring(0, 500); // Begrenze Länge
}
```

### 2. Silent Fail

```typescript
// Alle Logger-Operationen sind in Try-Catch
try {
  // Logger Operation
} catch (error) {
  console.warn('Error logging failed:', error);
  // Keine App-Crashes durch Logger-Fehler
}
```

### 3. Development Only

```python
# Backend - Nur in DEBUG aktiv
if not settings.DEBUG:
    return Response({'status': 'disabled'})

# Frontend - Nur in DEV aktiv
if (!import.meta.env.DEV) return;
```

## Troubleshooting

### 1. WebSocket Verbindung fehlgeschlagen

```javascript
// Prüfe in Browser Console
window.errorLogger.isEnabled  // Sollte true sein
window.errorLogger.logs       // Sollte Array sein
```

### 2. Backend Logs nicht sichtbar

```bash
# Prüfe Django Logs
cd backend
python manage.py runserver

# Oder verwende Monitoring Script
./scripts/monitor-errors.sh
```

### 3. DevTools nicht verfügbar

```javascript
// Prüfe in Browser Console
window.debugUtils  // Sollte verfügbar sein
window.errorLogger // Sollte verfügbar sein
```

## Best Practices

### 1. Logging Guidelines

```typescript
// ✅ Gut - Kontext und zusätzliche Daten
DebugUtils.logError('API call failed', 'UserProfile', {
  endpoint: '/api/user/profile',
  statusCode: 500,
  userId: user.id
});

// ❌ Schlecht - Keine zusätzlichen Informationen
console.error('Error occurred');
```

### 2. Performance

- Logger ist nur in Development aktiv
- Logs sind auf 50 Einträge begrenzt
- WebSocket-Verbindung hat automatische Reconnect-Logik
- Silent Fail verhindert App-Crashes

### 3. Sicherheit

- Sensitive Daten werden automatisch entfernt
- Nur in Development-Umgebung aktiv
- Keine Produktionsdaten werden geloggt
- WebSocket-Verbindung ist sicher konfiguriert

## Erweiterungen

### 1. Zusätzliche Log-Level

```typescript
// Neue Log-Level hinzufügen
DebugUtils.logCritical('Kritischer Systemfehler', 'System', { critical: true });
```

### 2. Custom Sanitization

```typescript
// Eigene Sanitization-Regeln
private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  // Eigene Regeln hier
  return sanitized;
}
```

### 3. Export/Import Logs

```typescript
// Logs exportieren
const logs = window.errorLogger.getLogs();
const json = JSON.stringify(logs, null, 2);
// Download als JSON-Datei
```

## Support

Bei Problemen mit dem Error-Logging-System:

1. **Prüfe Browser Console** für JavaScript-Fehler
2. **Prüfe Django Logs** für Backend-Fehler
3. **Verwende Monitoring Scripts** für Echtzeit-Überwachung
4. **Teste mit DevTools Commands** für manuelle Tests

Das System ist so konzipiert, dass es niemals die Hauptanwendung beeinträchtigt und immer sicher funktioniert.
