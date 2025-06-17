
import { ethers } from 'ethers';

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
  explorerUrl?: string;
  tokenExplorerUrl?: string;
  gasUsed?: string;
  gasCostEth?: string;
}

export interface DeploymentConfig {
  name: string;
  symbol: string;
  initialSupply: string;
  ownerAddress: string;
  tokenType: 'standard' | 'business' | 'marketing';
  network: string;
  canMint: boolean;
  canBurn: boolean;
  tokenId: string;
  maxSupply?: string;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  lockupTime?: string;
  buyTax?: string;
  sellTax?: string;
  marketingWallet?: string;
  devWallet?: string;
  charityWallet?: string;
}

export interface GasEstimate {
  gasLimit: string;
  gasPriceGwei: string;
  totalCostEth: string;
  totalCostUsd?: string;
  network: string;
  success?: boolean;
  error?: string;
  estimatedGas?: number;
  gasPrice?: bigint;
}

export interface TokenContractInstance {
  address: string;
  abi: Record<string, unknown>[];
  contract: ethers.Contract;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}
