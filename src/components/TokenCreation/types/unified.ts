
import { LucideIcon } from 'lucide-react';

// Network Option interface
export interface NetworkOption {
  id: string;
  name: string;
  icon: string;
  isTestnet: boolean;
  color: string;
  currency: string;
  gasToken: string;
  chainId: number;
  symbol: string;
}

// Token Type Option interface
export interface TokenTypeOption {
  id: string;
  title: string;
  name: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'Einfach' | 'Mittel' | 'Komplex';
  label?: string;
}

// Deployment stage types
export type DeploymentStageType = 
  | 'not-started'
  | 'preparing'
  | 'deploying'
  | 'verifying'
  | 'confirming'
  | 'completed'
  | 'failed';

export interface DeploymentStage {
  stage: DeploymentStageType;
  message?: string;
  txHash?: string;
  error?: string;
}

// Standard deployment stages
export const DEPLOYMENT_STAGES = {
  NOT_STARTED: { stage: 'not-started' } as DeploymentStage,
  PREPARING: { stage: 'preparing', message: 'Preparing deployment...' } as DeploymentStage,
  DEPLOYING: { stage: 'deploying', message: 'Deploying token to blockchain...' } as DeploymentStage,
  VERIFYING: { stage: 'verifying', message: 'Verifying contract on explorer...' } as DeploymentStage,
  CONFIRMING: { stage: 'confirming', message: 'Waiting for confirmation...' } as DeploymentStage,
  COMPLETED: { stage: 'completed', message: 'Token successfully deployed!' } as DeploymentStage,
  FAILED: { stage: 'failed', message: 'Deployment failed' } as DeploymentStage
};

// Token Features interface
export interface TokenFeatures {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  shareable: boolean;
}

// Form data structure
export interface TokenFormData {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
  network: string;
  tokenType: string;
  ownerAddress?: string;
  features: TokenFeatures;
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
