# Übersetzungsrichtlinien für BSN Website

## Problemlösung: Footer-Struktur

Bei der Footer-Komponente wurde ein Problem mit der Übersetzungsstruktur identifiziert:
- Die Schlüssel `footer.platform`, `footer.blockchain` und `footer.community` wurden sowohl als Strings für Überschriften als auch als Objekte für Untermenüs verwendet
- Dies verursachte Fehlermeldungen wie `key 'footer.platform (de)' returned an object instead of string`

## Lösung

Wir haben die Übersetzungsstruktur geändert, indem wir:
1. Neue Schlüssel für Überschriften eingeführt haben: `platformTitle`, `blockchainTitle` und `communityTitle`
2. Die bestehenden Objekte beibehalten haben: `platform`, `blockchain` und `community`
3. Die Komponentendateien aktualisiert haben, um die neuen Schlüssel zu verwenden

## Anleitung zum Aktualisieren der Übersetzungsdateien

Für jede Sprachdatei (`src/translations/LANG/translation.json`):

1. Stelle sicher, dass die Footer-Sektion die folgende Struktur hat:

```json
"footer": {
  "newsletter": {
    "title": "[ÜBERSETZT]",
    "description": "[ÜBERSETZT]",
    "subscribers": "[ÜBERSETZT]",
    "placeholder": "[ÜBERSETZT]",
    "button": "[ÜBERSETZT]",
    "success": "[ÜBERSETZT]",
    "privacy": "[ÜBERSETZT]"
  },
  "description": "[ÜBERSETZT]",
  "platformTitle": "[ÜBERSETZT]",
  "platform": {
    "dashboard": "[ÜBERSETZT]",
    "socialFeed": "[ÜBERSETZT]",
    "tokenWallet": "[ÜBERSETZT]",
    "privacySettings": "[ÜBERSETZT]",
    "nftGallery": "[ÜBERSETZT]",
    "marketplace": "[ÜBERSETZT]"
  },
  "blockchainTitle": "[ÜBERSETZT]",
  "blockchain": {
    "tokenomics": "[ÜBERSETZT]",
    "staking": "[ÜBERSETZT]",
    "governance": "[ÜBERSETZT]",
    "whitepaper": "[ÜBERSETZT]",
    "technicalDocs": "[ÜBERSETZT]",
    "smartContracts": "[ÜBERSETZT]"
  },
  "communityTitle": "[ÜBERSETZT]",
  "community": {
    "blog": "[ÜBERSETZT]",
    "forum": "[ÜBERSETZT]",
    "events": "[ÜBERSETZT]",
    "support": "[ÜBERSETZT]",
    "careers": "[ÜBERSETZT]"
  },
  "rights": "[ÜBERSETZT]",
  "privacy": "[ÜBERSETZT]",
  "terms": "[ÜBERSETZT]",
  "contact": "[ÜBERSETZT]"
}
```

2. Ersetze jeden `[ÜBERSETZT]`-Platzhalter mit der entsprechenden Übersetzung in der jeweiligen Sprache.
   - Bei Schlüsseln wie `platformTitle`, die möglicherweise nicht existieren, aber ein äquivalentes `platform` haben, verwende den Wert von `platform`.
   - Bei fehlenden Übersetzungen verwende vorübergehend die englische Version als Fallback.

## Referenzimplementierungen

### Deutsch (de):

