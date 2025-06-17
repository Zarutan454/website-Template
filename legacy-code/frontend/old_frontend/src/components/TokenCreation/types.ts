
import { DeploymentStageType } from './types/index';
import { TokenFormValues } from './types/TokenFormTypes';

// Basic token data structure
export interface TokenFormData {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
  network: string;
  tokenType: 'standard' | 'marketing' | 'business';
  ownerAddress?: string;
  features?: TokenFeatures;
  description?: string;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  maxSupply?: string;
  lockupTime?: string;
  marketingWallet?: string;
  devWallet?: string;
  charityWallet?: string;
  buyTax?: string;
  sellTax?: string;
}

// Token features
export interface TokenFeatures {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  shareable: boolean;
}

// Token type information
export interface TokenTypeInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  recommended?: boolean;
  icon?: React.ReactNode;
  complexity?: string;
}

// Extended token type with additional properties
export interface TokenTypeData extends TokenTypeInfo {
  id: 'standard' | 'marketing' | 'business';
  symbol?: string;
  initialSupply?: string;
  network?: string;
  canMint?: boolean;
  canBurn?: boolean;
  tokenId?: string;
}

export type TokenType = 'standard' | 'marketing' | 'business' | TokenTypeData;

// Deployment stage
export interface DeploymentStage {
  stage: DeploymentStageType;
  message?: string;
  txHash?: string;
  error?: string;
}

// Re-export types from index
export type { DeploymentStageType, TokenFormValues };
export { DEPLOYMENT_STAGES } from './types/index';
export type { NetworkOption } from './types/index';
// Import TokenTypeOption directly from the file that contains it rather than index
export type { TokenTypeOption } from './types/TokenTypeOption';
