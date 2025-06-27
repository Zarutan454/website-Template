
export interface DeploymentConfig {
  name: string;
  symbol: string;
  initialSupply: string;
  ownerAddress: string;
  network: string;
  tokenType: 'standard' | 'business' | 'marketing';
  canMint: boolean;
  canBurn: boolean;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  maxSupply?: string;
  lockupTime?: string;
  tokenId: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}

export interface DeploymentStatus {
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  transactionHash?: string;
}

export interface GasEstimate {
  success: boolean;
  estimatedGas?: number;
  gasPrice?: bigint;
  totalCostEth?: string;
  error?: string;
}
