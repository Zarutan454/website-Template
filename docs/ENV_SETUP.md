# Environment Variables Setup

## Neue .env-Datei erstellen

Da die `.env`-Datei durch globalIgnore blockiert ist, erstellen Sie diese manuell:

### 1. .env-Datei erstellen

Erstellen Sie eine neue Datei namens `.env` im Hauptverzeichnis des Projekts und fügen Sie folgenden Inhalt ein:

```env
# ========================================
# BSN Social Network - Environment Variables
# ========================================

# ========================================
# API Keys
# ========================================

# Etherscan API Key für zuverlässigere Blockchain-Operationen
VITE_ETHERSCAN_API_KEY=EV9V3ZB72G6Z3RPAFDGRKIPFCY53IHNCS8

# Infura API Key (Optional - für RPC-Verbindungen)
# VITE_INFURA_API_KEY=your_infura_api_key_here

# Alchemy API Key (Optional - Alternative zu Infura)
# VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here

# ========================================
# Backend Configuration
# ========================================

# Django Backend URL
VITE_API_BASE_URL=http://localhost:8000/api

# Django Backend URL für Auth
VITE_AUTH_API_URL=http://localhost:8000/api/auth

# ========================================
# Frontend Configuration
# ========================================

# Frontend URL
VITE_FRONTEND_URL=http://localhost:8080

# App Name
VITE_APP_NAME=BSN Social Network

# App Version
VITE_APP_VERSION=1.0.0

# ========================================
# Blockchain Configuration
# ========================================

# Default Network (mainnet, sepolia, localhost)
VITE_DEFAULT_NETWORK=sepolia

# Ethereum RPC URL (Fallback)
VITE_ETHEREUM_RPC_URL=https://eth.llamarpc.com

# Sepolia RPC URL (Fallback)
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org

# ========================================
# Feature Flags
# ========================================

# Enable Mining System
VITE_ENABLE_MINING=true

# Enable NFT Features
VITE_ENABLE_NFT=true

# Enable Token Creation
VITE_ENABLE_TOKEN_CREATION=true

# Enable DAO Features
VITE_ENABLE_DAO=true

# Enable Alpha Features
VITE_ENABLE_ALPHA_FEATURES=true

# ========================================
# Development Configuration
# ========================================

# Development Mode
NODE_ENV=development

# Enable Debug Logging
VITE_DEBUG=true

# Enable Hot Reload
VITE_HOT_RELOAD=true

# ========================================
# Security Configuration
# ========================================

# JWT Secret (für Backend)
JWT_SECRET=your_jwt_secret_here_change_in_production

# Django Secret Key (für Backend)
DJANGO_SECRET_KEY=your_django_secret_key_here_change_in_production

# ========================================
# Database Configuration (für Backend)
# ========================================

# Database URL
DATABASE_URL=sqlite:///db.sqlite3

# ========================================
# Email Configuration (Optional)
# ========================================

# Email Backend (für Backend)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# SMTP Configuration (für Production)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your_email@gmail.com
# EMAIL_HOST_PASSWORD=your_app_password

# ========================================
# File Upload Configuration
# ========================================

# Max File Size (in bytes)
VITE_MAX_FILE_SIZE=5242880

# Allowed File Types
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/webm

# ========================================
# Analytics Configuration (Optional)
# ========================================

# Google Analytics ID
# VITE_GA_ID=your_google_analytics_id

# ========================================
# Social Media Configuration (Optional)
# ========================================

# Twitter API Key
# VITE_TWITTER_API_KEY=your_twitter_api_key

# Discord Webhook URL
# VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url

# ========================================
# Production Configuration
# ========================================

# Production URL (für Deployment)
# VITE_PRODUCTION_URL=https://your-domain.com

# CDN URL (für Production)
# VITE_CDN_URL=https://cdn.your-domain.com
```

### 2. PowerShell-Befehl (Alternative)

Falls Sie PowerShell verwenden, können Sie auch diesen Befehl ausführen:

```powershell
New-Item -Path ".env" -ItemType File -Force
```

Dann fügen Sie den obigen Inhalt in die Datei ein.

### 3. Wichtige Konfigurationen

#### Etherscan API Key
```env
VITE_ETHERSCAN_API_KEY=EV9V3ZB72G6Z3RPAFDGRKIPFCY53IHNCS8
```
**Dies ist bereits konfiguriert und sollte die RPC-Fehler beheben!**

#### Backend URLs
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_API_URL=http://localhost:8000/api/auth
```

#### Feature Flags
```env
VITE_ENABLE_MINING=true
VITE_ENABLE_NFT=true
VITE_ENABLE_TOKEN_CREATION=true
VITE_ENABLE_DAO=true
VITE_ENABLE_ALPHA_FEATURES=true
```

### 4. Nach der Erstellung

1. **Development-Server neu starten**:
   ```bash
   npm run dev
   ```

2. **Backend-Server neu starten**:
   ```bash
   cd backend
   python manage.py runserver
   ```

3. **Testen**:
   - Wallet-Funktionen sollten ohne RPC-Fehler funktionieren
   - Etherscan API wird automatisch verwendet
   - Fallback-Mechanismus greift bei Problemen

### 5. Troubleshooting

#### "Environment variables not loaded"
- Prüfen Sie, ob die `.env`-Datei im Hauptverzeichnis liegt
- Starten Sie den Development-Server neu

#### "Etherscan API key not configured"
- Der API-Key ist bereits in der Konfiguration
- Falls Sie Ihren eigenen Key verwenden möchten, ersetzen Sie `EV9V3ZB72G6Z3RPAFDGRKIPFCY53IHNCS8`

#### "Backend connection failed"
- Stellen Sie sicher, dass der Django-Server läuft
- Prüfen Sie die URLs in der `.env`-Datei

## Ergebnis

Nach der Erstellung der `.env`-Datei sollten alle Funktionen stabil arbeiten:

✅ **Keine RPC-Fehler mehr** - Etherscan API ist konfiguriert  
✅ **Wallet-Funktionen** - Stabil und zuverlässig  
✅ **Backend-Verbindung** - Django API ist konfiguriert  
✅ **Feature Flags** - Alle Features sind aktiviert  
✅ **Development-Modus** - Optimiert für Entwicklung 