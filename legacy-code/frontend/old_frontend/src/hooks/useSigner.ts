
import { useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

export function useSigner() {
  const { data: walletClient } = useWalletClient();

  return useCallback(async () => {
    if (!walletClient) return null;

    try {
      // Create an Ethers provider that works with the walletClient's transport
      const provider = new BrowserProvider(walletClient.transport as unknown);
      // Get the signer from the provider
      return provider.getSigner();
    } catch (error) {
      console.error("Error getting signer:", error);
      return null;
    }
  }, [walletClient]);
}
