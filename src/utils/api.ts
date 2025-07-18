import { API_BASE_URL } from '../config/env';

const API_BASE_URL_FINAL = API_BASE_URL;

// Utility function to handle avatar URLs correctly
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) return '';
  
  // Wenn die URL bereits absolut ist (mit http/https), verwende sie direkt
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // Wenn es eine relative URL ist, füge die API_BASE_URL hinzu
  return `${API_BASE_URL_FINAL}${avatarUrl}`;
};

// Centralized API utility functions
export const api = {
  // Base configuration
  baseURL: API_BASE_URL_FINAL,
  
  // Request headers
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  }),

  // Generic request method
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL_FINAL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // GET request
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },

  // POST request
  async post(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  async put(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // PATCH request
  async patch(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Export for backward compatibility
export default api;

// Token API
export const tokenAPI = {
  createTokenReservation: async (data: {
    wallet_address: string;
    amount_usd: number;
    network: string;
    payment_method: string;
  }) => {
    const response = await api.post('/token/reservations/', data);
    return response.data;
  },

  getTokenReservations: async () => {
    const response = await api.get('/token/reservations/');
    return response.data;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};

// ICO API
export const icoAPI = {
  getIcoOverview: async () => {
    const response = await api.get('/ico/overview/');
    return response.data;
  },

  getIcoPhases: async () => {
    const response = await api.get('/ico/phases/');
    return response.data;
  },

  getCurrentPhase: async () => {
    const response = await api.get('/ico/current-phase/');
    return response.data;
  },
};

// Wallet API
export const walletAPI = {
  getBalance: async () => {
    const response = await api.get('/wallet/balance/');
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/wallet/transactions/');
    return response.data;
  },

  sendTransaction: async (data: { to: string; amount: number }) => {
    const response = await api.post('/wallet/send/', data);
    return response.data;
  },
};

// Mining API
export const miningAPI = {
  getMiningStats: async () => {
    const response = await api.get('/mining/stats/');
    return response.data;
  },

  startMining: async () => {
    const response = await api.post('/mining/start/', {});
    return response.data;
  },

  stopMining: async () => {
    const response = await api.post('/mining/stop/', {});
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/mining/leaderboard/');
    return response.data;
  },
};

// Social API
export const socialAPI = {
  getFeed: async () => {
    const response = await api.get('/posts/');
    return response.data;
  },

  createPost: async (data: { content: string; image?: string }) => {
    const response = await api.post('/posts/', data);
    return response.data;
  },

  likePost: async (postId: number) => {
    const response = await api.post(`/posts/${postId}/like/`, {});
    return response.data;
  },

  togglePostLike: async (postId: string) => {
    try {
      // Verwende Django-API direkt für Like/Unlike
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No access token found');
        return { liked: false, like_count: 0 };
      }
      
      // Prüfe zuerst, ob der Post bereits geliked wurde
      const checkResponse = await api.get(`/posts/${postId}/`);
      const isCurrentlyLiked = checkResponse.data.is_liked_by_user || false;
      
      let response;
      if (isCurrentlyLiked) {
        // Unlike the post
        response = await api.delete(`/posts/${postId}/like/`);
      } else {
        // Like the post
        response = await api.post(`/posts/${postId}/like/`, {});
      }
      
      // Hole aktualisierte Post-Daten
      const updatedPostResponse = await api.get(`/posts/${postId}/`);
      const updatedPost = updatedPostResponse.data;
      
      return { 
        liked: updatedPost.is_liked_by_user || false,
        like_count: updatedPost.likes_count || 0
      };
    } catch (error) {
      console.error('Error in socialAPI.togglePostLike:', error);
      return { liked: false, like_count: 0 };
    }
  },

  getComments: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/comments/${commentId}/`);
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await api.delete(`/posts/${postId}/`);
    return response.data;
  },

  getTrendingPosts: async () => {
    const response = await api.get('/posts/trending/');
    return response.data;
  },

  getPopularPosts: async () => {
    const response = await api.get('/posts/popular/');
    return response.data;
  },

  searchPosts: async (query: string) => {
    const response = await api.get(`/posts/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getPosts: async (params?: { page?: number; limit?: number }) => {
    let url = '/posts/';
    if (params) {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      url += `?${query.toString()}`;
    }
    const response = await api.get(url);
    return response.data;
  },
};

// NFT API
export const nftAPI = {
  getNFTs: async () => {
    const response = await api.get('/nft/collection/');
    return response.data;
  },

  mintNFT: async (data: { name: string; description: string; image: string }) => {
    const response = await api.post('/nft/mint/', data);
    return response.data;
  },
};

// DAO API
export const daoAPI = {
  getProposals: async () => {
    const response = await api.get('/dao/proposals/');
    return response.data;
  },

  createProposal: async (data: { title: string; description: string; options: string[] }) => {
    const response = await api.post('/dao/proposals/', data);
    return response.data;
  },

  vote: async (proposalId: number, option: string) => {
    const response = await api.post(`/dao/proposals/${proposalId}/vote/`, { option });
    return response.data;
  },
};

// Faucet API
export const faucetAPI = {
  getFaucetStats: async () => {
    const response = await api.get('/faucet/stats/');
    return response.data;
  },

  createFaucetRequest: async (data: { wallet_address: string; amount: number }) => {
    const response = await api.post('/faucet/request/', data);
    return response.data;
  },
};

// Referral API
export const referralAPI = {
  getReferralStats: async () => {
    const response = await api.get('/referral/stats/');
    return response.data;
  },

  getReferralCode: async () => {
    const response = await api.get('/referral/code/');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getWalletDashboardData: async () => {
    const response = await api.get('/dashboard/wallet/');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/activity/');
    return response.data;
  },
};

// Export individual functions for backward compatibility
export const createTokenReservation = tokenAPI.createTokenReservation;
export const getTokenReservations = tokenAPI.getTokenReservations;
export const getToken = tokenAPI.getToken;
export const getIcoOverview = icoAPI.getIcoOverview;
export const getReferralStats = referralAPI.getReferralStats;
export const getFaucetStats = faucetAPI.getFaucetStats;
export const createFaucetRequest = faucetAPI.createFaucetRequest;
export const getWalletDashboardData = dashboardAPI.getWalletDashboardData;
export const getRecentActivity = dashboardAPI.getRecentActivity; 
