
export type DeploymentStageType = 'not-started' | 'preparing' | 'deploying' | 'confirming' | 'verifying' | 'completed' | 'failed';

export type TokenType = 'standard' | 'marketing' | 'business';

export interface TokenFeatures {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  shareable: boolean;
}

export interface TokenFormData {
  network: string;
  tokenType: TokenType;
  name: string;
  symbol: string;
  decimals: string;
  supply: string;
  features: TokenFeatures;
  description?: string;
  maxSupply?: string;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  marketingWallet?: string;
  buyTax?: string;
  sellTax?: string;
  lockupTime?: string;
  ownerAddress?: string;
}

export interface NetworkOption {
  id: string;
  name: string;
  currency: string;
  icon: string;
  isTestnet: boolean;
  tokenStandard?: string;
  transactionTime?: string;
  securityLevel?: string;
  gasRange?: string;
  chainId: number;
  gasToken?: string;
}

export interface DeploymentStage {
  stage: DeploymentStageType;
  message?: string;
  error?: string;
  txHash?: string;
}

export const DEPLOYMENT_STAGES = {
  NOT_STARTED: { stage: 'not-started' } as DeploymentStage,
  PREPARING: { stage: 'preparing', message: 'Vorbereitung des Deployments...' } as DeploymentStage,
  DEPLOYING: { stage: 'deploying', message: 'Token wird auf die Blockchain deployed...' } as DeploymentStage,
  CONFIRMING: { stage: 'confirming', message: 'Warte auf Bestätigung durch die Blockchain...' } as DeploymentStage,
  VERIFYING: { stage: 'verifying', message: 'Contract wird auf dem Blockchain-Explorer verifiziert...' } as DeploymentStage
};
