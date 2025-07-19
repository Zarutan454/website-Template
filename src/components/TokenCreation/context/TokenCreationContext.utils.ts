import { TokenFormValues } from '../types/TokenFormTypes';
import { useContext } from 'react';
import { TokenCreationContext } from './TokenCreationContext';

export interface TokenCreationContextType {
  currentStep: number;
  formData: {
    name: string;
    symbol: string;
    supply: string;
    decimals: string;
    network: string;
    tokenType: string;
    features: {
      mintable: boolean;
      burnable: boolean;
      pausable: boolean;
    };
    description?: string;
    maxTransactionLimit?: string;
    maxWalletLimit?: string;
    maxSupply?: string;
    marketingWallet?: string;
    buyTax?: string;
    sellTax?: string;
    lockupTime?: string;
  };
  isLoading: boolean;
  isDeploying: boolean;
  deploymentError: string | null;
  deployedContract: string | null;
  ownerAddress?: string;
  form?: unknown;
  errors?: Record<string, string>;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  updateFormField: (field: string, value: unknown) => void;
  handleFeaturesChange: (feature: string, value: boolean) => void;
  deployTokenContract: () => Promise<boolean>;
  resetForm: () => void;
}

export const useTokenCreation = () => {
  const tokenContext = useContext(TokenCreationContext);
  if (tokenContext === undefined) {
    throw new Error('useTokenCreation must be used within a TokenCreationProvider');
  }
  return tokenContext;
}; 