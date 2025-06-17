
import { ethers } from 'ethers';
import { TokenDeploymentService } from './token/TokenDeploymentService';
import { GasEstimationService } from './token/GasEstimationService';
import { TokenManagementService } from './token/TokenManagementService';
import { GasEstimate } from './contracts/types';
import { TokenVerificationService } from './verification/verificationService';

// Export GasEstimationResult type as an alias for GasEstimate
export type GasEstimationResult = GasEstimate;

export const estimateDeploymentGas = GasEstimationService.estimateDeploymentGas;
export const deployToken = (config: TokenDeploymentConfig) => TokenDeploymentService.deployToken(config);
export const verifyContract = (contractAddress: string, network: string, constructorArgs: unknown[]) => {
  return TokenVerificationService.submitVerificationRequest({
    contractAddress,
    network,
    constructorArgs
  });
};
export const getTokenContract = TokenManagementService.getTokenContract;
export const pauseToken = TokenManagementService.pause;
export const unpauseToken = TokenManagementService.unpause;
export const mintTokens = TokenManagementService.mint;
export const burnTokens = TokenManagementService.burn;
