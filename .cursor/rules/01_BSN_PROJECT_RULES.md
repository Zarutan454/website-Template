# BSN Projekt-Entwicklungsregeln für Cursor

## 🎯 Projekt-Übersicht
**BSN (Blockchain Social Network)** ist eine dezentralisierte Social-Media-Plattform die Web2-Komfort mit Web3-Infrastruktur verbindet.

## 📊 Entwicklungsphasen-Logik

### Phase 1: Alpha (0-10.000 Nutzer)
- **Token-Status**: Simulation/Faucet (interne Datenbank)
- **Blockchain**: Intern (keine echten Blockchain-Transaktionen)
- **Fokus**: Grundfunktionen, ICO-System, Landing Page
- **Mining**: DEAKTIVIERT (nur Simulation für Testing)

### Phase 2: Beta (10.000-100.000 Nutzer)  
- **Token-Status**: Simulation/Faucet (weiterhin intern)
- **Blockchain**: Intern (Vorbereitung Multi-Chain)
- **Fokus**: Community-Aufbau, Features, Social Feed
- **Mining**: DEAKTIVIERT (nur Simulation)

### Phase 3: Launch (100.000-5M Nutzer)
- **Token-Status**: Echter BSN Token Launch
- **Blockchain**: Multi-Chain (Ethereum, BNB, Polygon via LayerZero)
- **Fokus**: Token-Launch, Skalierung, Mining-Aktivierung
- **Mining**: AKTIVIERT (echte BSN-Token-Belohnungen)

### Phase 4: Enterprise (5M+ Nutzer)
- **Token-Status**: BSN + Eigene Blockchain
- **Blockchain**: Multi-Chain + Eigene BSN-Chain
- **Fokus**: Eigene Blockchain, Enterprise-Features

## 🔧 Tech-Stack Regeln

### Backend (Django)
```python
TECH_STACK = {
    "framework": "Django (Python)",
    "api": "Django REST Framework",
    "auth": ["Email/Passwort", "OAuth", "Web3 Login"],
    "database": {
        "development": "SQLite",
        "production": "PostgreSQL"
    },
    "tasks": "Celery/Redis",
    "ci_cd": "GitHub Actions"
}
```

### Frontend (React)
```javascript
TECH_STACK = {
    "framework": "React mit Vite",
    "language": "TypeScript",
    "styling": "Tailwind CSS + ShadCN/UI",
    "animation": "Framer Motion",
    "state": "Zustand",
    "i18n": "react-i18next",
    "pwa": "Service Worker"
}
```

### Web3 & Blockchain
```javascript
WEB3_STACK = {
    "web3_libs": "Wagmi/Viem für EVM",
    "multi_chain": "LayerZero OFT",
    "ipfs": "Pinata/IPFS-Cluster",
    "contracts": "OpenZeppelin ERC-20/721/1155",
    "wallets": ["MetaMask", "WalletConnect"]
}
```

## 🏗️ Architektur-Regeln

### Ordnerstruktur (Verpflichtend)
```
/backend/          # Django Backend
├── bsn/          # Main Django App
├── users/        # User Management
├── landing/      # Landing Page Logic
├── mining/       # Mining System (später)
├── tokens/       # Token Management (später)
└── manage.py

/src/             # React Frontend
├── components/   # React Components
├── pages/        # Page Components
├── hooks/        # Custom Hooks
├── context/      # Context Providers
├── utils/        # Utility Functions
└── translations/ # i18n Files

/docs/            # Dokumentation
├── project/      # Projektplanung
├── logic/        # Entwicklungslogik
├── architecture/ # Architektur-Docs
└── setup/        # Setup-Anleitungen
```

### API-Design Regeln
- **REST-Konventionen**: GET, POST, PUT, DELETE
- **Versionierung**: `/api/v1/`
- **Authentifizierung**: JWT + Session-basiert
- **Response-Format**: JSON mit standardisierten Fehlercodes
- **Rate-Limiting**: Implementiert für alle Endpoints

## ⛏️ Mining-System Regeln

### Mining-Phasen-Logik
```python
MINING_PHASES = {
    "alpha": {
        "users": "0-10k",
        "mining_active": False,
        "simulation_only": True,
        "purpose": "System Testing"
    },
    "beta": {
        "users": "10k-100k", 
        "mining_active": False,
        "simulation_only": True,
        "purpose": "Community Building"
    },
    "launch": {
        "users": "100k-5M",
        "mining_active": True,
        "real_tokens": True,
        "purpose": "Token Economy Launch"
    }
}
```

### Mining-Mechanik (für später)
- **Passive Mining**: Basis-Rate während Aktivität
- **Boosts**: Post (+50%), Kommentar (+20%), Gruppenbeitritt (+100%)
- **Limits**: Max. 10 BSN/Tag (konfigurierbar)
- **Anti-Fraud**: Heartbeat-System, IP-Checks, Device-Erkennung

## 🪙 Token-Regeln

### Tokenomics
```javascript
TOKENOMICS = {
    "total_supply": "10_000_000_000 BSN",
    "distribution": {
        "mining": "40%",
        "community_rewards": "10%", 
        "team": "15% (vested)",
        "advisors": "5%",
        "liquidity": "10%",
        "staking_dao": "10%",
        "reserve": "10%"
    }
}
```

