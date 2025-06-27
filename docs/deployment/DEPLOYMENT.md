# BSN Deployment Guide

## Überblick

Diese Anleitung beschreibt die verschiedenen Deployment-Optionen für das BSN (Blockchain Social Network) Projekt. Das Projekt besteht aus einem React-Frontend und einem Django-Backend.

## Voraussetzungen

### System-Anforderungen
- Node.js 18+ 
- Python 3.11+
- PostgreSQL 13+ (für Produktion)
- Redis (für Caching und Celery)
- Git

### Umgebungsvariablen
Kopieren Sie die `.env.example` Dateien und passen Sie sie an:

```bash
# Frontend
cp env.example .env

# Backend
cp backend/env.example backend/.env
```

## Lokale Entwicklung

### 1. Repository klonen
```bash
git clone https://github.com/your-username/website-Template.git
cd website-Template
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Im Hauptverzeichnis
npm install
npm run dev
```

## Docker Deployment

### 1. Docker Compose verwenden
```bash
# Alle Services starten
docker-compose up --build

# Im Hintergrund
docker-compose up -d --build

# Services stoppen
docker-compose down
```

### 2. Einzelne Container
```bash
# Backend
docker build -t bsn-backend ./backend
docker run -p 8000:8000 bsn-backend

# Frontend
docker build -t bsn-frontend .
docker run -p 3000:3000 bsn-frontend
```

## Produktions-Deployment

### 1. Server-Vorbereitung

#### Ubuntu/Debian Server
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Abhängigkeiten installieren
sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib redis-server

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-install -y nodejs
```

### 2. PostgreSQL Setup
```bash
sudo -u postgres psql
CREATE DATABASE bsn_database;
CREATE USER bsn_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bsn_database TO bsn_user;
ALTER USER bsn_user CREATEDB;
\q
```

### 3. Backend Deployment
```bash
# Projekt klonen
cd /var/www
sudo git clone https://github.com/your-username/website-Template.git bsn
sudo chown -R $USER:$USER /var/www/bsn

# Virtual Environment
cd /var/www/bsn/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Umgebungsvariablen setzen
sudo nano .env
# Fügen Sie alle erforderlichen Variablen hinzu

# Django Setup
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 4. Gunicorn Setup
```bash
# Gunicorn installieren
pip install gunicorn

# Gunicorn Service erstellen
sudo nano /etc/systemd/system/bsn-backend.service
```

Inhalt der Service-Datei:
```ini
[Unit]
Description=BSN Django Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/bsn/backend
Environment="PATH=/var/www/bsn/backend/venv/bin"
ExecStart=/var/www/bsn/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/bsn/backend/bsn.sock bsn.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl start bsn-backend
sudo systemctl enable bsn-backend
```

### 5. Frontend Build
```bash
cd /var/www/bsn
npm install
npm run build
```

### 6. Nginx Konfiguration
```bash
sudo nano /etc/nginx/sites-available/bsn
```

Nginx-Konfiguration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/bsn/dist;
        try_files $uri $uri/ /index.html;
        
        # Caching für statische Assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/bsn/backend/bsn.sock;
    }

    # Django Admin
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/bsn/backend/bsn.sock;
    }

    # Django Static Files
    location /static/ {
        alias /var/www/bsn/backend/staticfiles/;
    }

    # Django Media Files
    location /media/ {
        alias /var/www/bsn/backend/media/;
    }
}
```

```bash
# Site aktivieren
sudo ln -s /etc/nginx/sites-available/bsn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL mit Let's Encrypt
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

### 8. Celery für Background Tasks
```bash
# Celery Worker Service
sudo nano /etc/systemd/system/bsn-celery.service
```

```ini
[Unit]
Description=BSN Celery Worker
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/bsn/backend
Environment="PATH=/var/www/bsn/backend/venv/bin"
ExecStart=/var/www/bsn/backend/venv/bin/celery multi start worker1 -A bsn --pidfile=/var/run/celery/%n.pid --logfile=/var/log/celery/%n%I.log --loglevel=INFO
ExecStop=/var/www/bsn/backend/venv/bin/celery multi stopwait worker1 --pidfile=/var/run/celery/%n.pid
ExecReload=/var/www/bsn/backend/venv/bin/celery multi restart worker1 -A bsn --pidfile=/var/run/celery/%n.pid --logfile=/var/log/celery/%n%I.log --loglevel=INFO

[Install]
WantedBy=multi-user.target
```

```bash
# Celery Directories
sudo mkdir -p /var/run/celery /var/log/celery
sudo chown www-data:www-data /var/run/celery /var/log/celery

# Service starten
sudo systemctl daemon-reload
sudo systemctl start bsn-celery
sudo systemctl enable bsn-celery
```

## Cloud Deployment

### AWS Deployment
1. **EC2 Instance** für Backend
2. **S3 Bucket** für statische Dateien
3. **RDS PostgreSQL** für Datenbank
4. **ElastiCache Redis** für Caching
5. **CloudFront** für CDN

### Vercel Deployment (Frontend)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel --prod
```

### Heroku Deployment
```bash
# Heroku CLI installieren und einloggen
heroku login

# App erstellen
heroku create bsn-app

# Addons hinzufügen
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Umgebungsvariablen setzen
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False

# Deployment
git push heroku main
heroku run python manage.py migrate
```

## Monitoring und Wartung

### 1. Logs überwachen
```bash
# Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Django Logs
sudo tail -f /var/www/bsn/backend/logs/django.log

# Systemd Services
sudo journalctl -u bsn-backend -f
sudo journalctl -u bsn-celery -f
```

### 2. Backup-Strategie
```bash
# Datenbank Backup
pg_dump -h localhost -U bsn_user bsn_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Media Files Backup
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/bsn/backend/media/
```

### 3. Updates deployen
```bash
# Code aktualisieren
cd /var/www/bsn
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart bsn-backend

# Frontend
cd ..
npm install
npm run build
sudo systemctl reload nginx
```

## Sicherheit

### 1. Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 2. Fail2Ban
```bash
sudo apt install fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates
```bash
# Automatische Updates aktivieren
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Häufige Probleme

1. **500 Server Error**
   - Logs prüfen: `sudo journalctl -u bsn-backend -f`
   - Permissions prüfen: `sudo chown -R www-data:www-data /var/www/bsn`

2. **Static Files nicht gefunden**
   - `python manage.py collectstatic --noinput`
   - Nginx-Konfiguration prüfen

3. **Database Connection Error**
   - PostgreSQL Service: `sudo systemctl status postgresql`
   - Credentials in .env prüfen

4. **Redis Connection Error**
   - Redis Service: `sudo systemctl status redis-server`
   - Redis URL in .env prüfen

### Performance Optimierung

1. **Nginx Caching**
2. **Database Indexing**
3. **CDN für statische Dateien**
4. **Redis für Session Storage**
5. **Gunicorn Worker Tuning**

## Support

Für weitere Unterstützung:
- GitHub Issues: [Repository Issues](https://github.com/your-username/website-Template/issues)
- Dokumentation: [Projekt Wiki](https://github.com/your-username/website-Template/wiki)
- E-Mail: support@bsn.network 