```json
"footer": {
  "newsletter": {
    "title": "Bleibe auf dem Laufenden",
    "description": "Abonniere unseren Newsletter und sei der Erste, der über Plattform-Updates, Token-Events und exklusive Community-Angebote informiert wird.",
    "subscribers": "25.000+ Blockchain-Enthusiasten sind dabei",
    "placeholder": "Deine E-Mail-Adresse",
    "button": "Abonnieren",
    "success": "Abonniert!",
    "privacy": "Wir respektieren deine Privatsphäre. Jederzeit abbestellbar."
  },
  "description": "Dezentralisierte soziale Netzwerkplattform auf Basis von Blockchain-Technologie, die Nutzern die volle Kontrolle über ihre Daten, Identität und digitalen Interaktionen gibt.",
  "platformTitle": "PLATTFORM",
  "platform": {
    "dashboard": "Dashboard",
    "socialFeed": "Social Feed",
    "tokenWallet": "Token Wallet",
    "privacySettings": "Datenschutz-Einstellungen",
    "nftGallery": "NFT Galerie",
    "marketplace": "Marktplatz"
  },
  "blockchainTitle": "BLOCKCHAIN",
  "blockchain": {
    "tokenomics": "Tokenomics",
    "staking": "Staking",
    "governance": "Governance",
    "whitepaper": "Whitepaper",
    "technicalDocs": "Technische Dokumente",
    "smartContracts": "Smart Contracts"
  },
  "communityTitle": "COMMUNITY",
  "community": {
    "blog": "Blog",
    "forum": "Forum",
    "events": "Events",
    "support": "Support",
    "careers": "Karriere"
  },
  "rights": "Alle Rechte vorbehalten",
  "privacy": "Datenschutz",
  "terms": "AGB",
  "contact": "Kontakt"
}
```

### Englisch (en):

```json
"footer": {
  "newsletter": {
    "title": "Stay Updated",
    "description": "Subscribe to our newsletter and be the first to know about platform updates, token events, and exclusive community offers.",
    "subscribers": "Join 25,000+ blockchain enthusiasts",
    "placeholder": "Enter your email",
    "button": "Subscribe",
    "success": "Subscribed!",
    "privacy": "We respect your privacy. Unsubscribe at any time."
  },
  "description": "Decentralized social networking platform built on blockchain technology, empowering users with full control over their data, identity, and digital interactions.",
  "platformTitle": "PLATFORM",
  "platform": {
    "dashboard": "Dashboard",
    "socialFeed": "Social Feed",
    "tokenWallet": "Token Wallet",
    "privacySettings": "Privacy Settings",
    "nftGallery": "NFT Gallery",
    "marketplace": "Marketplace"
  },
  "blockchainTitle": "BLOCKCHAIN",
  "blockchain": {
    "tokenomics": "Tokenomics",
    "staking": "Staking",
    "governance": "Governance",
    "whitepaper": "Whitepaper",
    "technicalDocs": "Technical Docs",
    "smartContracts": "Smart Contracts"
  },
  "communityTitle": "COMMUNITY",
  "community": {
    "blog": "Blog",
    "forum": "Forum",
    "events": "Events",
    "support": "Support",
    "careers": "Careers"
  },
  "rights": "All Rights Reserved",
  "privacy": "Privacy Policy",
  "terms": "Terms of Service",
  "contact": "Contact"
}
```

## Best Practices für Übersetzungen

1. **Einheitliche Schlüsselstruktur**:
   - Verwende eine konsistente Hierarchie für Übersetzungsschlüssel
   - Vermeide Schlüsselkonflikte (gleicher Schlüssel für String und Objekt)
   - Gruppiere zusammengehörende Übersetzungen logisch

2. **Unterscheidung zwischen Überschriften und Objekten**:
   - Bei Überschriften, die gleichnamige Objektgruppen haben, verwende eindeutige Schlüssel (z.B. `platformTitle` und `platform`)

3. **Fallback-Mechanismus**:
   - Verwende in der Komponente immer einen Fallback-String: `t('key', 'Default Text')`
   - Stelle sicher, dass alle Dateien die gleichen Schlüssel enthalten

4. **Upgrades und Änderungen**:
   - Bei strukturellen Änderungen, aktualisiere alle Sprachdateien gleichzeitig
   - Dokumentiere die Änderungen

5. **Wartung**:
   - Führe regelmäßige Prüfungen durch, um fehlende oder überflüssige Übersetzungen zu identifizieren
   - Verwende Tools zur Validierung der JSON-Struktur

## Hilfsskript zur Übersetzungssynchronisierung

Wir haben ein Hilfsskript erstellt (`src/utils/translationSync.js`), das als Referenz für die korrekte Struktur dient und beim manuellen Updaten der Sprachdateien hilft.

## Nächste Schritte

1. Aktualisiere alle verbleibenden Sprachdateien nach dem obigen Schema
2. Führe Tests durch, um sicherzustellen, dass alle Übersetzungen korrekt funktionieren
3. Implementiere einen systematischen Prozess zur Prüfung der Übersetzungsvollständigkeit 