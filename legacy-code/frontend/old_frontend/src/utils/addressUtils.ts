
/**
 * Kürzt eine Blockchain-Adresse für die Anzeige
 * z.B. 0x1234...5678
 */
export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

/**
 * Validiert eine Ethereum-Adresse
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Fügt ein 0x-Präfix zu einer Adresse hinzu, falls es fehlt
 */
export function addHexPrefix(address: string): string {
  if (!address) return '';
  if (address.startsWith('0x')) return address;
  return `0x${address}`;
}
