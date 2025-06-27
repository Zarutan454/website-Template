
type ResourceType = 'transaction' | 'address' | 'token' | 'block';

/**
 * Get the explorer URL for a specific blockchain and resource
 */
export const getExplorerUrl = (
  network: string,
  value: string,
  type: ResourceType = 'address'
): string | null => {
  const explorers: Record<string, string> = {
    'ethereum': 'https://etherscan.io',
    'holesky': 'https://holesky.etherscan.io',
    'sepolia': 'https://sepolia.etherscan.io',
    'polygon': 'https://polygonscan.com',
    'bsc': 'https://bscscan.com',
    'avalanche': 'https://snowtrace.io',
    'arbitrum': 'https://arbiscan.io',
    'optimism': 'https://optimistic.etherscan.io',
    'fantom': 'https://ftmscan.com',
  };
  
  // If network not supported, return null
  if (!explorers[network.toLowerCase()]) {
    return null;
  }
  
  const baseUrl = explorers[network.toLowerCase()];
  
  switch (type) {
    case 'transaction':
      return `${baseUrl}/tx/${value}`;
    case 'address':
      return `${baseUrl}/address/${value}`;
    case 'token':
      return `${baseUrl}/token/${value}`;
    case 'block':
      return `${baseUrl}/block/${value}`;
    default:
      return `${baseUrl}/address/${value}`;
  }
};

/**
 * Format an address by shortening it (e.g. 0x1234...5678)
 */
export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format a hash by shortening it
 */
export const formatHash = (hash: string, startChars = 8, endChars = 8): string => {
  return formatAddress(hash, startChars, endChars);
};

/**
 * Get the chain ID for a specific network
 */
export const getChainId = (network: string): number | undefined => {
  const networkMappings: Record<string, number> = {
    'ethereum': 1,
    'mainnet': 1,
    'holesky': 17000,
    'polygon': 137,
    'matic': 137,
    'binance': 56,
    'bsc': 56,
    'optimism': 10,
    'arbitrum': 42161,
    'avalanche': 43114,
    'avax': 43114,
    'fantom': 250,
    'ftm': 250,
    'sepolia': 11155111
  };
  
  return networkMappings[network.toLowerCase()];
};
