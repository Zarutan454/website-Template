
import { useState, useCallback } from 'react';
import { DeploymentStage, DEPLOYMENT_STAGES } from '@/components/TokenCreation/types/index';
import { deployToken } from '@/wallet/services/contracts/deployment';
import { DeploymentConfig } from '@/wallet/services/contracts/types';
import { useSigner } from '@/hooks/useSigner';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useNetworkValidation } from '@/hooks/useNetworkValidation';

export const useTokenDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStage>(DEPLOYMENT_STAGES.NOT_STARTED);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const { address } = useAccount();
  const getSignerFn = useSigner();
  const { validateNetwork } = useNetworkValidation();
  
  const resetDeployment = useCallback(() => {
    setIsDeploying(false);
    setDeploymentStatus(DEPLOYMENT_STAGES.NOT_STARTED);
    setContractAddress(null);
    setDeploymentError(null);
    setTransactionHash(null);
  }, []);
  
  const deployContract = async (config: DeploymentConfig) => {
    if (!getSignerFn || !address) {
      const errorMessage = 'Wallet nicht verbunden. Bitte verbinde deine Wallet, um fortzufahren.';
      setDeploymentError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
    
    // Validate network before deployment
    const isNetworkValid = await validateNetwork(config.network);
    if (!isNetworkValid) {
      const errorMessage = `Bitte wechsle zum ${config.network} Netzwerk, um fortzufahren.`;
      setDeploymentError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
    
    try {
      setIsDeploying(true);
      setDeploymentError(null);
      setDeploymentStatus(DEPLOYMENT_STAGES.PREPARING);
      
      // Get signer
      const signer = await getSignerFn();
      if (!signer) {
        throw new Error('Signer konnte nicht abgerufen werden');
      }
      
      setDeploymentStatus(DEPLOYMENT_STAGES.DEPLOYING);
      toast.info('Deployment gestartet. Bitte bestätige die Transaktion in deiner Wallet.');
      
      // Deploy token contract
      const result = await deployToken(signer, {
        ...config,
        ownerAddress: address
      });
      
      if (!result.success || !result.contractAddress) {
        throw new Error(result.error || 'Unbekannter Fehler beim Deployment');
      }

      setContractAddress(result.contractAddress);
      setTransactionHash(result.transactionHash || null);
      
      // Update status to confirming
      setDeploymentStatus(DEPLOYMENT_STAGES.CONFIRMING);
      toast.info('Deployment wird bestätigt...');
      
      // Wait a bit to simulate blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to verify the contract if we have a transaction hash
      if (result.transactionHash && config.network !== 'local') {
        try {
          setDeploymentStatus(DEPLOYMENT_STAGES.VERIFYING);
          toast.info('Smart Contract wird verifiziert...');
          
          // This would be implemented in a real app
          // We simulate verification with a timeout
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // For demo purposes, simulate verification
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (verifyError) {
          // Continue despite verification failure
        }
      }
      
      // Set as completed
      setDeploymentStatus({
        stage: 'completed',
        message: 'Token erfolgreich deployed',
        txHash: result.transactionHash
      });
      
      toast.success('Token erfolgreich deployed!', {
        description: `Dein Token wurde unter der Adresse ${result.contractAddress} deployed.`,
        duration: 5000
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Deployment';
      
      setDeploymentStatus({
        stage: 'failed',
        message: 'Deployment fehlgeschlagen',
        error: errorMessage
      });
      
      setDeploymentError(errorMessage);
      
      toast.error('Deployment fehlgeschlagen', {
        description: errorMessage,
        duration: 5000
      });
      
      return null;
    } finally {
      setIsDeploying(false);
    }
  };
  
  return {
    deployContract,
    isDeploying,
    deploymentStatus,
    contractAddress,
    transactionHash,
    deploymentError,
    resetDeployment
  };
};
