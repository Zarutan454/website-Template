import { ethers } from 'ethers';
import { TokenABI } from '@/contracts/abi/TokenABI';
import { TokenBytecode } from '@/contracts/bytecode/TokenBytecode';

export class GasEstimationService {
  static async estimateDeploymentGas(
    name: string,
    symbol: string,
    initialSupply: string,
    ownerAddress: string,
    provider: ethers.Provider
  ): Promise<string> {
    try {
      const factory = new ethers.ContractFactory(TokenABI, TokenBytecode);
      const deployTx = await factory.getDeployTransaction(
        name,
        symbol,
        ethers.parseUnits(initialSupply, 18),
        ownerAddress
      );

      const gasEstimate = await provider.estimateGas({
        data: deployTx.data,
        from: ownerAddress,
        to: null // This is a contract deployment, so 'to' should be null
      });
      return ethers.formatEther(gasEstimate);
    } catch (error) {
      console.error('Error estimating deployment gas:', error);
      throw error;
    }
  }

  static async estimateMintGas(
    token: ethers.Contract,
    to: string,
    amount: string
  ): Promise<string> {
    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      const gasEstimate = await token.mint.estimateGas(to, parsedAmount);
      return ethers.formatEther(gasEstimate);
    } catch (error) {
      console.error('Error estimating mint gas:', error);
      throw error;
    }
  }

  static async estimateBurnGas(
    token: ethers.Contract,
    amount: string
  ): Promise<string> {
    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      const gasEstimate = await token.burn.estimateGas(parsedAmount);
      return ethers.formatEther(gasEstimate);
    } catch (error) {
      console.error('Error estimating burn gas:', error);
      throw error;
    }
  }
}