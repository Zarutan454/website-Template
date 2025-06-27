import { ethers } from 'ethers';
import { withRetry, handleDeploymentError } from './retryDeployment';
import { validateAndSwitchNetwork } from '@/hooks/useNetworkValidation';
import { toast } from '@/hooks/use-toast';
import { trackTransaction } from '../transactions/transactionTracker';

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}

export const deployContract = async (
  contractFactory: ethers.ContractFactory,
  args: any[],
  config: {
    network: string;
    tokenId: string;
    onProgress?: (status: string) => void;
  }
): Promise<DeploymentResult> => {
  try {
    console.log('Starting deployment with config:', config);
    console.log('Constructor arguments:', args);

    // Validate and switch network first
    await validateAndSwitchNetwork(config.network);
    
    const deploy = async () => {
      if (config.onProgress) {
        config.onProgress('Initiating deployment...');
      }

      console.log('Deploying contract...');
      const contract = await contractFactory.deploy(...args);
      
      if (config.onProgress) {
        config.onProgress('Waiting for confirmation...');
      }
      
      console.log('Waiting for deployment confirmation...');
      await contract.waitForDeployment();
      
      return contract;
    };

    const contract = await withRetry(
      'Contract Deployment',
      deploy
    );

    const contractAddress = await contract.getAddress();
    console.log('Contract deployed at:', contractAddress);

    const deploymentTx = contract.deploymentTransaction();
    if (!deploymentTx) {
      throw new Error('No deployment transaction found');
    }

    // Track the transaction
    await trackTransaction({
      token_id: config.tokenId,
      transaction_hash: deploymentTx.hash,
      transaction_type: 'deployment',
      status: 'pending',
      network: config.network
    });

    if (config.onProgress) {
      config.onProgress('Waiting for blockchain confirmation...');
    }

    console.log('Waiting for transaction confirmation...');
    const receipt = await deploymentTx.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    console.log('Deployment successful:', {
      contractAddress,
      transactionHash: deploymentTx.hash,
      blockNumber: receipt.blockNumber
    });

    toast({
      title: "Deployment erfolgreich",
      description: `Contract wurde erfolgreich deployed unter ${contractAddress}`,
    });

    return {
      success: true,
      contractAddress,
      transactionHash: deploymentTx.hash
    };

  } catch (error) {
    console.error('Contract deployment error:', error);
    const errorMessage = handleDeploymentError(error);
    
    toast({
      title: "Deployment fehlgeschlagen",
      description: errorMessage,
      variant: "destructive",
    });

    return {
      success: false,
      error: errorMessage
    };
  }
};
