import { ethers } from 'ethers';
import { TokenABI } from '@/contracts/abi/TokenABI';
import axios from 'axios';

export class TokenDeploymentService {
  static async deployToken(
    name: string,
    symbol: string,
    initialSupply: string,
    ownerAddress: string,
    signer: ethers.Signer
  ): Promise<{ success: boolean; contractAddress?: string; error?: string }> {
    try {
      const factory = new ethers.ContractFactory(TokenABI, '', signer);
      const contract = await factory.deploy(
        name,
        symbol,
        ethers.parseUnits(initialSupply, 18),
        ownerAddress
      );
      
      await contract.waitForDeployment();
      const contractAddress = await contract.getAddress();

      // Update token status in database
      const { data: user } = await axios.get('/api/auth/user/').then(res => res.data);
      if (user) {
        await axios.post('/api/token/deploy/', {
          creator_id: user.id,
          name: name,
          symbol: symbol,
          status: 'deployed',
          contract_address: contractAddress
        });
      }

      return {
        success: true,
        contractAddress
      };
    } catch (error: any) {
      console.error('Token deployment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
