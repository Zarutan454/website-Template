import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { VerificationStatus } from './types';

export const verifyContract = async (
  contractAddress: string,
  network: string,
  constructorArgs: string[]
): Promise<{ success: boolean; guid?: string; error?: string }> => {
  try {
    // Get the current user
    const { data: user, error: authError } = await axios.get('/api/auth/user/').then(res => res.data);
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    // Get token ID from contract address
    const { data: tokenData, error: tokenError } = await axios.get('/api/token/verify/').then(res => res.data);
    if (tokenError) throw tokenError;
    if (!tokenData) throw new Error('Token not found');

    // Update verification status to pending
    const { data: updateResult, error: updateError } = await axios.post('/api/token/update/', {
      token_id: tokenData.id,
      verification_status: 'pending',
      verification_date: new Date().toISOString()
    }).then(res => res.data);

    if (updateError) throw updateError;

    // Call verify-contract edge function
    const payload: Record<string, unknown> = {
      contractAddress,
      network,
      constructorArgs: constructorArgs.join(','),
      contractName: 'Token',
      compilerVersion: 'v0.8.20+commit.a1b79de6'
    };
    const { data, error } = await axios.post('/api/token/verify-contract/', payload).then(res => res.data);

    if (error) throw error;

    if (data.success) {
      toast({
        title: "Verifizierung gestartet",
        description: "Der Contract wird nun verifiziert. Dies kann einige Minuten dauern.",
      });

      // Start polling for verification status
      startVerificationStatusPolling(contractAddress);

      return { success: true, guid: data.guid };
    } else {
      throw new Error(data.error || 'Verification failed');
    }
  } catch (error) {
    console.error('Error verifying contract:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    toast({
      title: "Fehler bei der Verifizierung",
      description: errorMessage,
      variant: "destructive",
    });

    return { success: false, error: errorMessage };
  }
};

const startVerificationStatusPolling = (contractAddress: string) => {
  const pollInterval = setInterval(async () => {
    const status = await checkVerificationStatus(contractAddress);
    
    if (status.status === 'verified') {
      clearInterval(pollInterval);
      toast({
        title: "Verifizierung erfolgreich",
        description: "Der Contract wurde erfolgreich verifiziert.",
      });
    } else if (status.status === 'failed') {
      clearInterval(pollInterval);
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: "Die Contract-Verifizierung ist fehlgeschlagen.",
        variant: "destructive",
      });
    }
  }, 10000); // Poll every 10 seconds

  // Clear interval after 5 minutes to prevent infinite polling
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 300000);
};

export const checkVerificationStatus = async (
  contractAddress: string
): Promise<VerificationStatus> => {
  try {
    // Get token ID from contract address
    const { data: tokenData, error: tokenError } = await axios.get('/api/token/verify/').then(res => res.data);

    if (tokenError) throw tokenError;
    if (!tokenData) throw new Error('Token not found');

    // Get verification status
    const { data, error } = await axios.get('/api/token/verification-status/', {
      params: {
        token_id: tokenData.id
      }
    }).then(res => res.data);

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
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
