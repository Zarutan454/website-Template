export const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || '';
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || '';
export const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || '';

export const DEPLOYER_PRIVATE_KEY = import.meta.env.VITE_DEPLOYER_PRIVATE_KEY || '';

export const ETHEREUM_RPC_URL = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
export const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
export const ARBITRUM_RPC_URL = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';
export const POLYGON_RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

export const config = {
  django_api_url: import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000',
};
