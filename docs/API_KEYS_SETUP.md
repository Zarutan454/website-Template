# API Keys Setup

## Etherscan API Key

Der Etherscan API-Key ist bereits in der Konfiguration hinterlegt:

**API Key**: `EV9V3ZB72G6Z3RPAFDGRKIPFCY53IHNCS8`

### Verwendung

Der API-Key wird automatisch für folgende Funktionen verwendet:

- **ETH-Balance-Abfragen** - Zuverlässiger als RPC-Calls
- **Token-Balance-Abfragen** - Mit Transaktionshistorie
- **Transaktionshistorie** - Vollständige Wallet-Transaktionen
- **Fallback-Mechanismus** - Bei RPC-Fehlern

### Vorteile

✅ **Keine Cloudflare RPC-Fehler mehr**  
✅ **Zuverlässigere Blockchain-Operationen**  
✅ **Bessere Performance**  
✅ **Mehr Funktionen**  

### Rate Limits

- **Free Tier**: 5 calls/sec, 100,000 calls/day
- **Aktueller Key**: Funktioniert für die meisten Anwendungsfälle

### Sicherheit

- API-Key wird nur client-seitig verwendet
- Keine sensiblen Daten werden übertragen
- Nur öffentliche Blockchain-Daten werden abgerufen

## Weitere API Keys (Optional)

### Etherscan API Key (für eigene Projekte)

Falls du deinen eigenen Etherscan API-Key verwenden möchtest:

1. Gehe zu [Etherscan](https://etherscan.io/)
2. Erstelle ein kostenloses Konto
3. Gehe zu "API-Keys" in deinem Profil
4. Erstelle einen neuen API-Key
5. Füge ihn zur `.env`-Datei hinzu:

```env
VITE_ETHERSCAN_API_KEY=dein_eigener_api_key
```

### Infura API Key (Optional)

Für noch zuverlässigere RPC-Verbindungen:

1. Gehe zu [Infura](https://infura.io/)
2. Erstelle ein kostenloses Konto
3. Erstelle ein neues Projekt
4. Kopiere den API-Key
5. Füge ihn zur `.env`-Datei hinzu:

```env
VITE_INFURA_API_KEY=dein_infura_api_key
```

### Alchemy API Key (Optional)

Alternative zu Infura:

1. Gehe zu [Alchemy](https://alchemy.com/)
2. Erstelle ein kostenloses Konto
3. Erstelle eine neue App
4. Kopiere den API-Key
5. Füge ihn zur `.env`-Datei hinzu:

```env
VITE_ALCHEMY_API_KEY=dein_alchemy_api_key
```

## Troubleshooting

### "Etherscan API key not configured"
- Der API-Key ist bereits konfiguriert
- Falls du deinen eigenen Key verwenden möchtest, setze `VITE_ETHERSCAN_API_KEY` in der `.env`-Datei

### "Rate limit exceeded"
- Warte kurz und versuche es erneut
- Der Free Tier sollte für normale Nutzung ausreichen

### "API error"
- Prüfe die Etherscan API-Status-Seite
- Der konfigurierte Key sollte funktionieren
- Fallback-Mechanismus greift automatisch

## Entwicklung

Für die Entwicklung ist der API-Key bereits konfiguriert. Die Anwendung sollte jetzt ohne RPC-Fehler funktionieren.

**Teste die Wallet-Funktionen - sie sollten jetzt stabil arbeiten!** 