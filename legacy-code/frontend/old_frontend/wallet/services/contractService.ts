import { ethers } from 'ethers';
import { TokenDeploymentService } from './token/TokenDeploymentService';
import { GasEstimationService } from './token/GasEstimationService';
import { TokenVerificationService } from './token/TokenVerificationService';
import { TokenManagementService } from './token/TokenManagementService';

export const estimateDeploymentGas = GasEstimationService.estimateDeploymentGas;
export const deployToken = TokenDeploymentService.deployToken;
export const verifyContract = TokenVerificationService.verifyContract;
export const getTokenContract = TokenManagementService.getTokenContract;
export const pauseToken = TokenManagementService.pause;
export const unpauseToken = TokenManagementService.unpause;
export const mintTokens = TokenManagementService.mint;
export const burnTokens = TokenManagementService.burn;