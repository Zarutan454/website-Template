import { ethers } from 'ethers';
import { TokenABI } from '@/contracts/abi/TokenABI';
import { CustomToken } from '@/types/token';

export class TokenManagementService {
  static async getTokenContract(
    tokenAddress: string,
    signer: ethers.Signer
  ): Promise<CustomToken> {
    return new ethers.Contract(
      tokenAddress,
      TokenABI,
      signer
    ) as unknown as CustomToken;
  }

  static async pause(token: CustomToken): Promise<boolean> {
    try {
      const tx = await token.pause();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error pausing token:', error);
      return false;
    }
  }

  static async unpause(token: CustomToken): Promise<boolean> {
    try {
      const tx = await token.unpause();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error unpausing token:', error);
      return false;
    }
  }

  static async mint(
    token: CustomToken,
    to: string,
    amount: string
  ): Promise<boolean> {
    try {
      const parsedAmount = ethers.parseUnits(amount, 18).toString();
      const tx = await token.mint(to, parsedAmount);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error minting tokens:', error);
      return false;
    }
  }

  static async burn(token: CustomToken, amount: string): Promise<boolean> {
    try {
      const parsedAmount = ethers.parseUnits(amount, 18).toString();
      const tx = await token.burn(parsedAmount);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error burning tokens:', error);
      return false;
    }
  }
}
