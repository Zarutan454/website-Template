import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, arbitrum, polygon } from 'viem/chains';
import type { PublicClient } from 'viem';
import { BLOCKCHAIN_CONFIG } from '../../config/env';

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
  
  // Use blockchain config for RPC URLs
  switch(networkName.toLowerCase()) {
    case 'ethereum':
    case 'mainnet':
      rpcUrl = BLOCKCHAIN_CONFIG.NETWORKS.ETHEREUM.RPC_URL;
      break;
    case 'polygon':
      rpcUrl = BLOCKCHAIN_CONFIG.NETWORKS.POLYGON.RPC_URL;
      break;
    case 'bsc':
      rpcUrl = BLOCKCHAIN_CONFIG.NETWORKS.BSC.RPC_URL;
      break;
    default:
      rpcUrl = 'https://rpc.sepolia.org'; // Default to testnet
  }
  
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl)
  });
  
  return publicClient;
};
