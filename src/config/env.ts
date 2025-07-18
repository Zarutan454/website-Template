// Environment Configuration for BSN Social Network
// Centralized API and WebSocket configuration

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

// WebSocket Configuration
export const WS_CONFIG = {
  django_api_url: import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000',
  BASE_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  FALLBACK_URL: 'ws://localhost:8000',
  ENDPOINTS: {
    CHAT: '/ws/chat/',
    FEED: '/ws/feed/',
    NOTIFICATIONS: '/ws/notifications/',
    MINING: '/ws/mining/',
    BLOCKCHAIN: '/ws/blockchain/',
    MESSAGING: '/ws/messaging/',
  }
};

// Media Configuration
export const MEDIA_CONFIG = {
  BASE_URL: import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8000',
  UPLOAD_URL: '/api/upload/media/',
  PROFILE_AVATARS: '/media/profile_avatars/',
  PROFILE_COVERS: '/media/profile_covers/',
  POSTS: '/media/posts/',
  STORIES: '/media/stories/',
};

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORKS: {
    ETHEREUM: {
      CHAIN_ID: 1,
      RPC_URL: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
      EXPLORER: 'https://etherscan.io',
    },
    POLYGON: {
      CHAIN_ID: 137,
      RPC_URL: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
      EXPLORER: 'https://polygonscan.com',
    },
    BSC: {
      CHAIN_ID: 56,
      RPC_URL: import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
      EXPLORER: 'https://bscscan.com',
    },
  },
  CONTRACTS: {
    BSN_TOKEN: import.meta.env.VITE_BSN_TOKEN_CONTRACT || '0x1234567890123456789012345678901234567890',
    BSN_NFT: import.meta.env.VITE_BSN_NFT_CONTRACT || '0x1234567890123456789012345678901234567890',
    BSN_STAKING: import.meta.env.VITE_BSN_STAKING_CONTRACT || '0x1234567890123456789012345678901234567890',
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  MINING_ENABLED: import.meta.env.VITE_MINING_ENABLED === 'true',
  NFT_ENABLED: import.meta.env.VITE_NFT_ENABLED === 'true',
  DAO_ENABLED: import.meta.env.VITE_DAO_ENABLED === 'true',
  ICO_ENABLED: import.meta.env.VITE_ICO_ENABLED === 'true',
  STORIES_ENABLED: import.meta.env.VITE_STORIES_ENABLED === 'true',
  REELS_ENABLED: import.meta.env.VITE_REELS_ENABLED === 'true',
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG: import.meta.env.DEV,
  API_TIMEOUT: 30000, // 30 seconds
  WS_RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RETRIES: 3,
};

// Export all configurations
export default {
  API_BASE_URL,
  DJANGO_API_URL,
  WS_CONFIG,
  MEDIA_CONFIG,
  BLOCKCHAIN_CONFIG,
  FEATURE_FLAGS,
  DEV_CONFIG,
};
