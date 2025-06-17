
/**
 * Basis-Mining-Rate in Tokens pro Stunde
 */
export const BASE_MINING_RATE = 0.3;

/**
 * Intervall für Heartbeat-Signale in Millisekunden (30 Sekunden)
 */
export const HEARTBEAT_INTERVAL = 30000;

/**
 * Inaktivitäts-Timeout in Millisekunden (5 Minuten)
 */
export const INACTIVITY_TIMEOUT = 300000;

/**
 * Tägliches Mining-Limit (maximale Anzahl an Tokens pro Tag)
 */
export const DAILY_MINING_LIMIT = 10;

/**
 * Mining-Limits und Geschwindigkeitsboosts für verschiedene Aktivitäten
 */
export const MINING_LIMITS = {
  post: { count: 3, speedBoost: 5, description: 'Erstelle einen Beitrag' },
  comment: { count: 5, speedBoost: 3, description: 'Kommentiere einen Beitrag' },
  like: { count: 5, speedBoost: 2, description: 'Like einen Beitrag' },
  share: { count: 5, speedBoost: 4, description: 'Teile einen Beitrag' },
  invite: { count: 2, speedBoost: 10, description: 'Lade einen Freund ein' },
  nft_like: { count: 3, speedBoost: 5, description: 'Like ein NFT' },
  nft_share: { count: 3, speedBoost: 5, description: 'Teile ein NFT' },
  nft_purchase: { count: 1, speedBoost: 15, description: 'Kaufe ein NFT' },
  token_like: { count: 3, speedBoost: 5, description: 'Like einen Token' },
  token_share: { count: 3, speedBoost: 5, description: 'Teile einen Token' },
  mining_start: { count: 1, speedBoost: 0, description: 'Starte Mining' },
  heartbeat: { count: 1, speedBoost: 0, description: 'Heartbeat' },
  login: { count: 1, speedBoost: 0, description: 'Login' }
};

/**
 * Maximaler Geschwindigkeitsboost in Prozent
 */
export const MAX_SPEED_BOOST = 95;
