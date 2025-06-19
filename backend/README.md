# BSN Django Backend

Ein vollständiges Django-Backend für die BSN (Blockchain Social Network) ICO-Plattform.

## 🚀 Features

### User Management
- **Custom User Model** mit erweiterten Profilfeldern
- **JWT Authentication** für sichere API-Zugriffe
- **Email Verification** für Benutzerregistrierung
- **Password Reset** Funktionalität
- **User Sessions** Tracking
- **Profile Management** mit erweiterten Einstellungen

### ICO & Token Management
- **Token Reservations** für ICO-Teilnahme
- **Multi-Chain Support** (Ethereum, Polygon, BSC, Solana)
- **Payment Status Tracking** (Pending, Processing, Completed, Failed, Cancelled)
- **Transaction Hash** Speicherung
- **Referral System** mit automatischer Kommission-Berechnung

### Faucet System
- **Test Token Requests** für verschiedene Netzwerke
- **Admin Approval** Workflow
- **Request Tracking** mit IP und User Agent
- **Email Notifications** an Admins

### Referral Program
- **Unique Referral Codes** für jeden Benutzer
- **Commission Tracking** (5% Standard)
- **Token Rewards** Berechnung
- **Statistics Dashboard** für Referrer

### Newsletter & Communication
- **Newsletter Subscriptions** mit verschiedenen Kategorien
- **Contact Form** mit Admin-Assignment
- **Email Notifications** für neue Anfragen
- **Unsubscribe** Funktionalität

### Analytics & Statistics
- **ICO Overview** mit Echtzeit-Statistiken
- **Daily Statistics** für die letzten 30 Tage
- **Network Distribution** Analytics
- **User Growth** Tracking
- **Financial Metrics** (USD raised, tokens sold)

## 🛠️ Technologie-Stack

- **Django 5.0.2** - Web Framework
- **Django REST Framework 3.14.0** - API Framework
- **JWT Authentication** - Sichere Token-basierte Authentifizierung
- **SQLite** (Development) / **PostgreSQL** (Production)
- **CORS Support** - Cross-Origin Resource Sharing
- **Swagger/OpenAPI** - API Dokumentation
- **Email Integration** - SMTP für Benachrichtigungen

## 📁 Projektstruktur

```
backend/
├── bsn/                    # Django Projekt-Konfiguration
│   ├── settings.py        # Hauptkonfiguration
│   ├── urls.py           # URL-Routing
│   └── wsgi.py           # WSGI-Konfiguration
├── users/                 # User Management App
│   ├── models.py         # User, UserProfile, Sessions, etc.
│   ├── views.py          # Authentication & Profile Views
│   ├── serializers.py    # API Serializers
│   ├── urls.py           # User API Endpoints
│   └── admin.py          # Admin Interface
├── landing/              # ICO & Landing Page App
│   ├── models.py         # TokenReservation, Faucet, Referrals, etc.
│   ├── views.py          # ICO & Landing Views
│   ├── serializers.py    # API Serializers
│   ├── urls.py           # Landing API Endpoints
│   └── admin.py          # Admin Interface
├── manage.py             # Django Management
├── requirements.txt      # Python Dependencies
├── env.example           # Environment Variables Template
└── db.sqlite3           # SQLite Database (Development)
```

## 🔧 Installation & Setup

### 1. Dependencies installieren
```bash
pip install -r requirements.txt
```

### 2. Environment konfigurieren
```bash
cp env.example .env
# Bearbeite .env mit deinen Einstellungen
```

### 3. Datenbank initialisieren
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Superuser erstellen
```bash
python manage.py createsuperuser
```

### 5. Server starten
```bash
python manage.py runserver
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/users/register/` - Benutzerregistrierung
- `POST /api/v1/users/login/` - Benutzeranmeldung
- `POST /api/v1/users/logout/` - Benutzerabmeldung
- `POST /api/v1/users/email/verify/` - Email-Verifikation
- `POST /api/v1/users/password/reset/` - Passwort-Reset anfordern
- `POST /api/v1/users/password/reset/confirm/` - Passwort-Reset bestätigen

