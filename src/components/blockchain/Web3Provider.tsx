import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  sendTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum Mainnet', rpc: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID' },
  137: { name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  56: { name: 'BSC', rpc: 'https://bsc-dataseed.binance.org' },
  42161: { name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
  10: { name: 'Optimism', rpc: 'https://mainnet.optimism.io' },
};

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // Initialize provider
  useEffect(() => {
    if (isMetaMaskAvailable()) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setIsConnected(false);
        toast.info('Wallet getrennt');
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
        toast.success('Wallet verbunden');
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      
      if (!Object.keys(SUPPORTED_NETWORKS).includes(newChainId.toString())) {
        toast.warning('Netzwerk nicht unterstützt. Bitte wechseln Sie zu einem unterstützten Netzwerk.');
      }
    };

    // Listen for events
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider]);

  // Connect wallet
  const connect = async () => {
    if (!provider) {
      toast.error('MetaMask nicht verfügbar');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setSigner(signer);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        
        toast.success('Wallet erfolgreich verbunden!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Fehler beim Verbinden der Wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    toast.info('Wallet getrennt');
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!provider) return;

    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      toast.success(`Netzwerk gewechselt zu ${SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]?.name}`);
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]?.name,
              rpcUrls: [SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]?.rpc],
            }],
          });
        } catch (addError) {
          toast.error('Netzwerk konnte nicht hinzugefügt werden');
        }
      } else {
        toast.error('Netzwerk konnte nicht gewechselt werden');
      }
    }
  };

  // Send transaction
  const sendTransaction = async (transaction: any) => {
    if (!signer) {
      throw new Error('Wallet nicht verbunden');
    }

    try {
      const tx = await signer.sendTransaction(transaction);
      toast.success('Transaktion gesendet!');
      return tx;
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Fehler beim Senden der Transaktion');
      throw error;
    }
  };

  // Sign message
  const signMessage = async (message: string) => {
    if (!signer) {
      throw new Error('Wallet nicht verbunden');
    }

    try {
      const signature = await signer.signMessage(message);
      toast.success('Nachricht signiert!');
      return signature;
    } catch (error) {
      console.error('Signing error:', error);
      toast.error('Fehler beim Signieren der Nachricht');
      throw error;
    }
  };

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    sendTransaction,
    signMessage,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 