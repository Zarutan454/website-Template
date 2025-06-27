import axios from 'axios';
import { VerificationStatus } from './types';

export const updateVerificationStatus = async (
  tokenId: string,
  network: string,
  status: string,
  explorerUrl?: string
): Promise<void> => {
  const dbData = {
    token_id: tokenId,
    verification_status: status,
    verification_date: new Date().toISOString(),
    explorer_url: explorerUrl
  };

  const { data, error } = await axios.post('/api/token/database/', dbData).then(res => res.data);

  if (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
};

export const getVerificationStatus = async (
  contractAddress: string
): Promise<VerificationStatus> => {
  try {
    const { data: tokenData, error: tokenError } = await axios.get('/api/token/verify/').then(res => res.data);

    if (tokenError) throw tokenError;
    if (!tokenData) throw new Error('Token not found');

    const { data, error } = await axios.get('/api/token/database/', { params: { token_id: tokenData.id } }).then(res => res.data);

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
