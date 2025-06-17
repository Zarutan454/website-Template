import { supabase } from '@/integrations/supabase/client';
import { VerificationStatus } from './types';

export const updateVerificationStatus = async (
  tokenId: string,
  network: string,
  status: string,
  explorerUrl?: string
): Promise<void> => {
  const { error } = await supabase
    .from('token_verification_status')
    .upsert({
      token_id: tokenId,
      verification_status: status,
      verification_date: new Date().toISOString(),
      explorer_url: explorerUrl
    });

  if (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
};

export const getVerificationStatus = async (
  contractAddress: string
): Promise<VerificationStatus> => {
  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('id')
      .eq('contract_address', contractAddress)
      .maybeSingle();

    if (tokenError) throw tokenError;
    if (!tokenData) throw new Error('Token not found');

    const { data, error } = await supabase
      .from('token_verification_status')
      .select('*')
      .eq('token_id', tokenData.id)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      status: data?.verification_status || 'unverified',
      explorerUrl: data?.explorer_url
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};