### ICO-System (Aktiv von Phase 1)
- **Presale**: Läuft ab Alpha-Phase
- **Preisstufen**: $0.10 - $0.50 USD
- **Payment**: Fiat und Krypto
- **Vesting**: Team/Advisor-Token sind 2 Jahre gesperrt

## 🎨 Design-System Regeln

### Farb-Schema
```css
:root {
    --primary: #3B82F6;        /* Crypto Blue */
    --secondary: #8B5CF6;      /* Purple */
    --accent: #10B981;         /* Green */
    --dark: #0F172A;           /* Dark Background */
    --gray: #1E293B;           /* Card Background */
    --text: #F8FAFC;           /* Light Text */
}
```

### Design-Prinzipien
- **Dark Mode First**: Standard ist dunkles Theme
- **Mobile First**: Responsive Design
- **Web3 Aesthetik**: Crypto-inspiriertes Design
- **Gaming Elements**: Gamification-Features
- **Accessibility**: WCAG 2.1 AA konform

## 🔒 Sicherheits-Regeln

### Authentifizierung
- **Passwort**: Min. 8 Zeichen, Sonderzeichen erforderlich
- **2FA**: Optional, später verpflichtend für Premium
- **Session**: 24h Gültigkeit, Auto-Logout
- **Web3**: Wallet-Signatur für Web3-Features

### API-Sicherheit  
- **Rate Limiting**: 100 Requests/Minute pro IP
- **CORS**: Nur erlaubte Domains
- **Input Validation**: Alle Inputs validiert und sanitized
- **SQL Injection**: Django ORM schützt automatisch

## 📱 Mobile & PWA Regeln

### PWA-Features (Verpflichtend)
- **Service Worker**: Offline-Funktionalität
- **App Manifest**: Installierbar als App
- **Push Notifications**: Browser-Benachrichtigungen
- **Responsive Design**: Mobile-optimiert

### React Native (später)
- **Shared Components**: Maximale Wiederverwendung mit Web
- **Navigation**: React Navigation
- **State**: Shared Zustand mit Web
- **Push**: Firebase Cloud Messaging

## ⚡ Performance-Regeln

### Frontend-Performance
- **Bundle Size**: Max. 500KB initial load
- **Code Splitting**: Route-basiertes Splitting
- **Lazy Loading**: Bilder und Komponenten
- **Caching**: Service Worker für statische Assets

### Backend-Performance
- **Database**: Optimierte Queries, Indexing
- **Caching**: Redis für häufige Abfragen
- **API**: Pagination für große Datensätze
- **CDN**: Statische Assets über CDN

## 🧪 Testing-Regeln

### Test-Coverage (Minimum)
- **Unit Tests**: 80% Coverage
- **Integration Tests**: Alle API Endpoints
- **E2E Tests**: Kritische User Flows
- **Security Tests**: Penetration Testing

### Test-Tools
- **Frontend**: Jest, React Testing Library, Cypress
- **Backend**: Django Test Suite, pytest
- **API**: Postman/Newman für API-Tests

## 📈 Monitoring & Analytics

### Metriken (Verpflichtend)
- **Performance**: Page Load Times, API Response Times
- **Business**: User Registrations, Active Users, Mining Activity
- **Errors**: Error Rates, Crash Reports
- **Security**: Failed Login Attempts, Suspicious Activities

### Tools
- **Analytics**: Custom Analytics System
- **Monitoring**: Prometheus/Grafana
- **Logs**: Strukturierte Logs mit ELK Stack
- **Alerts**: Automatische Benachrichtigungen bei kritischen Events

## 🚀 Deployment-Regeln

### CI/CD Pipeline
```yaml
DEPLOYMENT_STAGES:
  - development: "Auto-Deploy bei Push zu dev"
  - staging: "Auto-Deploy bei PR zu main" 
  - production: "Manueller Deploy nach Review"
```

### Infrastructure
- **Containerization**: Docker Compose für alle Services
- **Reverse Proxy**: NGINX mit SSL/TLS
- **Database**: PostgreSQL mit Backups
- **Monitoring**: Health Checks für alle Services

## ⚠️ Kritische Regeln

### Mining-System (WICHTIG)
1. **NIEMALS** echte Token vor 100k Nutzern ausgeben
2. **IMMER** Mining-Status in DB tracked halten
3. **NIEMALS** Mining ohne Anti-Fraud-Checks aktivieren
4. **IMMER** Mining-Limits einhalten (10 BSN/Tag max)

### Token-Economy (KRITISCH)
1. **NIEMALS** Token Supply ohne Governance ändern
2. **IMMER** Vesting-Regeln für Team/Advisor einhalten  
3. **NIEMALS** unbegrenzte Token-Mint-Funktionen
4. **IMMER** Smart Contract Audits vor Mainnet-Deploy

### Security (MANDATORY)
1. **NIEMALS** Private Keys im Code speichern
2. **IMMER** Input Validation und Sanitization
3. **NIEMALS** Admin-Funktionen ohne Multi-Sig
4. **IMMER** Security Headers für alle Responses

**Diese Regeln sind bindend und müssen bei jeder Entwicklung befolgt werden!** 