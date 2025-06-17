# Neues Frontend – Zieldefinition & Architektur

## Zielsetzung
- Modernes, performantes und skalierbares Frontend für das BSN-Projekt
- Optimale User Experience, konsistentes Design, hohe Wartbarkeit
- Vollständige Integration mit neuem Django-Backend (REST API)
- Zukunftssichere Authentifizierung, Security und State-Management

## Akzeptanzkriterien
- Alle Kernfeatures aus dem Alt-Frontend sind abgedeckt (Wallet, Social, Mining, NFT, DAO, Notifications, etc.)
- Konsistente UI/UX nach Design-System (Atomic Design, Storybook, Tailwind, shadcn-ui)
- State-Management klar strukturiert (Zustand, Redux Toolkit, React Query)
- API-Integration über REST/OpenAPI, keine direkten DB-Bindings
- Vollständige Testabdeckung (Unit, Integration, E2E)
- CI/CD, Linting, Prettier, automatisierte Deployments
- Gute Dokumentation und Onboarding für Entwickler

## Architektur-Entscheidungen
- **Framework:** Next.js (React, SSR/SSG, Routing, API-Routes)
- **State-Management:** Zustand, Redux Toolkit, React Query
- **Styling:** Tailwind CSS, shadcn-ui, Design-System, Storybook
- **API:** REST (OpenAPI), ggf. Websockets für Realtime
- **Auth:** JWT/OAuth, Integration mit Django-Backend
- **Testing:** Jest, React Testing Library, Cypress
- **Tooling:** ESLint, Prettier, Husky, Commitlint, CI/CD (GitHub Actions)

## Nächste Schritte
1. Projektstruktur und Scaffolding für neues Frontend anlegen
2. Design-System und Storybook initialisieren
3. API-Client und Auth-Flow aufsetzen
4. Task-Board mit User Stories und Epics befüllen
5. Onboarding-Doku und Readme ergänzen

---

**Diese Vorlage wird im Projektverlauf weiter ausgearbeitet und von allen Agenten gepflegt.**

# BSN Datenbank

BSN Datenbank ist ein Social-Network-Projekt mit Django-Backend und Next.js-Frontend. 

## Features

- Benutzerkonten und -profile
- Posts und Kommentare
- Likes und Shares
- Freundschaftssystem
- Gruppen
- Direktnachrichten und Gruppenchats mit Echtzeit-Kommunikation
- Token-System mit Mining und Wallet
- NFT-Marktplatz
- DAO-Governance

## Technologien

### Backend
- Django 4.2+
- Django REST Framework
- Django Channels (für WebSocket/Echtzeit-Kommunikation)
- PostgreSQL
- Redis (für Caching und Pub/Sub)
- Celery (für asynchrone Tasks)

### Frontend
- Next.js 13+
- React
- TypeScript
- TailwindCSS
- Zustand (für State Management)
- Axios (für API-Kommunikation)

## API-Endpunkte

### Authentifizierung
- `POST /api/v1/auth/register/`: Neuen Benutzer registrieren
- `POST /api/v1/auth/login/`: Benutzer anmelden
- `POST /api/v1/auth/logout/`: Benutzer abmelden
- `GET /api/v1/auth/me/`: Aktuelle Benutzerinformationen abrufen

### Benutzer
- `GET /api/v1/users/`: Benutzerliste abrufen
- `GET /api/v1/users/{id}/`: Benutzerdetails abrufen
- `PUT /api/v1/users/{id}/`: Benutzerprofil aktualisieren
- `GET /api/v1/users/{id}/friends/`: Freunde eines Benutzers abrufen
- `POST /api/v1/users/{id}/friends/`: Freundschaftsanfrage senden

### Posts
- `GET /api/v1/posts/`: Posts abrufen
- `POST /api/v1/posts/`: Neuen Post erstellen
- `GET /api/v1/posts/{id}/`: Post-Details abrufen
- `PUT /api/v1/posts/{id}/`: Post aktualisieren
- `DELETE /api/v1/posts/{id}/`: Post löschen
- `POST /api/v1/posts/{id}/like/`: Post liken
- `POST /api/v1/posts/{id}/comment/`: Kommentar zu Post hinzufügen

### Gruppen
- `GET /api/v1/groups/`: Gruppen abrufen
- `POST /api/v1/groups/`: Neue Gruppe erstellen
- `GET /api/v1/groups/{id}/`: Gruppendetails abrufen
- `PUT /api/v1/groups/{id}/`: Gruppe aktualisieren
- `DELETE /api/v1/groups/{id}/`: Gruppe löschen
- `GET /api/v1/groups/{id}/members/`: Gruppenmitglieder abrufen
- `POST /api/v1/groups/{id}/members/`: Mitglied zu Gruppe hinzufügen

### Chat
- `GET /api/v1/chats/`: Chat-Liste abrufen
- `POST /api/v1/chats/`: Neuen Chat erstellen
- `GET /api/v1/chats/{id}/`: Chat-Details abrufen
- `PUT /api/v1/chats/{id}/`: Chat aktualisieren
- `DELETE /api/v1/chats/{id}/`: Chat löschen
- `POST /api/v1/chats/{id}/read/`: Alle Nachrichten als gelesen markieren
- `GET /api/v1/chats/{id}/messages/`: Nachrichten eines Chats abrufen
- `POST /api/v1/chats/{id}/messages/`: Neue Nachricht senden
- `GET /api/v1/chats/{id}/websocket_url/`: WebSocket-URL für Echtzeit-Chat abrufen

### WebSockets
- `ws://domain/ws/chat/{id}/?token={jwt}`: WebSocket für Echtzeit-Chat

### Wallet
- `GET /api/v1/wallet/`: Wallet-Informationen abrufen
- `POST /api/v1/wallet/transfer/`: Token an andere Benutzer senden
- `GET /api/v1/wallet/transactions/`: Transaktionshistorie abrufen

### Mining
- `GET /api/v1/mining/stats/`: Mining-Statistiken abrufen
- `POST /api/v1/mining/claim/`: Mining-Belohnungen einfordern

### NFTs
- `GET /api/v1/nft/`: NFTs abrufen
- `POST /api/v1/nft/`: Neues NFT erstellen
- `GET /api/v1/nft/{id}/`: NFT-Details abrufen
- `POST /api/v1/nft/{id}/transfer/`: NFT übertragen

### DAOs
- `GET /api/v1/dao/`: DAOs abrufen
- `POST /api/v1/dao/`: Neue DAO erstellen
- `GET /api/v1/dao/{id}/`: DAO-Details abrufen
- `GET /api/v1/dao/{id}/proposals/`: Vorschläge einer DAO abrufen
- `POST /api/v1/dao/{id}/proposals/`: Neuen Vorschlag erstellen
- `POST /api/v1/dao/{id}/proposals/{proposal_id}/vote/`: Für Vorschlag abstimmen

## Installation

### Voraussetzungen
- Python 3.9+
- Node.js 16+
- npm oder yarn
- PostgreSQL
- Redis

### Backend
1. Repository klonen
2. Virtuelle Umgebung erstellen und aktivieren
3. Abhängigkeiten installieren: `pip install -r requirements.txt`
4. Datenbank-Migrationen anwenden: `python manage.py migrate`
5. Server starten: `python manage.py runserver`

### Frontend
1. In das Frontend-Verzeichnis wechseln: `cd frontend`
2. Abhängigkeiten installieren: `npm install` oder `yarn`
3. Entwicklungsserver starten: `npm run dev` oder `yarn dev`

## Lizenz

MIT 