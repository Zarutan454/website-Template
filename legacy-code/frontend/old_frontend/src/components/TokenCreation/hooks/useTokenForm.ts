
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentStage, DEPLOYMENT_STAGES } from '../types';
import { TokenFormValues } from '../types/TokenFormTypes';
import { tokenFormSchema } from '../types/TokenFormTypes';
import { estimateDeploymentGas } from '@/wallet/services/contracts/gas';
import { deployToken } from '@/wallet/services/contracts/deployment';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { useSigner } from '@/hooks/useSigner';

export const useTokenForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStage>(DEPLOYMENT_STAGES.NOT_STARTED);
  const [estimatedGas, setEstimatedGas] = useState<{
    gasLimit: string;
    gasCost: string;
    nativeCurrency: string;
  } | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Use Zod resolver for form validation
  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      network: '',
      tokenType: '',
      name: '',
      symbol: '',
      decimals: '18',
      supply: '',
      features: {
        mintable: false,
        burnable: false,
        pausable: false,
        shareable: false
      }
    }
  });
  
  const { address } = useAccount();
  const chainId = useChainId();
  const getSignerFn = useSigner();
  const { data: balance } = useBalance({
    address
  });

  const nextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const jumpToStep = (step: number) => {
    setActiveStep(step);
  };

  const reset = () => {
    form.reset();
    setActiveStep(0);
    setDeploymentStatus(DEPLOYMENT_STAGES.NOT_STARTED);
    setEstimatedGas(null);
    setContractAddress(null);
  };

  const estimateGas = async (formData: TokenFormValues) => {
    try {
      setDeploymentStatus(DEPLOYMENT_STAGES.PREPARING);
      
      const result = await estimateDeploymentGas({
        name: formData.name,
        symbol: formData.symbol,
        initialSupply: formData.supply,
        ownerAddress: address || '',
        tokenType: formData.tokenType as 'standard' | 'business' | 'marketing',
        network: formData.network,
        canMint: formData.features.mintable,
        canBurn: formData.features.burnable,
        tokenId: 'temp-id' // Temporary ID for estimation
      });
      
      setEstimatedGas(result);
      return result;
    } catch (error) {
      setDeploymentStatus({
        stage: 'failed',
        message: 'Failed to estimate deployment cost',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  };

  const onSubmit = async () => {
    setIsDeploying(true);
    
    try {
      // Get form values
      const formData = form.getValues();
      
      if (!getSignerFn || !address) {
        setDeploymentStatus({
          stage: 'failed',
          message: 'Wallet not connected',
          error: 'Please connect your wallet to deploy the token'
        });
        return null;
      }
      
      setDeploymentStatus(DEPLOYMENT_STAGES.DEPLOYING);
      
      // Get signer
      const signer = await getSignerFn();
      if (!signer) {
        throw new Error('Failed to get signer');
      }
      
      // Deploy token contract
      const result = await deployToken(signer as any, {
        name: formData.name,
        symbol: formData.symbol,
        initialSupply: formData.supply,
        ownerAddress: address,
        tokenType: formData.tokenType as 'standard' | 'business' | 'marketing',
        network: formData.network,
        canMint: formData.features.mintable,
        canBurn: formData.features.burnable,
        tokenId: 'temp-token-id' // Add missing required property
      });
      
      if (result.success && result.contractAddress) {
        setContractAddress(result.contractAddress);
        setDeploymentStatus({
          stage: 'completed',
          message: 'Token deployed successfully',
          txHash: result.transactionHash
        });
        return result;
      } else {
        setDeploymentStatus({
          stage: 'failed',
          message: 'Deployment failed',
          error: result.error || 'Unknown error during deployment'
        });
        return null;
      }
    } catch (error) {
      console.error('Contract deployment error:', error);
      setDeploymentStatus({
        stage: 'failed',
        message: 'Deployment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    form,
    activeStep,
    nextStep,
    prevStep,
    jumpToStep,
    reset,
    estimateGas,
    deployContract: onSubmit,
    deploymentStatus,
    estimatedGas,
    contractAddress,
    setDeploymentStatus,
    address,
    balance,
    chain: { id: chainId },
    isDeploying,
    onSubmit
  };
};
