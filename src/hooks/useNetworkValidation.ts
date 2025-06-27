
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useConfig, useAccount, useSwitchChain } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { getChainId } from '@/utils/blockchain';

export type NetworkValidationResult = {
  isValid: boolean;
  error?: string;
  requiredChainId?: number;
}

export const getChainIdByNetwork = (network: string): number | undefined => {
  const networkMappings: Record<string, number> = {
    'ethereum': 1,
    'mainnet': 1,
    'holesky': 17000,
    'polygon': 137,
    'matic': 137,
    'binance': 56,
    'bsc': 56,
    'optimism': 10,
    'arbitrum': 42161,
    'avalanche': 43114,
    'avax': 43114,
    'fantom': 250,
    'ftm': 250,
    'sepolia': 11155111
  };
  
  return networkMappings[network.toLowerCase()];
};

export const validateAndSwitchNetwork = async (
  targetNetwork: string
): Promise<NetworkValidationResult> => {
  try {
    const targetChainId = getChainIdByNetwork(targetNetwork);
    
    if (!targetChainId) {
      return {
        isValid: false,
        error: `Unbekanntes Netzwerk: ${targetNetwork}`
      };
    }
    
    // In a real app, we would switch networks here
    // This is a simplified version
    
    return {
      isValid: true,
      requiredChainId: targetChainId
    };
  } catch (error) {
    console.error('Network validation error:', error);
    return {
      isValid: false, 
      error: 'Netzwerkwechsel fehlgeschlagen.'
    };
  }
};

export const useNetworkValidation = () => {
  const config = useConfig();
  const { chain } = useAccount();
  const { switchChain, isPending: isLoading, error } = useSwitchChain();
  const publicClient = usePublicClient();
  
  const [validationState, setValidationState] = useState<NetworkValidationResult>({
    isValid: true
  });
  
  const validateNetwork = useCallback(async (targetNetwork: string): Promise<boolean> => {
    const targetChainId = getChainIdByNetwork(targetNetwork);
    
    if (!targetChainId) {
      setValidationState({
        isValid: false,
        error: `Unbekanntes Netzwerk: ${targetNetwork}`
      });
      toast.error(`Unbekanntes Netzwerk: ${targetNetwork}`);
      return false;
    }
    
    // Check if user is already on the correct network
    if (chain && chain.id === targetChainId) {
      setValidationState({ isValid: true });
      return true;
    }
    
    if (!switchChain) {
      setValidationState({
        isValid: false, 
        error: 'Wallet unterstützt keinen Netzwerkwechsel.',
        requiredChainId: targetChainId
      });
      toast.error('Wallet unterstützt keinen Netzwerkwechsel. Bitte manuell zu ' + targetNetwork + ' wechseln.');
      return false;
    }
    
    try {
      toast.info(`Wechsle zu ${targetNetwork} Netzwerk...`);
      switchChain({ chainId: targetChainId });
      
      // We'll return true here and let the wallet handle the switch
      // In a real app, we would wait for the switch to complete
      setValidationState({ 
        isValid: true,
        requiredChainId: targetChainId
      });
      return true;
    } catch (switchError) {
      console.error('Network switch error:', switchError);
      setValidationState({
        isValid: false, 
        error: 'Netzwerkwechsel fehlgeschlagen.',
        requiredChainId: targetChainId
      });
      toast.error('Netzwerkwechsel fehlgeschlagen. Bitte manuell zu ' + targetNetwork + ' wechseln.');
      return false;
    }
  }, [chain, switchChain]);
  
  return {
    validationState,
    validateNetwork,
    isSwitchingNetwork: isLoading,
    switchError: error
  };
};
