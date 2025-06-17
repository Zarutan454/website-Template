
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { TokenType } from '../types';
import * as verificationService from '@/wallet/services/verification/verificationService';

// Import deployment service
import { deployToken } from '@/wallet/services/contracts/deployment';
import { useNavigate } from 'react-router-dom';
import { useSigner } from '@/hooks/useSigner';

interface TokenCreationState {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
  network: string;
  tokenType: TokenType;
  features: {
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
  };
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  maxSupply?: string;
  ownerAddress?: string;
  marketingWallet?: string;
  buyTax?: string;
  sellTax?: string;
}

export const useTokenCreation = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const getSigner = useSigner();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deployedContract, setDeployedContract] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TokenCreationState>({
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
    }
  });
  
  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };
  
  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
  
  const saveTokenToDatabase = async () => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      // Get user from Supabase
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }
      
      // Create token record in database
      const { data, error } = await supabase
        .from('tokens')
        .insert({
          name: formData.name,
          symbol: formData.symbol,
          description: '',
          network: formData.network,
          total_supply: parseFloat(formData.supply),
          decimals: parseInt(formData.decimals),
          creator_id: userData.user.id,
          features: [
            formData.features.mintable ? 'mintable' : null,
            formData.features.burnable ? 'burnable' : null,
            formData.features.pausable ? 'pausable' : null,
          ].filter(Boolean)
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create verification record for this token
      await supabase
        .from('token_verification_status')
        .insert({
          token_id: data.id,
          verification_status: 'unverified'
        });
      
      return data.id;
    } catch (error) {
      throw error;
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
      const tokenId = await saveTokenToDatabase();
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
      
      const result = await deployToken(signer, deployConfig);
      
      if (!result.success || !result.contractAddress) {
        throw new Error(result.error || "Failed to deploy contract");
      }
      
      // Update token with contract address
      await supabase
        .from('tokens')
        .update({ contract_address: result.contractAddress })
        .eq('id', tokenId);
      
      setDeployedContract(result.contractAddress);
      toast.success("Token deployed successfully!");
      
      // Move to the success step
      handleNextStep();
      
      return true;
    } catch (error: any) {
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
      }
    });
    setCurrentStep(0);
    setDeployedContract(null);
    setTokenId(null);
    setDeploymentError(null);
  };
  
  return {
    currentStep,
    formData,
    isLoading,
    isDeploying,
    deploymentError,
    deployedContract,
    ownerAddress: address,
    handleNextStep,
    handlePreviousStep,
    handleInputChange,
    handleFeaturesChange,
    deployTokenContract,
    resetForm
  };
};
