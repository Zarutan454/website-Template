# Manuelle Test-Checkliste

## 🚀 Vorbereitung
- [ ] Frontend läuft auf http://localhost:3000
- [ ] Backend läuft auf http://localhost:8000
- [ ] Browser ist geöffnet

## 1. Authentifizierung & Registrierung

### 1.1 Login-Funktionalität
**URL:** http://localhost:3000/login

**Tests:**
- [ ] **Seite lädt korrekt** - Login3D-Komponente wird angezeigt
- [ ] **3D-Design** - Moderne Animationen und Effekte sind sichtbar
- [ ] **Formular-Validierung** - Leere Felder zeigen Fehlermeldungen
- [ ] **Email-Format** - Ungültige Email-Adressen werden abgelehnt
- [ ] **Passwort-Validierung** - Passwort-Feld funktioniert korrekt
- [ ] **Remember Me** - Checkbox funktioniert
- [ ] **Forgot Password** - Link ist vorhanden (noch nicht implementiert)
- [ ] **Register Link** - Führt zur Registrierungsseite

### 1.2 Registrierung-Funktionalität
**URL:** http://localhost:3000/register

**Tests:**
- [ ] **Seite lädt korrekt** - Register3D-Komponente wird angezeigt
- [ ] **3D-Design** - Konsistent mit Login-Seite
- [ ] **Formular-Validierung** - Alle Felder werden validiert
- [ ] **Passwort-Bestätigung** - Passwörter müssen übereinstimmen
- [ ] **Email-Format** - Email-Validierung funktioniert
- [ ] **Benutzername** - Feld ist vorhanden und funktioniert
- [ ] **Terms & Conditions** - Checkbox ist vorhanden
- [ ] **Login Link** - Führt zurück zur Login-Seite

### 1.3 Design-Konsistenz
- [ ] **Farben** - Pink/Purple Gradient konsistent
- [ ] **Animationen** - Smooth Transitions zwischen Seiten
- [ ] **Responsive** - Funktioniert auf Mobile und Desktop
- [ ] **Loading States** - Spinner bei API-Calls

## 2. API-Integration

### 2.1 Backend-Verbindung
**URL:** http://localhost:8000/api/

**Tests:**
- [ ] **Server läuft** - Keine 404/500 Fehler
- [ ] **CORS** - Frontend kann Backend erreichen
- [ ] **Authentication** - API erfordert Token
- [ ] **Posts Endpoint** - /api/posts/ ist erreichbar
- [ ] **Users Endpoint** - /api/users/ ist erreichbar

### 2.2 Frontend-API
- [ ] **Login API** - Authentifizierung funktioniert
- [ ] **Register API** - Benutzer-Erstellung funktioniert
- [ ] **Token Storage** - Tokens werden gespeichert
- [ ] **Error Handling** - Fehler werden angezeigt
- [ ] **Loading States** - Spinner bei API-Calls

## 3. Navigation & Routing

### 3.1 Seiten-Navigation
- [ ] **Hauptseite** - / lädt korrekt
- [ ] **Login** - /login funktioniert
- [ ] **Register** - /register funktioniert
- [ ] **Feed** - /feed (nach Login) funktioniert
- [ ] **Profil** - /profile funktioniert

### 3.2 Geschützte Routen
- [ ] **Feed ohne Login** - Redirect zu Login
- [ ] **Profil ohne Login** - Redirect zu Login
- [ ] **Nach Login** - Zugriff auf geschützte Seiten

## 4. Feed & Posts

### 4.1 Post-Anzeige
**URL:** http://localhost:3000/feed (nach Login)

**Tests:**
- [ ] **Posts laden** - Posts werden angezeigt
- [ ] **Bilder** - Post-Bilder werden geladen
- [ ] **Like-Status** - Like-Buttons zeigen korrekten Status
- [ ] **Kommentare** - Kommentare werden angezeigt
- [ ] **Profilbilder** - Benutzer-Avatare werden angezeigt

### 4.2 Like/Unlike-Funktionalität
- [ ] **Like klicken** - Like-Counter erhöht sich
- [ ] **Unlike klicken** - Like-Counter verringert sich
- [ ] **Like-Status** - Button zeigt korrekten Zustand
- [ ] **API-Update** - Änderungen werden gespeichert

### 4.3 Kommentar-Funktionalität
- [ ] **Kommentar-Input** - Textfeld ist vorhanden
- [ ] **Profilbild** - Benutzer-Avatar wird angezeigt
- [ ] **Kommentar posten** - Kommentar wird erstellt
- [ ] **Kommentar-Counter** - Anzahl wird aktualisiert

## 5. Profilseite

### 5.1 Profil-Anzeige
**URL:** http://localhost:3000/profile (nach Login)

**Tests:**
- [ ] **Profilbild** - Avatar wird angezeigt
- [ ] **Cover-Bild** - Cover-Image wird angezeigt
- [ ] **Benutzerinfo** - Name, Email, etc. werden angezeigt
- [ ] **Posts** - Benutzer-Posts werden geladen

### 5.2 Like/Unlike auf Profilseite
- [ ] **Konsistenz** - Identisch zur Hauptseite
- [ ] **Like-Status** - Wird korrekt erkannt
- [ ] **API-Integration** - Funktioniert mit Backend

### 5.3 Kommentare auf Profilseite
- [ ] **Profilbild im Input** - Avatar wird angezeigt
- [ ] **Kommentar-Erstellung** - Funktioniert korrekt
- [ ] **Konsistenz** - Identisch zur Hauptseite

## 6. Performance & Stabilität

### 6.1 Ladezeiten
- [ ] **Seiten laden schnell** - < 3 Sekunden
- [ ] **Bilder optimiert** - Keine langen Ladezeiten
- [ ] **API-Responses** - Schnelle Antworten

### 6.2 Stabilität
- [ ] **Keine Console-Fehler** - JavaScript läuft fehlerfrei
- [ ] **Keine 404/500 Fehler** - Alle URLs funktionieren
- [ ] **Responsive Design** - Funktioniert auf allen Geräten

## 7. Browser-Kompatibilität

### 7.1 Verschiedene Browser
- [ ] **Chrome** - Funktioniert korrekt
- [ ] **Firefox** - Funktioniert korrekt
- [ ] **Safari** - Funktioniert korrekt
- [ ] **Edge** - Funktioniert korrekt

### 7.2 Mobile Browser
- [ ] **Mobile Chrome** - Responsive Design funktioniert
- [ ] **Mobile Safari** - Touch-Interaktionen funktionieren

## Test-Ergebnisse

### ✅ Erfolgreiche Tests
- [ ] Liste alle erfolgreichen Tests

### ❌ Gefundene Probleme
- [ ] Dokumentiere alle Probleme

### 🔧 Empfehlungen
- [ ] Verbesserungsvorschläge

## Nächste Schritte
1. Automatische Tests implementieren
2. Performance-Monitoring einrichten
3. Error-Tracking implementieren
4. Browser-Tests automatisieren 