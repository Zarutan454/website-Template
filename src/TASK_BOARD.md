# BSN Website Task Board

## Übersicht der Aufgaben

| ID | Aufgabe | Status | Zuständig | Priorität | Deadline | Akzeptanzkriterien |
|----|---------|--------|-----------|-----------|----------|-------------------|
| 1 | Multi-Page-Struktur mit React Router | done | Developer | high | 2023-06-15 | - React Router eingerichtet<br>- Grundlegende Seitenstruktur erstellt<br>- Navigation zwischen Seiten funktioniert |
| 2 | Komponenten für Faucet-System | in progress | Developer | medium | 2023-06-20 | - FaucetWidget-Komponente erstellt<br>- API-Anbindung implementiert<br>- Benutzeroberfläche responsive |
| 3 | Komponenten für Referral-System | in progress | Developer | medium | 2023-06-20 | - ReferralWidget-Komponente erstellt<br>- Link-Generierung und -Tracking<br>- Dashboard für Statistiken |
| 4 | Komponenten für Token-Reservierung | in progress | Developer | medium | 2023-06-20 | - TokenReservationWidget-Komponente erstellt<br>- Wallet-Integration<br>- Bestätigungsprozess |
| 5 | Backend-Integration | todo | Developer | high | 2023-06-30 | - Django-Backend eingerichtet<br>- API-Endpunkte für alle Features<br>- Authentifizierung implementiert |
| 6 | Wallet-Integration | todo | Developer | high | 2023-06-25 | - Web3-Integration<br>- Unterstützung für mehrere Wallets<br>- Transaktionsverarbeitung |
| 7 | Benutzerauthentifizierung | todo | Developer | high | 2023-06-25 | - Login/Registrierung<br>- Profilseite<br>- Passwort-Reset |
| 8 | Dokumentation | in progress | Documentation | medium | 2023-07-05 | - Codekommentare<br>- README aktualisiert<br>- API-Dokumentation |
| 9 | Tests | todo | QA | medium | 2023-07-10 | - Unit-Tests<br>- Integration-Tests<br>- E2E-Tests |
| 10 | Deployment | todo | DevOps | low | 2023-07-15 | - Netlify-Konfiguration<br>- CI/CD-Pipeline<br>- Umgebungsvariablen |

## Detaillierte Aufgabenbeschreibungen

### 1. Multi-Page-Struktur mit React Router
**Status:** done  
**Beschreibung:** Implementierung einer Multi-Page-Struktur mit React Router für die verschiedenen Seiten der Anwendung.  
**Erledigt:**
- React Router installiert und konfiguriert
- Komponenten für HomePage, FaucetPage, ReferralPage und TokenReservationPage erstellt
- PageTemplate-Komponente für konsistentes Layout erstellt
- Navbar mit Links zu allen Seiten aktualisiert

### 2. Komponenten für Faucet-System
**Status:** in progress  
**Beschreibung:** Entwicklung der Komponenten für das Faucet-System, mit dem Benutzer kostenlose BSN-Token erhalten können.  
**Nächste Schritte:**
- Implementierung der FaucetWidget-Komponente mit Funktionalität
- API-Anbindung für Token-Anfragen
- Cooldown-Timer und Statusanzeige

### 3. Komponenten für Referral-System
**Status:** in progress  
**Beschreibung:** Entwicklung der Komponenten für das Referral-System, mit dem Benutzer Freunde einladen und Belohnungen erhalten können.  
**Nächste Schritte:**
- Implementierung der ReferralWidget-Komponente mit Funktionalität
- Generierung und Tracking von Referral-Links
- Dashboard für Statistiken und Belohnungen

### 4. Komponenten für Token-Reservierung
**Status:** in progress  
**Beschreibung:** Entwicklung der Komponenten für die Token-Reservierung, mit der Benutzer BSN-Token reservieren können.  
**Nächste Schritte:**
- Implementierung der TokenReservationWidget-Komponente mit Funktionalität
- Integration mit Wallet für Zahlungen
- Bestätigungs- und Tracking-System

### 5. Backend-Integration
**Status:** todo  
**Beschreibung:** Integration des Django-Backends mit dem Frontend für alle Features.  
**Nächste Schritte:**
- Django-Backend einrichten
- API-Endpunkte für Faucet, Referral und Token-Reservierung implementieren
- Authentifizierung und Autorisierung einrichten

### 6. Wallet-Integration
**Status:** todo  
**Beschreibung:** Integration verschiedener Wallets für Blockchain-Interaktionen.  
**Nächste Schritte:**
- Web3-Integration implementieren
- Unterstützung für MetaMask, WalletConnect und andere Wallets hinzufügen
- Transaktionsverarbeitung und -tracking

### 7. Benutzerauthentifizierung
**Status:** todo  
**Beschreibung:** Implementierung eines Benutzerauthentifizierungssystems für die Anwendung.  
**Nächste Schritte:**
- Login- und Registrierungsformulare erstellen
- Profilseite mit Benutzerinformationen
- Passwort-Reset-Funktionalität

### 8. Dokumentation
**Status:** in progress  
**Beschreibung:** Erstellung und Aktualisierung der Dokumentation für das Projekt.  
**Erledigt:**
- Grundlegende Projektdokumentation in README
- Dokumentation zu Faucet, Referral und Token-Reservierung
- API-Endpunkte dokumentiert

**Nächste Schritte:**
- Codekommentare hinzufügen
- Benutzerhandbuch erstellen
- Entwicklerdokumentation vervollständigen

### 9. Tests
**Status:** todo  
**Beschreibung:** Implementierung von Tests für alle Komponenten und Features.  
**Nächste Schritte:**
- Unit-Tests für Komponenten schreiben
- Integration-Tests für Feature-Interaktionen
- End-to-End-Tests für Benutzerflüsse

### 10. Deployment
**Status:** todo  
**Beschreibung:** Konfiguration und Deployment der Anwendung auf Netlify.  
**Nächste Schritte:**
- Netlify-Konfiguration erstellen
- CI/CD-Pipeline einrichten
- Umgebungsvariablen für verschiedene Umgebungen konfigurieren 