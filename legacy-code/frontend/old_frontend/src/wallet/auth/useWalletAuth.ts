
import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginWithWallet } from './WalletAuthService';

/**
 * Hook zur Verwaltung der Wallet-Authentifizierung
 */
export const useWalletAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();

  /**
   * Funktion zum Anmelden mit der Wallet
   */
  const handleWalletLogin = useCallback(async (redirectPath: string = '/feed') => {
    if (!isConnected || !address || !walletClient) {
      toast.error('Wallet muss verbunden sein, bevor Sie sich anmelden können');
      return false;
    }

    try {
      setIsAuthenticating(true);
      const success = await loginWithWallet(address, walletClient);
      
      if (success) {
        // Navigiere zur Zielseite nach erfolgreicher Anmeldung
        navigate(redirectPath, { replace: true });
        return true;
      }
      
      return false;
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error(`Authentifizierungsfehler: ${errorMessage}`);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, walletClient, navigate]);

  return {
    isAuthenticating,
    isWalletConnected: isConnected && !!address,
    walletAddress: address,
    handleWalletLogin
  };
};
