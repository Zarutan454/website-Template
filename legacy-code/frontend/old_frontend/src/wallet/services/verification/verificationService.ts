import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { VerificationStatus, VerificationRequest } from './types';

// Export the service as a named export with functions
export const TokenVerificationService = {
  /**
   * Checks the verification status of a contract
   */
  async checkVerificationStatus(contractAddress: string): Promise<VerificationStatus> {
    try {
      // Get the token associated with this contract address
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('id, network')
        .eq('contract_address', contractAddress)
        .maybeSingle();
      
      if (tokenError) throw tokenError;
      if (!tokenData) {
        return { 
          success: false, 
          error: 'Token not found' 
        };
      }
      
      const tokenId = (tokenData as { id: string }).id;
      const network = (tokenData as { network: string }).network;
      
      // Get the verification status for this token
      const { data, error } = await supabase
        .from('token_verification_status')
        .select('*')
        .eq('token_id', tokenId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If we have verification data, return it
      if (data) {
        const explorerUrl = (data as any).explorer_url || 
          `${getExplorerUrl(network)}/address/${contractAddress}#code`;
        
        return {
          success: true,
          status: (data as any).verification_status as 'unverified' | 'pending' | 'verified',
          explorerUrl
        };
      }
      
      // Otherwise, return unverified status
      return {
        success: true,
        status: 'unverified',
        explorerUrl: `${getExplorerUrl(network)}/address/${contractAddress}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Submits a contract for verification to the blockchain explorer
   */
  async submitVerificationRequest(params: {
    contractAddress: string;
    network: string;
    constructorArgs: any[];
  }): Promise<VerificationStatus> {
    try {
      const { contractAddress, network, constructorArgs } = params;
      
      // Get the token ID from the contract address
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('id')
        .eq('contract_address', contractAddress)
        .maybeSingle();
      
      if (tokenError) throw tokenError;
      if (!tokenData) {
        return { success: false, error: 'Token not found' };
      }
      
      const tokenId = (tokenData as any).id as string;
      
      // Update token verification status to pending
      const { error } = await supabase
        .from('token_verification_status')
        .upsert({
          token_id: tokenId,
          verification_status: 'pending',
          constructor_args: JSON.stringify(constructorArgs),
          compiler_version: 'v0.8.24+commit.e11b9ed9',
          verification_attempts: 1,
          explorer_url: `${getExplorerUrl(network)}/address/${contractAddress}#code`,
          last_error: null
        }, {
          onConflict: 'token_id'
        });
      
      if (error) throw error;
      
      // Simulate verification process
      // In a real implementation, we would call the explorer's API
      setTimeout(async () => {
        // 80% chance of successful verification for testing
        const success = Math.random() < 0.8;
        
        try {
          await supabase
            .from('token_verification_status')
            .update({
              verification_status: success ? 'verified' : 'unverified',
              verification_date: success ? new Date().toISOString() : null,
              last_error: success ? null : 'Verification failed on explorer'
            })
            .eq('token_id', tokenId);
        } catch (error) {
          console.error('Error updating verification status:', error);
        }
      }, 5000);
      
      return {
        success: true,
        status: 'pending',
        explorerUrl: `${getExplorerUrl(network)}/address/${contractAddress}#code`
      };
    } catch (error) {
      console.error('Error submitting verification request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Helper function to get explorer URL for a given network
export const getFullExplorerUrl = (network: string, type: 'transaction' | 'address', hash: string): string => {
  const baseUrl = getExplorerUrl(network);
  const path = type === 'transaction' ? 'tx' : 'address';
  return `${baseUrl}/${path}/${hash}`;
};

// Import explorer utilities
export const getExplorerUrl = (network: string): string => {
  switch (network.toLowerCase()) {
    case 'ethereum':
      return 'https://etherscan.io';
    case 'goerli':
      return 'https://goerli.etherscan.io';
    case 'sepolia':
      return 'https://sepolia.etherscan.io';
    case 'polygon':
      return 'https://polygonscan.com';
    case 'mumbai':
      return 'https://mumbai.polygonscan.com';
    case 'bnb':
    case 'binance':
      return 'https://bscscan.com';
    case 'bnb-testnet':
      return 'https://testnet.bscscan.com';
    case 'arbitrum':
      return 'https://arbiscan.io';
    case 'optimism':
      return 'https://optimistic.etherscan.io';
    case 'avalanche':
      return 'https://snowtrace.io';
    case 'fantom':
      return 'https://ftmscan.com';
    default:
      return 'https://etherscan.io';
  }
};
