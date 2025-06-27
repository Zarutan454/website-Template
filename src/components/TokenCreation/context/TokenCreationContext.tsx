import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { TokenFormValues } from '../types/TokenFormTypes';
import { useSigner } from '@/hooks/useSigner';
import { deployToken } from '@/wallet/services/contractService';

interface TokenCreationContextType {
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
  form?: any;
  errors?: Record<string, string>;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  updateFormField: (field: string, value: any) => void;
  handleFeaturesChange: (feature: string, value: boolean) => void;
  deployTokenContract: () => Promise<boolean>;
  resetForm: () => void;
}

const TokenCreationContext = createContext<TokenCreationContextType | undefined>(undefined);

export const TokenCreationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const getSigner = useSigner();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deployedContract, setDeployedContract] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
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
  
  const updateFormField = (field: string, value: any) => {
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
  
  const saveTokenToDatabase = async (values: TokenFormValues, contractAddress?: string) => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const tokenData = {
        name: values.name,
        symbol: values.symbol,
        description: values.description || null,
        decimals: parseInt(values.decimals),
        total_supply: values.supply,
        contract_address: contractAddress || null,
        network: values.network,
        creator_id: user.id,
        features: [
          values.features.mintable ? 'mintable' : null,
          values.features.burnable ? 'burnable' : null,
          values.features.pausable ? 'pausable' : null,
          values.features.shareable ? 'shareable' : null
        ].filter(Boolean)
      };
      
      const { data: tokenResult, error } = await supabase
        .from('tokens')
        .insert(tokenData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Fix the TypeScript error by properly type-casting the result
      if (tokenResult && typeof tokenResult === 'object' && 'id' in tokenResult) {
        return tokenResult.id as string;
      }
      
      return null;
    } catch (error) {
      toast.error('Fehler beim Speichern des Tokens in der Datenbank');
      return null;
    }
  };
  
  const deployTokenContract = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return false;
    }
    
    setDeploymentError(null);
    setIsDeploying(true);
    
    try {
      // Save token to database first
      const tokenId = await saveTokenToDatabase(formData as TokenFormValues);
      setTokenId(tokenId);
      
      // Get signer from provider
      const signer = await getSigner();
      
      // Deploy the token contract
      const tokenTypeStr = typeof formData.tokenType === 'string' 
        ? formData.tokenType 
        : (formData.tokenType as any).id || 'standard';
        
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
        maxSupply: formData.maxSupply,
        tokenId
      };
      
      // Fix: Look at the implementation of deployToken and match the parameters
      const result = await deployToken(deployConfig);
      
      if (!result.success || !result.contractAddress) {
        throw new Error(result.error || "Failed to deploy contract");
      }
      
      // Update token with contract address
      if (tokenId) {
        await supabase
          .from('tokens')
          .update({ contract_address: result.contractAddress })
          .eq('id', tokenId);
      }
      
      setDeployedContract(result.contractAddress);
      toast.success("Token deployed successfully!");
      
      // Move to the success step
      handleNextStep();
      
      return true;
    } catch (error: any) {
      console.error('Error deploying token:', error);
      setDeploymentError(error.message || "Failed to deploy token contract");
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
    setTokenId(null);
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

export const useTokenCreation = () => {
  const context = useContext(TokenCreationContext);
  if (context === undefined) {
    throw new Error('useTokenCreation must be used within a TokenCreationProvider');
  }
  return context;
};
