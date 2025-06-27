
// Helper functions for blockchain networks

/**
 * Get explorer URL for specific network and address
 */
export const getExplorerUrl = (network: string, address: string): string => {
  const explorers: Record<string, string> = {
    'ethereum': 'https://etherscan.io',
    'polygon': 'https://polygonscan.com',
    'bsc': 'https://bscscan.com',
    'optimism': 'https://optimistic.etherscan.io',
    'arbitrum': 'https://arbiscan.io',
    'avalanche': 'https://snowtrace.io',
    'sepolia': 'https://sepolia.etherscan.io',
    'holesky': 'https://holesky.etherscan.io',
    'goerli': 'https://goerli.etherscan.io',
  };
  
  const baseUrl = explorers[network.toLowerCase()] || explorers['ethereum'];
  return `${baseUrl}/address/${address}`;
};

/**
 * Get transaction explorer URL
 */
export const getTransactionUrl = (network: string, txHash: string): string => {
  const baseUrl = getExplorerUrl(network, '').replace('/address/', '');
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Get network name for display
 */
export const getNetworkDisplayName = (networkId: string): string => {
  const networks: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'bsc': 'BNB Smart Chain',
    'optimism': 'Optimism',
    'arbitrum': 'Arbitrum',
    'avalanche': 'Avalanche',
    'sepolia': 'Sepolia Testnet',
    'holesky': 'Holesky Testnet',
    'goerli': 'Goerli Testnet',
  };
  
  return networks[networkId.toLowerCase()] || networkId;
};

/**
 * Get currency symbol for a network
 */
export const getNetworkCurrency = (networkId: string): string => {
  const currencies: Record<string, string> = {
    'ethereum': 'ETH',
    'polygon': 'MATIC',
    'bsc': 'BNB',
    'optimism': 'ETH',
    'arbitrum': 'ETH',
    'avalanche': 'AVAX',
    'sepolia': 'ETH',
    'holesky': 'ETH',
    'goerli': 'ETH',
  };
  
  return currencies[networkId.toLowerCase()] || 'ETH';
};
