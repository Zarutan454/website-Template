
// Get the base explorer URL for a given network
export const getExplorerUrl = (network: string): string => {
  const networkLower = network.toLowerCase();
  
  switch (networkLower) {
    case 'ethereum':
    case 'mainnet':
      return 'https://etherscan.io';
    case 'holesky':
    case 'testnet':
      return 'https://holesky.etherscan.io';
    case 'sepolia':
      return 'https://sepolia.etherscan.io';
    case 'polygon':
      return 'https://polygonscan.com';
    case 'mumbai':
      return 'https://mumbai.polygonscan.com';
    case 'avalanche':
      return 'https://snowtrace.io';
    case 'fuji':
      return 'https://testnet.snowtrace.io';
    case 'arbitrum':
      return 'https://arbiscan.io';
    case 'optimism':
      return 'https://optimistic.etherscan.io';
    case 'bsc':
    case 'binance':
      return 'https://bscscan.com';
    case 'base':
      return 'https://basescan.org';
    default:
      return 'https://etherscan.io';
  }
};

// Format and return full URL for a transaction or address
export const getExplorerLink = (network: string, value: string, type: 'transaction' | 'address'): string => {
  const baseUrl = getExplorerUrl(network);
  const path = type === 'transaction' ? 'tx' : 'address';
  return `${baseUrl}/${path}/${value}`;
};

// Get network name for display
export const getNetworkName = (network: string): string => {
  const networkLower = network.toLowerCase();
  
  switch (networkLower) {
    case 'ethereum':
    case 'mainnet':
      return 'Ethereum';
    case 'holesky':
      return 'Holesky Testnet';
    case 'sepolia':
      return 'Sepolia Testnet';
    case 'polygon':
      return 'Polygon';
    case 'mumbai':
      return 'Polygon Mumbai';
    case 'avalanche':
      return 'Avalanche';
    case 'fuji':
      return 'Avalanche Fuji';
    case 'arbitrum':
      return 'Arbitrum';
    case 'optimism':
      return 'Optimism';
    case 'bsc':
    case 'binance':
      return 'BNB Chain';
    case 'base':
      return 'Base';
    default:
      return network.charAt(0).toUpperCase() + network.slice(1);
  }
};
