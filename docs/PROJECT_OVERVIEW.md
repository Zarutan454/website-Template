# BSN (Blockchain Social Network) - Projektübersicht

## Vision

BSN ist ein dezentrales, tokenisiertes Social Network, das Web2-Komfort mit Web3-Funktionalität verbindet:
- Mining-basierte Belohnungen
- Integriertes Wallet
- Token- und NFT-Erstellung
- DAO-Governance
- Langfristig eigene Blockchain

## Aktuelle Phase: Landing-Plattform & Pre-Sale

In der aktuellen Phase konzentrieren wir uns auf:
1. Mehrseitige Landing-Plattform
2. Registrierung/Login (E-Mail/Passwort + Social-Optionen + Web3-Vorbereitung)
3. Pre-Sale/Token-Reservierung
4. Faucet-System für Pre-Token-Claims
5. Referral-System mit Anti-Fraud-Mechanismen
6. Informationsseiten zu Kernfunktionen

## Technologie-Stack

### Backend
- Django REST Framework (Python)
- PostgreSQL (Produktion) / SQLite (Entwicklung)
- Celery + Redis für Background-Jobs
- E-Mail-Service (SendGrid/Mailgun)

### Frontend Web
- React mit Vite (TypeScript)
- Zustand für State-Management
- TailwindCSS für Styling
- shadcn/ui für Komponenten
- lucide-react für Icons
- React Router für Seiten

### Web3 Integration
- Ethers.js/Viem/Wagmi für MetaMask, WalletConnect
- Smart Contracts Deployment-Skripte (Hardhat/Truffle)

### CI/CD
- GitHub Actions für Lint, Tests, Builds, Deployment

### Hosting
- Web: Vercel/Netlify oder eigener Server/CDN
- API: Docker/Kubernetes auf Cloud (AWS, DigitalOcean, Heroku etc.)

## Projektphasen

1. **Core Infrastructure** (aktuelle Phase)
   - Auth & User-Modelle
   - Grundlegende Datenmodelle
   - API-Grundstruktur
   - Frontend Grund-Setup
   - CI/CD-Basics

2. **Mining System**
   - Mining-Mechanik und Logik
   - Boost-System
   - Anti-Fraud-Maßnahmen

3. **Social Feed & Interaktionen**
   - Posts, Comments, Likes
   - Hashtags, Mentions
   - Notifications

4. **Profile & Community**
   - Benutzerprofile
   - Freunde/Follower
   - Gruppen

5. **Messaging & Notifications**
   - Chat-System
   - Benachrichtigungen

6. **Wallet & Token-Ökonomie**
   - Internes Wallet
   - Token-Balance
   - On-Chain-Integration

7. **Token- & NFT-Erstellung**
   - Token-Factory
   - NFT-Collections
   - Smart Contract Integration

8. **DAO & Governance**
   - Proposals
   - Voting-Mechanismen
   - Treasury

9. **Mobile-Integration**
   - React Native App
   - Push-Notifications

10. **Analytics & Monitoring**
    - Nutzungsstatistiken
    - Admin-Dashboard

11. **Skalierung & Performance**
    - Caching
    - Optimierungen
    - Lastverteilung

12. **SDK & Ökosystem-Erweiterung**
    - API-Wrapper
    - Third-Party-Integrationen

13. **Eigene Blockchain** (langfristig)
    - Blockchain-Entwicklung
    - Integration in Plattform

14. **Wartung & Weiterentwicklung**
    - Sicherheitsaudits
    - Kontinuierliche Updates

## Stakeholder

- Gründerteam: Produktstrategie, Entscheidung
- Nutzer Web2: vertraute Social-Funktionalität
- Nutzer Web3: Wallet & Token-Features
- Entwicklungsteam: Umsetzung & Wartung
- Marketing/Community-Team: Wachstum, Bindung
- Investoren: Finanzierung, strategische Beratung

## Aktuelle Prioritäten

1. Landing-Plattform mit Pre-Sale/Reservierung des BSN-Tokens
2. Faucet-Mechanismen für Token-Claims
3. Referral-System für Community-Aufbau
4. Informationsseiten zu Kernfunktionen
5. Registrierung/Login-System
6. Backend-Migration von Supabase zu Django

## Besonderheiten & Anforderungen

- Das bestehende Frontend-Design soll beibehalten werden
- Die Landingpage ist bereits teilweise implementiert
- Migration von Supabase zu Django als Backend
- Whitepaper-Details zum BSN Token sind noch nicht finalisiert
- Anti-Fraud-Mechanismen sind kritisch für Faucet und Referral-System
- Klare rechtliche Hinweise für Token-Reservierung erforderlich
