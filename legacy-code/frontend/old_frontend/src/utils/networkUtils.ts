
/**
 * Gibt die CSS-Klasse für die Netzwerkfarbe basierend auf der Chain-ID zurück
 */
export function getNetworkColor(chainId: number): string {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return 'bg-blue-900/30 text-blue-300';
    case 56: // Binance Smart Chain
      return 'bg-yellow-900/30 text-yellow-300';
    case 137: // Polygon
      return 'bg-purple-900/30 text-purple-300';
    case 42161: // Arbitrum
      return 'bg-blue-900/30 text-blue-300';
    case 10: // Optimism
      return 'bg-red-900/30 text-red-300';
    case 43114: // Avalanche
      return 'bg-red-900/30 text-red-300';
    case 250: // Fantom
      return 'bg-blue-900/30 text-blue-300';
    default:
      return 'bg-gray-900/30 text-gray-300';
  }
}

/**
 * Gibt den Explorer-URL für eine Adresse oder Transaktion basierend auf der Chain-ID zurück
 */
export function getExplorerUrl(chainId: number, type: 'address' | 'tx', hash: string): string {
  let baseUrl = '';
  
  switch (chainId) {
    case 1: // Ethereum Mainnet
      baseUrl = 'https://etherscan.io';
      break;
    case 56: // Binance Smart Chain
      baseUrl = 'https://bscscan.com';
      break;
    case 137: // Polygon
      baseUrl = 'https://polygonscan.com';
      break;
    case 42161: // Arbitrum
      baseUrl = 'https://arbiscan.io';
      break;
    case 10: // Optimism
      baseUrl = 'https://optimistic.etherscan.io';
      break;
    case 43114: // Avalanche
      baseUrl = 'https://snowtrace.io';
      break;
    case 250: // Fantom
      baseUrl = 'https://ftmscan.com';
      break;
    default:
      baseUrl = 'https://etherscan.io';
  }
  
  return `${baseUrl}/${type}/${hash}`;
}

/**
 * Prüft, ob eine Chain für Token-Erstellung unterstützt wird
 */
export function isSupportedTokenChain(chainId: number): boolean {
  const supportedChains = [1, 56, 137, 42161, 10, 43114, 250];
  return supportedChains.includes(chainId);
}

/**
 * Gibt die native Währung für eine Chain zurück
 */
export function getNativeCurrency(chainId: number): { name: string; symbol: string; decimals: number } {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return { name: 'Ether', symbol: 'ETH', decimals: 18 };
    case 56: // Binance Smart Chain
      return { name: 'BNB', symbol: 'BNB', decimals: 18 };
    case 137: // Polygon
      return { name: 'MATIC', symbol: 'MATIC', decimals: 18 };
    case 42161: // Arbitrum
      return { name: 'Ether', symbol: 'ETH', decimals: 18 };
    case 10: // Optimism
      return { name: 'Ether', symbol: 'ETH', decimals: 18 };
    case 43114: // Avalanche
      return { name: 'AVAX', symbol: 'AVAX', decimals: 18 };
    case 250: // Fantom
      return { name: 'FTM', symbol: 'FTM', decimals: 18 };
    default:
      return { name: 'Ether', symbol: 'ETH', decimals: 18 };
  }
}
