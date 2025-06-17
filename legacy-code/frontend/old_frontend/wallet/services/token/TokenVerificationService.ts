import { supabase } from '@/integrations/supabase/client';
import { ethers } from 'ethers';

export class TokenVerificationService {
  static async verifyContract(
    contractAddress: string,
    network: string,
    constructorArgs: any[],
    contractName: string = 'CustomToken'
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data: tokenData } = await supabase
        .from('tokens')
        .select('id, creator_id')
        .eq('contract_address', contractAddress)
        .single();

      if (!tokenData) throw new Error('Token not found');
      if (tokenData.creator_id !== user.id) {
        throw new Error('Unauthorized: You do not own this token');
      }

      const { data, error } = await supabase.functions.invoke('verify-contract', {
        body: {
          contractAddress,
          network,
          constructorArgs,
          contractName
        }
      });

      if (error) throw error;

      if (data.success) {
        await supabase
          .from('token_verification_status')
          .upsert({
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data: tokenData } = await supabase
        .from('tokens')
        .select('id')
        .eq('contract_address', contractAddress)
        .single();

      if (!tokenData) throw new Error('Token not found');

      const { data } = await supabase
        .from('token_verification_status')
        .select('*')
        .eq('token_id', tokenData.id)
        .single();

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