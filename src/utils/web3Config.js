import { ethers } from 'ethers';

// Chain IDs für verschiedene Netzwerke
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BSC: 56,
  SOLANA: 101, // Phantom Wallet
  POLYGON_TESTNET: 80001,
  BSC_TESTNET: 97,
  ETHEREUM_TESTNET: 5, // Goerli
};

// Netzwerk-Konfigurationen
export const NETWORKS = {
  [CHAIN_IDS.ETHEREUM]: {
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [CHAIN_IDS.POLYGON]: {
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [CHAIN_IDS.BSC]: {
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [CHAIN_IDS.POLYGON_TESTNET]: {
    name: 'Polygon Mumbai',
    symbol: 'MATIC',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [CHAIN_IDS.BSC_TESTNET]: {
    name: 'BSC Testnet',
    symbol: 'tBNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
  },
  [CHAIN_IDS.ETHEREUM_TESTNET]: {
    name: 'Ethereum Goerli',
    symbol: 'ETH',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

// MetaMask Provider Setup
export const getMetaMaskProvider = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask ist nicht installiert!');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    return provider;
  } catch (error) {
    console.error('Fehler beim Verbinden mit MetaMask:', error);
    throw error;
  }
};

// Network wechseln
export const switchNetwork = async (chainId) => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask ist nicht installiert!');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        const network = NETWORKS[chainId];
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorer],
            },
          ],
        });
      } catch (addError) {
        throw new Error(`Netzwerk konnte nicht hinzugefügt werden: ${addError.message}`);
      }
    } else {
      throw switchError;
    }
  }
};

// Aktuelles Netzwerk abrufen
export const getCurrentNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const networkId = parseInt(chainId, 16);
    return NETWORKS[networkId] || null;
  } catch (error) {
    console.error('Fehler beim Abrufen des aktuellen Netzwerks:', error);
    return null;
  }
};

// Wallet-Adresse abrufen
export const getWalletAddress = async () => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Fehler beim Abrufen der Wallet-Adresse:', error);
    return null;
  }
};

// Wallet-Balance abrufen
export const getWalletBalance = async (address, chainId = CHAIN_IDS.ETHEREUM) => {
  if (!address) return '0';

  try {
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS[chainId].rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Fehler beim Abrufen des Wallet-Balances:', error);
    return '0';
  }
};

// Event Listeners für MetaMask
export const setupMetaMaskListeners = (onAccountChange, onNetworkChange) => {
  if (typeof window.ethereum === 'undefined') {
    return;
  }

  // Account change listener
  window.ethereum.on('accountsChanged', (accounts) => {
    if (onAccountChange) {
      onAccountChange(accounts[0] || null);
    }
  });

  // Network change listener
  window.ethereum.on('chainChanged', (chainId) => {
    if (onNetworkChange) {
      const networkId = parseInt(chainId, 16);
      onNetworkChange(NETWORKS[networkId] || null);
    }
  });

  // Disconnect listener
  window.ethereum.on('disconnect', () => {
    if (onAccountChange) {
      onAccountChange(null);
    }
  });
};

// Cleanup listeners
export const cleanupMetaMaskListeners = () => {
  if (typeof window.ethereum === 'undefined') {
    return;
  }

  window.ethereum.removeAllListeners();
}; 