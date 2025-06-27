import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, arbitrum, polygon } from 'viem/chains';
import type { PublicClient } from 'viem';
import { INFURA_API_KEY, ALCHEMY_API_KEY } from '@/config/env';

/**
 * Get a network client for the specified network
 * @param networkName The name of the network to connect to
 * @returns A public client for the specified network
 */
export const getNetworkClient = async (networkName: string): Promise<PublicClient> => {
  let chain;
  switch(networkName.toLowerCase()) {
    case 'ethereum':
    case 'mainnet':
      chain = mainnet;
      break;
    case 'sepolia':
      chain = sepolia;
      break;
    case 'arbitrum':
      chain = arbitrum;
      break;
    case 'polygon':
      chain = polygon;
      break;
    default:
      chain = sepolia; // Default to testnet
  }
  
  let rpcUrl = '';
  const infuraKey = INFURA_API_KEY || '';
  const alchemyKey = ALCHEMY_API_KEY || '';
  
  if (infuraKey) {
    switch(networkName.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
        break;
      case 'sepolia':
        rpcUrl = `https://sepolia.infura.io/v3/${infuraKey}`;
        break;
      case 'arbitrum':
        rpcUrl = `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`;
        break;
      case 'polygon':
        rpcUrl = `https://polygon-mainnet.infura.io/v3/${infuraKey}`;
        break;
      default:
        rpcUrl = `https://sepolia.infura.io/v3/${infuraKey}`;
    }
  } else if (alchemyKey) {
    switch(networkName.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
        break;
      case 'sepolia':
        rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`;
        break;
      case 'arbitrum':
        rpcUrl = `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`;
        break;
      case 'polygon':
        rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`;
        break;
      default:
        rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`;
    }
  } else {
    switch(networkName.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        rpcUrl = 'https://eth.llamarpc.com';
        break;
      case 'sepolia':
        rpcUrl = 'https://rpc.sepolia.org';
        break;
      case 'arbitrum':
        rpcUrl = 'https://arb1.arbitrum.io/rpc';
        break;
      case 'polygon':
        rpcUrl = 'https://polygon-rpc.com';
        break;
      default:
        rpcUrl = 'https://rpc.sepolia.org';
    }
  }
  
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl)
  });
  
  return publicClient;
};
