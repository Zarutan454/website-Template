
/**
 * Returns the appropriate explorer URL for a given network
 * 
 * @param network The blockchain network
 * @returns The base URL of the blockchain explorer
 */
export const getExplorerUrl = (network: string): string => {
  switch(network.toLowerCase()) {
    case 'ethereum':
    case 'mainnet':
      return 'https://etherscan.io';
    case 'holesky':
      return 'https://holesky.etherscan.io';
    case 'sepolia':
      return 'https://sepolia.etherscan.io';
    case 'polygon':
      return 'https://polygonscan.com';
    case 'bsc':
    case 'binance':
      return 'https://bscscan.com';
    case 'arbitrum':
      return 'https://arbiscan.io';
    case 'optimism':
      return 'https://optimistic.etherscan.io';
    case 'base':
      return 'https://basescan.org';
    case 'avalanche':
    case 'avax':
      return 'https://snowtrace.io';
    case 'fantom':
    case 'ftm':
      return 'https://ftmscan.com';
    default:
      return 'https://etherscan.io';
  }
};

/**
 * Generates a complete explorer URL for various blockchain entities
 * 
 * @param network The blockchain network
 * @param type Type of entity (address, tx, token, block, code)
 * @param identifier The ID or address of the entity
 * @returns Complete URL to explorer
 */
export const getFullExplorerUrl = (
  network: string,
  type: 'address' | 'tx' | 'token' | 'block' | 'code',
  identifier: string
): string => {
  const baseUrl = getExplorerUrl(network);
  
  switch(type) {
    case 'address':
      return `${baseUrl}/address/${identifier}`;
    case 'tx':
      return `${baseUrl}/tx/${identifier}`;
    case 'token':
      return `${baseUrl}/token/${identifier}`;
    case 'block':
      return `${baseUrl}/block/${identifier}`;
    case 'code':
      return `${baseUrl}/address/${identifier}#code`;
    default:
      return baseUrl;
  }
};

/**
 * Generates a URL to the blockchain explorer for a verified contract
 * 
 * @param network The blockchain network
 * @param contractAddress The address of the contract
 * @returns URL to the code of the contract in the explorer
 */
export const getContractExplorerUrl = (
  network: string,
  contractAddress: string
): string => {
  return getFullExplorerUrl(network, 'code', contractAddress);
};

/**
 * Backward compatibility wrapper for the old function signature
 * @deprecated Use getFullExplorerUrl instead
 */
export const getExplorerUrl_v2 = (
  network: string,
  type: 'address' | 'tx' | 'token' | 'block' | 'code',
  identifier: string
): string => {
  return getFullExplorerUrl(network, type, identifier);
};
