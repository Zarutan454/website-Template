import axios from 'axios';
import { ethers } from 'ethers';

export class TokenVerificationService {
  static async verifyContract(
    contractAddress: string,
    network: string,
    constructorArgs: any[],
    contractName: string = 'CustomToken'
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data: user } = await axios.get('/api/auth/user/').then(res => res.data);
      if (!user) throw new Error('Authentication required');

      const { data: tokenData } = await axios.get('/api/token/verify/').then(res => res.data);

      if (!tokenData) throw new Error('Token not found');
      if (tokenData.creator_id !== user.id) {
        throw new Error('Unauthorized: You do not own this token');
      }

      const payload = {
        contractAddress,
        network,
        constructorArgs,
        contractName
      };

      const { data, error } = await axios.post('/api/token/verify-contract/', payload).then(res => res.data);

      if (error) throw error;

      if (data.success) {
        await axios.put('/api/token/verify/', {
          token_id: tokenData.id,
          verification_status: 'verified',
          verification_date: new Date().toISOString(),
          explorer_url: `${network === 'ethereum' ? 'https://etherscan.io' : 'https://holesky.etherscan.io'}/address/${contractAddress}#code`
        });

        return {
          success: true,
          message: 'Contract verified successfully'
        };
      }

      return {
        success: false,
        error: data.error || 'Verification failed'
      };
    } catch (error: any) {
      console.error('Contract verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async checkVerificationStatus(contractAddress: string): Promise<{
    success: boolean;
    status?: string;
    explorerUrl?: string;
    error?: string;
  }> {
    try {
      const { data: user } = await axios.get('/api/auth/user/').then(res => res.data);
      if (!user) throw new Error('Authentication required');

      const { data: tokenData } = await axios.get('/api/token/verify/').then(res => res.data);

      if (!tokenData) throw new Error('Token not found');

      const { data } = await axios.get('/api/token/verify-status/', {
        params: {
          token_id: tokenData.id
        }
      }).then(res => res.data);

      return {
        success: true,
        status: data?.verification_status || 'unverified',
        explorerUrl: data?.explorer_url
      };
    } catch (error: any) {
      console.error('Error checking verification status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
