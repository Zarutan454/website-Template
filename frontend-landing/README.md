# BSN Frontend Landing

Dieses React/Vite-Frontend dient als Landing-Plattform für das BSN (Blockchain Social Network) Projekt.

## Projektstruktur

```
frontend-landing/
├── public/                # Statische Assets
│   ├── assets/            # Bilder, Fonts, etc.
│   │   ├── images/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/               # API-Integration
│   │   │   ├── axiosInstance.ts
│   │   │   ├── auth.ts
│   │   │   ├── faucet.ts
│   │   │   ├── referral.ts
│   │   │   └── tokenReserve.ts
│   │   ├── assets/            # Assets für den Build-Prozess
│   │   │   └── styles/
│   │   ├── components/        # Wiederverwendbare Komponenten
│   │   │   ├── atoms/         # Atom-Komponenten (Atomic Design)
│   │   │   ├── molecules/     # Molekül-Komponenten
│   │   │   ├── organisms/     # Organismus-Komponenten
│   │   │   ├── templates/     # Template-Komponenten
│   │   │   └── ui/            # UI-Komponenten
│   │   ├── hooks/             # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useFaucet.ts
│   │   │   ├── useReferral.ts
│   │   │   └── useTokenReserve.ts
│   │   ├── pages/             # Seitenkomponenten
│   │   │   ├── Home.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Faucet.tsx
│   │   │   ├── Referral.tsx
│   │   │   ├── TokenPreSale.tsx
│   │   │   ├── MiningInfo.tsx
│   │   │   ├── TokenCreationInfo.tsx
│   │   │   ├── NFTInfo.tsx
│   │   │   ├── Roadmap.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Privacy.tsx
│   │   │   ├── Newsletter.tsx
│   │   │   └── Community.tsx
│   │   ├── utils/             # Hilfsfunktionen
│   │   │   ├── animations.ts
│   │   │   ├── validation.ts
│   │   │   └── web3.ts
│   │   ├── context/           # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   └── Web3Context.tsx
│   │   ├── App.tsx            # Hauptkomponente
│   │   ├── main.tsx           # Einstiegspunkt
│   │   └── vite-env.d.ts      # TypeScript-Deklarationen
│   ├── .env.example           # Beispiel für Umgebungsvariablen
│   ├── index.html             # HTML-Template
│   ├── package.json           # Projektabhängigkeiten
│   └── tsconfig.json          # TypeScript-Konfiguration
├── vite.config.ts         # Vite-Konfiguration
└── tailwind.config.js     # TailwindCSS-Konfiguration
```

## Einrichtung

1. Node.js-Abhängigkeiten installieren:
   ```bash
   npm install
   ```

2. Umgebungsvariablen konfigurieren:
   ```bash
   cp .env.example .env
   # Bearbeite die .env-Datei mit deinen Einstellungen
   ```

3. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

4. Build für Produktion erstellen:
   ```bash
   npm run build
   ```

## Features

- **Mehrseitige Anwendung**: Routing mit React Router
- **Authentifizierung**: E-Mail/Passwort + Social-Login + Web3-Vorbereitung
- **Faucet-System**: Regelmäßige Token-Claims
- **Referral-System**: Einladungen und Belohnungen
- **Token-Reservierung**: Pre-Sale mit MetaMask-Integration
- **Informationsseiten**: Mining, Token-Erstellung, NFT, etc.
- **Roadmap & Vision**: Timeline der Meilensteine
- **FAQ & Rechtliches**: Häufig gestellte Fragen und rechtliche Informationen
- **Community-Bindung**: Newsletter, Social-Links, Sharing

## Komponenten

### Atoms
- Button
- Input
- Typography
- Icon
- Badge
- Spinner

### Molecules
- Card
- FormField
- Alert
- Modal
- Dropdown

### Organisms
- Form
- Navbar
- Footer
- FaucetWidget
- ReferralWidget
- TokenReservationWidget
- NewsletterForm

### Templates
- PageTemplate
- DashboardTemplate

## Hooks

- **useAuth**: Authentifizierung und Benutzerkontext
- **useFaucet**: Faucet-Status und Claims
- **useReferral**: Referral-Code und Statistiken
- **useTokenReserve**: Token-Reservierungsfunktionen
- **useWeb3**: Web3-Verbindung und Interaktionen

## API-Integration

Die Frontend-Anwendung kommuniziert mit dem Django-Backend über eine REST-API. Die API-Endpunkte sind in der `api`-Verzeichnisstruktur organisiert.

## Styling

Die Anwendung verwendet TailwindCSS für das Styling mit einem Dark-Theme und Crypto-Akzenten.

## Tests

```bash
npm run test
```

## Linting

```bash
npm run lint
```
