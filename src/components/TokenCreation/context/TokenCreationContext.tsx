import * as React from 'react';
import { createContext, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { TokenFormValues } from '../types/TokenFormTypes';
import { useSigner } from '@/hooks/useSigner';
import { deployToken } from '@/wallet/services/contractService';
import { TokenCreationContextType } from './TokenCreationContext.utils';

const TokenCreationContext = createContext<TokenCreationContextType | undefined>(undefined);

export const TokenCreationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const getSigner = useSigner();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deployedContract, setDeployedContract] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '1000000',
    decimals: '18',
    network: 'ethereum',
    tokenType: 'standard',
    features: {
      mintable: true,
      burnable: true,
      pausable: false,
    },
    description: '',
    maxTransactionLimit: '',
    maxWalletLimit: '',
    maxSupply: ''
  });
  
  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };
  
  const updateFormField = (field: string, value: unknown) => {
    // Optionally, add type guards for value if needed
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleFeaturesChange = (feature: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };
  
  const deployTokenContract = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return false;
    }
    setDeploymentError(null);
    setIsDeploying(true);
    try {
      // Get signer from provider
      const signer = await getSigner();
      // Deploy the token contract
      let tokenTypeStr: string = 'standard';
      if (typeof formData.tokenType === 'string') {
        tokenTypeStr = formData.tokenType;
      } else if (
        typeof formData.tokenType === 'object' &&
        formData.tokenType !== null &&
        'id' in formData.tokenType &&
        typeof (formData.tokenType as { id?: string }).id === 'string'
      ) {
        tokenTypeStr = (formData.tokenType as { id: string }).id;
      }
      const deployConfig = {
        name: formData.name,
        symbol: formData.symbol,
        initialSupply: formData.supply,
        ownerAddress: address,
        network: formData.network,
        tokenType: tokenTypeStr as 'standard' | 'marketing' | 'business',
        canMint: formData.features.mintable,
        canBurn: formData.features.burnable,
        maxTransactionLimit: formData.maxTransactionLimit,
        maxWalletLimit: formData.maxWalletLimit,
        maxSupply: formData.maxSupply
      };
      const result = await deployToken(deployConfig) as { success: boolean; contractAddress?: string; error?: string };
      if (!result.success || !result.contractAddress) {
        throw new Error(result.error || "Failed to deploy contract");
      }
      setDeployedContract(result.contractAddress);
      toast.success("Token deployed successfully!");
      // Move to the success step
      handleNextStep();
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deploying token:', error);
        setDeploymentError(error.message || "Failed to deploy token contract");
      } else {
        setDeploymentError("Failed to deploy token contract");
      }
      return false;
    } finally {
      setIsDeploying(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      supply: '1000000',
      decimals: '18',
      network: 'ethereum',
      tokenType: 'standard',
      features: {
        mintable: true,
        burnable: true,
        pausable: false,
      },
      description: '',
      maxTransactionLimit: '',
      maxWalletLimit: '',
      maxSupply: ''
    });
    setCurrentStep(0);
    setDeployedContract(null);
    setDeploymentError(null);
    setErrors({});
  };
  
  return (
    <TokenCreationContext.Provider value={{
      currentStep,
      formData,
      isLoading,
      isDeploying,
      deploymentError,
      deployedContract,
      ownerAddress: address,
      form: null, // We don't use react-hook-form in this version
      errors,
      handleNextStep,
      handlePreviousStep,
      updateFormField,
      handleFeaturesChange,
      deployTokenContract,
      resetForm
    }}>
      {children}
    </TokenCreationContext.Provider>
  );
};

// Export the context for use in the hook
export { TokenCreationContext };
