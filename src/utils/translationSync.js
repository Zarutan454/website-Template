/**
 * translationSync.js
 * 
 * Dieses Script hilft bei der Synchronisierung aller Sprachdateien
 * und stellt sicher, dass die Struktur der Übersetzungsschlüssel
 * in allen Sprachen einheitlich ist.
 * 
 * HINWEIS: Dieses Script kann nicht direkt im Browser verwendet werden,
 * da es Dateisystemfunktionen verwendet. Es dient nur als Referenz für
 * die manuelle Anpassung der Übersetzungsdateien.
 */

// Die Struktur für die Footer-Übersetzungen, die in allen Sprachen verwendet werden sollte
export const correctFooterStructure = {
  newsletter: {
    title: "Stay Updated",
    description: "Subscribe to our newsletter and be the first to know about platform updates, token events, and exclusive community offers.",
    subscribers: "Join 25,000+ blockchain enthusiasts",
    placeholder: "Enter your email",
    button: "Subscribe",
    success: "Subscribed!",
    privacy: "We respect your privacy. Unsubscribe at any time."
  },
  description: "Decentralized social networking platform built on blockchain technology, empowering users with full control over their data, identity, and digital interactions.",
  platformTitle: "PLATFORM",
  platform: {
    dashboard: "Dashboard",
    socialFeed: "Social Feed",
    tokenWallet: "Token Wallet",
    privacySettings: "Privacy Settings",
    nftGallery: "NFT Gallery",
    marketplace: "Marketplace"
  },
  blockchainTitle: "BLOCKCHAIN",
  blockchain: {
    tokenomics: "Tokenomics",
    staking: "Staking",
    governance: "Governance",
    whitepaper: "Whitepaper",
    technicalDocs: "Technical Docs",
    smartContracts: "Smart Contracts"
  },
  communityTitle: "COMMUNITY",
  community: {
    blog: "Blog",
    forum: "Forum",
    events: "Events",
    support: "Support",
    careers: "Careers"
  },
  rights: "All Rights Reserved",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  contact: "Contact"
};

// Die deutschen Übersetzungen für die Footer-Struktur
export const germanFooterStructure = {
  newsletter: {
    title: "Bleibe auf dem Laufenden",
    description: "Abonniere unseren Newsletter und sei der Erste, der über Plattform-Updates, Token-Events und exklusive Community-Angebote informiert wird.",
    subscribers: "25.000+ Blockchain-Enthusiasten sind dabei",
    placeholder: "Deine E-Mail-Adresse",
    button: "Abonnieren",
    success: "Abonniert!",
    privacy: "Wir respektieren deine Privatsphäre. Jederzeit abbestellbar."
  },
  description: "Dezentralisierte soziale Netzwerkplattform auf Basis von Blockchain-Technologie, die Nutzern die volle Kontrolle über ihre Daten, Identität und digitalen Interaktionen gibt.",
  platformTitle: "PLATTFORM",
  platform: {
    dashboard: "Dashboard",
    socialFeed: "Social Feed",
    tokenWallet: "Token Wallet",
    privacySettings: "Datenschutz-Einstellungen",
    nftGallery: "NFT Galerie",
    marketplace: "Marktplatz"
  },
  blockchainTitle: "BLOCKCHAIN",
  blockchain: {
    tokenomics: "Tokenomics",
    staking: "Staking",
    governance: "Governance",
    whitepaper: "Whitepaper",
    technicalDocs: "Technische Dokumente",
    smartContracts: "Smart Contracts"
  },
  communityTitle: "COMMUNITY",
  community: {
    blog: "Blog",
    forum: "Forum",
    events: "Events",
    support: "Support",
    careers: "Karriere"
  },
  rights: "Alle Rechte vorbehalten",
  privacy: "Datenschutz",
  terms: "AGB",
  contact: "Kontakt"
};

// Anleitung zur manuellen Aktualisierung der Sprachdateien
export const syncInstructions = `
# Anleitung zur Synchronisierung aller Übersetzungsdateien

Um die Übersetzungsdateien zu synchronisieren und sicherzustellen, 
dass alle die korrekte Footer-Struktur haben, führe die folgenden Schritte aus:

1. Öffne jede Sprachdatei unter src/translations/LANG/translation.json
2. Ersetze die footer-Sektion mit der passenden Struktur aus diesem Script
   - Für Englisch: correctFooterStructure
   - Für Deutsch: germanFooterStructure
   - Für andere Sprachen: Beginne mit der correctFooterStructure und übersetze die Werte entsprechend

3. Achte besonders auf die folgenden Punkte:
   - Die Struktur muss in allen Dateien gleich sein
   - Unterscheide zwischen platformTitle, blockchainTitle, communityTitle und den entsprechenden Objekten
   - Stelle sicher, dass alle Newsletter-Felder vorhanden sind

Beispiele für die Aktualisierung:

Für Englisch:
\`\`\`json
"footer": {
  "newsletter": {
    "title": "Stay Updated",
    ...
  },
  "description": "Decentralized social networking platform...",
  "platformTitle": "PLATFORM",
  "platform": {
    "dashboard": "Dashboard",
    ...
  },
  ...
}
\`\`\`

Für Deutsch:
\`\`\`json
"footer": {
  "newsletter": {
    "title": "Bleibe auf dem Laufenden",
    ...
  },
  "description": "Dezentralisierte soziale Netzwerkplattform...",
  "platformTitle": "PLATTFORM",
  "platform": {
    "dashboard": "Dashboard",
    ...
  },
  ...
}
\`\`\`
`;

export default {
  correctFooterStructure,
  germanFooterStructure,
  syncInstructions
}; 