
import { ethers } from 'ethers';
import { DeploymentConfig, GasEstimate } from './types';
import { getWalletClient } from '@wagmi/core';
import { parseEther } from 'viem';
import { mainnet, holesky, sepolia } from 'viem/chains';
import type { PublicClient } from 'viem';
import { getNetworkClient } from '../../../src/wallet/services/networkService';

import { StandardTokenABI } from '../../../src/wallet/abis/StandardTokenABI';
import { StandardTokenBytecode } from '../../../src/wallet/bytecode/StandardTokenBytecode';

export const estimateDeploymentGas = async (
  deploymentConfig: DeploymentConfig
): Promise<GasEstimate> => {
  try {
    const publicClient = await getNetworkClient(deploymentConfig.network);
    
    if (!publicClient) {
      throw new Error(`Could not connect to network ${deploymentConfig.network}`);
    }
    
    // Determine chain based on network name
    let chain;
    switch(deploymentConfig.network.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        chain = mainnet;
        break;
      case 'holesky':
        chain = holesky;
        break;
      case 'sepolia':
        chain = sepolia;
        break;
      default:
        chain = mainnet;
    }
    
    const walletClient = await getWalletClient();
    
    if (!walletClient) {
      throw new Error('No wallet connected');
    }

    const factory = new ethers.ContractFactory(StandardTokenABI, StandardTokenBytecode as string);
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
        deploymentConfig.maxTransactionLimit ? parseEther(deploymentConfig.maxTransactionLimit) : BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        deploymentConfig.maxWalletLimit ? parseEther(deploymentConfig.maxWalletLimit) : BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        deploymentConfig.maxSupply ? parseEther(deploymentConfig.maxSupply) : BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        deploymentConfig.lockupTime || '0'
      );
    }
    
    const deploymentData = factory.interface.encodeDeploy(constructorArgs);
    
    // Estimate gas usage
    const gasEstimate = await publicClient.estimateGas({
      data: deploymentData as `0x${string}`,
      account: walletClient.account.address
    });

    // Get gas prices
    const feeData = await publicClient.estimateFeesPerGas();
    if (!feeData?.maxFeePerGas) throw new Error("Could not get gas price");

    // Calculate total cost
    const totalCost = BigInt(gasEstimate) * feeData.maxFeePerGas;

    return {
      success: true,
      estimatedGas: Number(gasEstimate),
      gasPrice: feeData.maxFeePerGas,
      totalCostEth: ethers.formatEther(totalCost.toString())
    };

  } catch (error: unknown) {
    console.error('Gas estimation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gas estimation failed'
    };
  }
};