### User Management
- `GET/PUT /api/v1/users/profile/` - Profil anzeigen/bearbeiten
- `GET/PUT /api/v1/users/profile/detail/` - Erweitertes Profil
- `POST /api/v1/users/password/change/` - Passwort ändern
- `GET /api/v1/users/sessions/` - Benutzersessions
- `DELETE /api/v1/users/sessions/<id>/` - Session löschen
- `GET /api/v1/users/stats/` - Benutzerstatistiken

### ICO & Token Management
- `GET/POST /api/v1/landing/reservations/` - Token-Reservierungen
- `GET/PUT /api/v1/landing/reservations/<id>/` - Einzelne Reservierung
- `GET/POST /api/v1/landing/faucet/` - Faucet-Anfragen
- `GET /api/v1/landing/referral/code/` - Referral-Code
- `GET /api/v1/landing/referral/program/` - Referral-Programm

### Newsletter & Contact
- `POST /api/v1/landing/newsletter/subscribe/` - Newsletter abonnieren
- `POST /api/v1/landing/newsletter/unsubscribe/` - Newsletter abbestellen
- `POST /api/v1/landing/contact/` - Kontaktformular

### Analytics
- `GET /api/v1/landing/ico/overview/` - ICO-Übersicht
- `GET /api/v1/landing/ico/stats/` - Detaillierte ICO-Statistiken
- `GET /api/v1/landing/ico/token-info/` - Token-Preis-Informationen

### Admin Interface
- `http://localhost:8000/admin/` - Django Admin Interface
- `http://localhost:8000/api/docs/` - Swagger API Dokumentation
- `http://localhost:8000/api/redoc/` - ReDoc API Dokumentation

## 🔐 Sicherheit

- **JWT Token Authentication** für alle geschützten Endpoints
- **CORS Configuration** für sichere Cross-Origin Requests
- **Password Validation** mit Django-Standards
- **Email Verification** für neue Benutzer
- **Session Management** mit IP-Tracking
- **Admin Interface** für Backend-Management

## 📊 Datenbank-Models

### Users App
- **User** - Erweitertes Benutzermodel mit Wallet-Integration
- **UserProfile** - Zusätzliche Profilinformationen
- **UserSession** - Session-Tracking
- **EmailVerification** - Email-Verifikationstokens
- **PasswordReset** - Passwort-Reset-Tokens

### Landing App
- **TokenReservation** - ICO-Token-Reservierungen
- **FaucetRequest** - Test-Token-Anfragen
- **ReferralProgram** - Referral-Tracking
- **ReferralCode** - Benutzer-Referral-Codes
- **NewsletterSubscription** - Newsletter-Abonnements
- **ContactForm** - Kontaktformular-Einreichungen
- **ICOStats** - ICO-Statistiken und Analytics

## 🚀 Deployment

### Production Setup
1. **PostgreSQL** Datenbank konfigurieren
2. **Environment Variables** für Production setzen
3. **Static Files** sammeln: `python manage.py collectstatic`
4. **Gunicorn** für WSGI-Server verwenden
5. **Redis** für Celery (optional)
6. **SSL/HTTPS** konfigurieren

### Environment Variables
```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# ICO Settings
TOKEN_PRICE_USD=0.10
MIN_PURCHASE_USD=10
MAX_PURCHASE_USD=10000

# Frontend
FRONTEND_URL=https://your-frontend-domain.com
```

## 📈 Monitoring & Analytics

- **Django Admin** für Backend-Management
- **ICO Statistics** Dashboard
- **User Analytics** Tracking
- **Payment Analytics** mit Network-Distribution
- **Referral Performance** Monitoring

## 🔄 Nächste Schritte

1. **Smart Contract Integration** für automatische Token-Verteilung
2. **Payment Gateway Integration** für Krypto-Zahlungen
3. **Real-time Notifications** mit WebSockets
4. **Advanced Analytics** Dashboard
5. **Multi-language Support** für internationale Nutzer
6. **Mobile API** Optimierungen
7. **Rate Limiting** für API-Endpoints
8. **Automated Testing** Suite

## 📞 Support

Bei Fragen oder Problemen:
- **API Documentation**: `http://localhost:8000/api/docs/`
- **Admin Interface**: `http://localhost:8000/admin/`
- **GitHub Issues**: Für Bug-Reports und Feature-Requests
