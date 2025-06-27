import { ethers } from 'ethers';
import { TokenABI } from '@/contracts/abi/TokenABI';
import { TokenBytecode } from '@/contracts/bytecode/TokenBytecode';
import { DeploymentConfig, DeploymentResult } from './types';
import { validateAndSwitchNetwork } from '@/hooks/useNetworkValidation';
import { withRetry, handleDeploymentError } from '../deployment/retryDeployment';
import { trackTransaction, updateTransactionStatus } from '../transactions/transactionTracker';
import { toast } from '@/hooks/use-toast';
import { getWalletClient } from '@wagmi/core';
import { parseEther } from 'viem';
import { mainnet, holesky } from 'viem/chains';
import { config } from '@/lib/wagmi';

export const deployToken = async (deploymentConfig: DeploymentConfig): Promise<DeploymentResult> => {
  try {
    const publicClient = await validateAndSwitchNetwork(deploymentConfig.network);
    const chain = deploymentConfig.network.toLowerCase() === 'ethereum' ? mainnet : holesky;
    const walletClient = await getWalletClient({ ...config, account: deploymentConfig.ownerAddress });
    
    if (!walletClient) {
      throw new Error('No wallet connected');
    }
    
    const factory = new ethers.ContractFactory(TokenABI, TokenBytecode);
    const supply = parseEther(deploymentConfig.initialSupply);
    
    const constructorArgs = [
      deploymentConfig.name,
      deploymentConfig.symbol,
      supply,
      deploymentConfig.ownerAddress,
      deploymentConfig.canMint,
      deploymentConfig.canBurn
    ];

    if (deploymentConfig.tokenType === 'business') {
      constructorArgs.push(
        deploymentConfig.maxTransactionLimit ? parseEther(deploymentConfig.maxTransactionLimit) : ethers.MaxUint256,
        deploymentConfig.maxWalletLimit ? parseEther(deploymentConfig.maxWalletLimit) : ethers.MaxUint256,
        deploymentConfig.maxSupply ? parseEther(deploymentConfig.maxSupply) : ethers.MaxUint256,
        deploymentConfig.lockupTime || '0'
      );
    }

    toast({
      title: "Deployment gestartet",
      description: "Bitte bestätigen Sie die Transaktion in Ihrer Wallet",
    });

    const deployContract = async () => {
      const contract = await factory.deploy(...constructorArgs);
      console.log('Waiting for deployment...');
      await contract.waitForDeployment();
      return contract;
    };

    const contract = await withRetry(
      'Token Deployment',
      deployContract
    );

    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    if (deploymentTx) {
      await trackTransaction({
        token_id: deploymentConfig.tokenId,
        transaction_hash: deploymentTx.hash,
        transaction_type: 'deployment',
        status: 'pending',
        network: deploymentConfig.network
      });

      await deploymentTx.wait();
      await updateTransactionStatus(deploymentTx.hash, 'completed');
    }

    return {
      success: true,
      contractAddress,
      transactionHash: deploymentTx?.hash
    };

  } catch (error) {
    console.error('Token deployment error:', error);
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
