# Etherscan API Setup

## Übersicht

Die Anwendung verwendet jetzt Etherscan API für zuverlässigere Blockchain-Operationen anstelle von direkten RPC-Calls. Dies vermeidet die häufigen Cloudflare RPC-Fehler.

## Vorteile der Etherscan API

✅ **Zuverlässiger** - Weniger Ausfälle als öffentliche RPC-Endpunkte  
✅ **Schneller** - Optimierte API-Endpunkte  
✅ **Rate Limiting** - Höhere Limits mit API-Key  
✅ **Bessere Fehlerbehandlung** - Strukturierte API-Antworten  
✅ **Mehr Funktionen** - Token-Balances, Transaktionen, etc.  

## Setup

### 1. Etherscan API Key erhalten

1. Gehe zu [Etherscan](https://etherscan.io/)
2. Erstelle ein kostenloses Konto
3. Gehe zu "API-Keys" in deinem Profil
4. Erstelle einen neuen API-Key

### 2. Environment Variable setzen

Füge deinen API-Key zur `.env`-Datei hinzu:

```env
VITE_ETHERSCAN_API_KEY=dein_api_key_hier
```

### 3. API-Key in der Anwendung verwenden

Der API-Key wird automatisch in folgenden Services verwendet:

- **Wallet-Balances** - ETH und Token-Balances
- **Transaktionen** - Transaktionshistorie
- **Token-Informationen** - Token-Details und Balances

## Verwendung

### Wallet Service

```typescript
import { etherscanService } from '@/lib/etherscan'

// ETH Balance abrufen
const balance = await etherscanService.getAccountBalance(address, 'mainnet')

// Token Balances abrufen
const tokenBalances = await etherscanService.getTokenBalances(address, 'mainnet')

// Transaktionen abrufen
const transactions = await etherscanService.getTransactions(address, 'mainnet')
```

### Fallback-Mechanismus

Falls kein Etherscan API-Key konfiguriert ist, verwendet die Anwendung automatisch:

1. **Wagmi publicProvider** - Für grundlegende Wallet-Funktionen
2. **Fallback RPC-Endpunkte** - Für spezifische Operationen

## Rate Limits

- **Free Tier**: 5 calls/sec, 100,000 calls/day
- **Pro Tier**: 10 calls/sec, 300,000 calls/day

## Fehlerbehandlung

Die Anwendung behandelt Etherscan API-Fehler automatisch:

- **API-Key fehlt** → Fallback zu RPC
- **Rate Limit erreicht** → Automatische Retry-Logik
- **Netzwerk-Fehler** → Fallback-Mechanismus

## Kosten

- **Free Tier**: Kostenlos für die meisten Anwendungsfälle
- **Pro Tier**: $49/Monat für höhere Limits

## Sicherheit

- API-Keys werden nur client-seitig verwendet
- Keine sensiblen Daten werden an Etherscan gesendet
- Nur öffentliche Blockchain-Daten werden abgerufen

## Troubleshooting

### "Etherscan API key not configured"
- Prüfe, ob `VITE_ETHERSCAN_API_KEY` in der `.env`-Datei gesetzt ist
- Starte den Development-Server neu

### "Rate limit exceeded"
- Warte kurz und versuche es erneut
- Erwäge ein Upgrade auf Pro Tier für höhere Limits

### "API error"
- Prüfe die Etherscan API-Status-Seite
- Validiere deinen API-Key
- Prüfe die Netzwerkverbindung 