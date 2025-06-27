
import { ethers } from 'ethers';
import { TokenContractInstance } from '../contracts/types';
import { StandardTokenABI } from '@/contracts/abi/TokenABI';
import { useSigner } from '@/hooks/useSigner';

export const TokenManagementService = {
  /**
   * Gibt eine Instanz des Token-Contracts zurück
   */
  getTokenContract: async (
    contractAddress: string,
    signer: ethers.Signer
  ): Promise<TokenContractInstance | null> => {
    try {
      // Erstelle eine Contract-Instanz
      const contract = new ethers.Contract(
        contractAddress,
        StandardTokenABI,
        signer
      );
      
      // Hole die Basis-Token-Informationen
      const name = await contract.name();
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      const totalSupply = await contract.totalSupply();
      
      return {
        address: contractAddress,
        abi: StandardTokenABI,
        contract,
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    } catch (error) {
      console.error('Error creating token contract instance:', error);
      return null;
    }
  },
  
  /**
   * Pausiert einen Token (wenn der Contract diese Funktion unterstützt)
   */
  pause: async (contract: ethers.Contract): Promise<boolean> => {
    try {
      const tx = await contract.pause();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error pausing token:', error);
      return false;
    }
  },
  
  /**
   * Hebt die Pausierung eines Tokens auf
   */
  unpause: async (contract: ethers.Contract): Promise<boolean> => {
    try {
      const tx = await contract.unpause();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error unpausing token:', error);
      return false;
    }
  },
  
  /**
   * Prägt neue Tokens (mint)
   */
  mint: async (
    contract: ethers.Contract,
    toAddress: string,
    amount: string,
    decimals: number = 18
  ): Promise<boolean> => {
    try {
      const amountWei = ethers.parseUnits(amount, decimals);
      const tx = await contract.mint(toAddress, amountWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error minting tokens:', error);
      return false;
    }
  },
  
  /**
   * Verbrennt Tokens (burn)
   */
  burn: async (
    contract: ethers.Contract,
    amount: string,
    decimals: number = 18
  ): Promise<boolean> => {
    try {
      const amountWei = ethers.parseUnits(amount, decimals);
      const tx = await contract.burn(amountWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error burning tokens:', error);
      return false;
    }
  }
};
