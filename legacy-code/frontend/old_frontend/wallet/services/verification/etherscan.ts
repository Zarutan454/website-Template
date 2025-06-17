import { supabase } from '@/integrations/supabase/client';
import { VerificationRequest, VerificationResponse } from './types';

export const verifyContractOnEtherscan = async (
  request: VerificationRequest
): Promise<VerificationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-contract', {
      body: request
    });

    if (error) throw error;

    return {
      success: data.success,
      guid: data.guid,
      error: data.error
    };
  } catch (error) {
    console.error('Etherscan verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
};