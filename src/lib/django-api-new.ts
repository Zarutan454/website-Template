// Zentrale API-Client-Schnittstelle für das Django-Backend (rekonstruiert nach API-Doku und Code-Imports)
// Alle Endpunkte: /api/

// BASE_URL dynamisch aus Umgebungsvariable oder Fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Hilfsfunktion für API-Requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Token aus localStorage holen
  const token = localStorage.getItem('access_token');
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  });
  
  // Authorization-Header hinzufügen, wenn Token vorhanden
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  
  // Handle CORS errors specifically
  if (response.status === 0) {
    throw new Error('CORS error: Unable to connect to server. Please check if the backend is running.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Versuche, eine spezifischere Fehlermeldung aus der Django-Antwort zu extrahieren
    const detail = error?.detail || error?.error || error?.message;
    if (typeof detail === 'object' && detail !== null) {
      // Wenn das Detail ein Objekt ist, versuche gängige Schlüssel zu finden
      const message = Object.values(detail).flat().join(' ');
      throw new Error(message || response.statusText);
    }
    throw new Error(detail || response.statusText);
  }
  
  // Wenn der Response-Body leer ist, gib null zurück, anstatt einen JSON-Parse-Fehler zu werfen
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Typen-Definitionen
export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  profile?: {
    display_name: string;
    bio: string;
    avatar_url: string;
    location: string;
    website: string;
    twitter_handle: string;
    github_handle: string;
    linkedin_handle: string;
    created_at: string;
    updated_at: string;
  };
  is_email_verified: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string;
}

export interface Post {
  id: number;
  content: string;
  author: UserProfile;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  media_urls?: string[];
  media_url?: string;
  media_type?: string;
  is_liked?: boolean;
  is_liked_by_user?: boolean;
  is_bookmarked?: boolean;
  is_bookmarked_by_user?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author: UserProfile;
  post: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_liked?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface SearchResult {
  id: number;
  type: 'user' | 'post' | 'comment';
  title: string;
  content: string;
  url: string;
  score: number;
}

export interface SearchFilters {
  query: string;
  type?: 'user' | 'post' | 'comment' | 'all';
  date_from?: string;
  date_to?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'user' | 'hashtag' | 'trending';
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

export interface RealTimeEvent {
  event_type: string;
  payload: unknown;
  user_id?: number;
  timestamp: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MiningStatus {
  is_active: boolean;
  current_session: number;
  total_mined: number;
  daily_limit: number;
  last_mine_time: string;
}

export interface CreatePostData {
  content: string;
  media_urls?: string[];
  is_public?: boolean;
}

export interface UpdatePostData {
  content?: string;
  media_urls?: string[];
  is_public?: boolean;
}

import { MiningStats } from '@/hooks/mining/types';

// Auth API
export const authAPI = {
  register: (data: Record<string, unknown>) => apiRequest('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) => apiRequest('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  refresh: (data: Record<string, unknown>) => apiRequest('/auth/refresh/', { method: 'POST', body: JSON.stringify(data) }),
  logout: (data: Record<string, unknown>) => apiRequest('/auth/logout/', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmail: (data: Record<string, unknown>) => apiRequest('/auth/verify-email/', { method: 'POST', body: JSON.stringify(data) }),
  resendVerification: (data: Record<string, unknown>) => apiRequest('/auth/resend-verification/', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: Record<string, unknown>) => apiRequest('/auth/password/reset/', { method: 'POST', body: JSON.stringify(data) }),
  confirmReset: (data: Record<string, unknown>) => apiRequest('/auth/password/reset/confirm/', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data: Record<string, unknown>) => apiRequest('/auth/password/change/', { method: 'POST', body: JSON.stringify(data) }),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('/auth/user/'),
  getProfileByUsername: (username: string) => apiRequest(`/auth/profile/${username}/`),
  updateProfile: (data: Record<string, unknown>) => apiRequest('/auth/user/', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadAvatar: (formData: FormData) => fetch(`${BASE_URL}/upload/media/`, { method: 'POST', body: formData, credentials: 'include' }).then(r => r.json()),
  uploadCover: (formData: FormData) => fetch(`${BASE_URL}/upload/media/`, { method: 'POST', body: formData, credentials: 'include' }).then(r => r.json()),
  deleteAccount: (data: Record<string, unknown>) => apiRequest('/auth/user/', { method: 'DELETE', body: JSON.stringify(data) }),
};

// Social API
export const socialAPI = {
  getFeed: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/posts/${query ? '?' + query : ''}`);
  },
  createPost: (data: CreatePostData) => apiRequest('/posts/', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: number, data: UpdatePostData) => apiRequest(`/posts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePost: (id: number) => apiRequest(`/posts/${id}/`, { method: 'DELETE' }),
  getPost: (id: string | number) => apiRequest(`/posts/${id}/`),
  likePost: (id: number) => apiRequest(`/posts/${id}/like/`, { method: 'POST' }),
  unlikePost: (id: number) => apiRequest(`/posts/${id}/unlike/`, { method: 'POST' }),
  togglePostLike: (id: number) => apiRequest(`/posts/${id}/toggle-like/`, { method: 'POST' }),
  sharePost: (id: number) => apiRequest(`/posts/${id}/share/`, { method: 'POST' }),
  getComments: (postId: string | number, params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/posts/${postId}/comments/${query ? '?' + query : ''}`);
  },
  createComment: (postId: string | number, data: Record<string, unknown>) => apiRequest(`/posts/${postId}/comments/create/`, { method: 'POST', body: JSON.stringify(data) }),
  deleteComment: (commentId: number) => apiRequest(`/comments/${commentId}/`, { method: 'DELETE' }),
  likeComment: (commentId: number) => apiRequest(`/comments/${commentId}/like/`, { method: 'POST' }),
  unlikeComment: (commentId: number) => apiRequest(`/comments/${commentId}/unlike/`, { method: 'POST' }),
  
  // Zusätzliche Feed-Endpunkte
  getPosts: (page: number = 1, limit: number = 20) => apiRequest(`/posts/?page=${page}&page_size=${limit}`),
  getTrendingPosts: () => apiRequest('/posts/?ordering=-likes_count'),
  searchPosts: (query: string) => apiRequest(`/posts/?search=${encodeURIComponent(query)}`),
};

// Group API
export const groupAPI = {
  getGroups: (tab: string = 'all') => apiRequest(`/groups/?tab=${tab}`),
  getGroupDetails: (groupId: string) => apiRequest(`/groups/${groupId}/`),
  createGroup: (formData: FormData) => fetch(`${BASE_URL}/groups/`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    credentials: 'include'
  }).then(r => r.json()),
  joinGroup: (groupId: string) => apiRequest(`/groups/${groupId}/join/`, { method: 'POST' }),
  leaveGroup: (groupId: string) => apiRequest(`/groups/${groupId}/leave/`, { method: 'POST' }),
  getGroupMembers: (groupId: string) => apiRequest(`/groups/${groupId}/members/`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/notifications/${query ? '?' + query : ''}`);
  },
  markAsRead: (id: number) => apiRequest(`/notifications/${id}/read/`, { method: 'POST' }),
  markAllAsRead: () => apiRequest('/notifications/mark-all-read/', { method: 'POST' }),
  deleteNotification: (id: number) => apiRequest(`/notifications/${id}/`, { method: 'DELETE' }),
};

// Global cache for follow stats - more aggressive caching
const globalFollowStatsCache = new Map<number, { data: { followers_count: number; following_count: number }; timestamp: number }>();
const GLOBAL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - very long cache

// User Relationship API
export const userRelationshipAPI = {
  // Follow/Unfollow operations
  followUser: (userId: number) => apiRequest('/follow/', { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  unfollowUser: (userId: number) => apiRequest(`/follow/${userId}/`, { method: 'DELETE' }),
  isFollowing: (userId: number) => apiRequest(`/follow/status/${userId}/`),
  
  // Get followers and following lists
  getFollowers: async (userId: number, params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/followers/${userId}/${query ? '?' + query : ''}`);
    if (response && response.followers) return response.followers;
    return [];
  },
  getFollowing: async (userId: number, params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/following/${userId}/${query ? '?' + query : ''}`);
    if (response && response.following) return response.following;
    return [];
  },
  
  // Get follow statistics (with super aggressive caching)
  getFollowStats: async (userId: number) => {
    try {
      // Check global cache first
      const cached = globalFollowStatsCache.get(userId);
      if (cached && Date.now() - cached.timestamp < GLOBAL_CACHE_DURATION) {
        console.log(`[CACHE HIT] Follow stats for user ${userId}`);
        return cached.data;
      }
      
      console.log(`[CACHE MISS] Fetching follow stats for user ${userId}`);
      const [followersResponse, followingResponse] = await Promise.all([
        apiRequest(`/followers/${userId}/`),
        apiRequest(`/following/${userId}/`)
      ]);
      
      const result = {
        followers_count: followersResponse.followers_count || 0,
        following_count: followingResponse.following_count || 0
      };
      
      // Cache the result globally
      globalFollowStatsCache.set(userId, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Error getting follow stats:', error);
      return { followers_count: 0, following_count: 0 };
    }
  },
  
  // Clear cache when follow/unfollow happens
  clearFollowStatsCache: (userId: number) => {
    globalFollowStatsCache.delete(userId);
    console.log(`[CACHE CLEARED] Follow stats for user ${userId}`);
  },
  
  // Block/Unblock operations (using existing endpoints)
  blockUser: (userId: number) => apiRequest(`/friendships/`, { method: 'POST', body: JSON.stringify({ user_id: userId, action: 'block' }) }),
  unblockUser: (userId: number) => apiRequest(`/friendships/${userId}/`, { method: 'DELETE' }),
};

// Post API
export const postAPI = {
  getPost: (id: number) => apiRequest(`/posts/${id}/`),
  createPost: (data: CreatePostData) => apiRequest('/posts/', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: number, data: UpdatePostData) => apiRequest(`/posts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePost: (id: number) => apiRequest(`/posts/${id}/`, { method: 'DELETE' }),
  likePost: (id: number) => apiRequest(`/posts/${id}/like/`, { method: 'POST' }),
  unlikePost: (id: number) => apiRequest(`/posts/${id}/unlike/`, { method: 'POST' }),
  bookmarkPost: (id: number) => apiRequest(`/posts/${id}/bookmark/`, { method: 'POST' }),
  unbookmarkPost: (id: number) => apiRequest(`/posts/${id}/unbookmark/`, { method: 'POST' }),
};

// Notification Creation API
export const notificationCreationAPI = {
  createNotification: (data: Record<string, unknown>) => apiRequest('/notifications/', { method: 'POST', body: JSON.stringify(data) }),
  createLikeNotification: (postId: number, userId: number) => apiRequest('/notifications/', { method: 'POST', body: JSON.stringify({ post_id: postId, user_id: userId, type: 'like' }) }),
  createCommentNotification: (postId: number, commentId: number, userId: number) => apiRequest('/notifications/', { method: 'POST', body: JSON.stringify({ post_id: postId, comment_id: commentId, user_id: userId, type: 'comment' }) }),
};

// Post Subscription API
export const postSubscriptionAPI = {
  subscribeToPost: (postId: number) => apiRequest(`/posts/${postId}/`, { method: 'PATCH', body: JSON.stringify({ subscribed: true }) }),
  unsubscribeFromPost: (postId: number) => apiRequest(`/posts/${postId}/`, { method: 'PATCH', body: JSON.stringify({ subscribed: false }) }),
  getSubscribers: (postId: number) => apiRequest(`/posts/${postId}/`),
};

// Realtime API
export const realtimeAPI = {
  connect: () => apiRequest('/auth/user/'),
  disconnect: () => apiRequest('/auth/user/', { method: 'POST' }),
  subscribe: (channel: string) => apiRequest('/auth/user/', { method: 'POST', body: JSON.stringify({ channel }) }),
  unsubscribe: (channel: string) => apiRequest('/auth/user/', { method: 'POST', body: JSON.stringify({ channel }) }),
};

// Search API
export const searchAPI = {
  search: (query: string, filters: SearchFilters = { query }) => apiRequest(`/posts/?search=${encodeURIComponent(query)}`),
  getSuggestions: (query: string) => apiRequest(`/posts/?search=${encodeURIComponent(query)}`),
  getTrending: () => apiRequest('/posts/?ordering=-likes_count'),
};

// Media API
export const mediaAPI = {
  upload: (formData: FormData) => fetch(`${BASE_URL}/upload/media/`, { method: 'POST', body: formData, credentials: 'include' }).then(r => r.json()),
  delete: (id: number) => apiRequest(`/posts/${id}/`, { method: 'DELETE' }),
  getUploadProgress: (id: string) => apiRequest(`/upload/media/${id}/progress/`),
};

// Analytics API
export const analyticsAPI = {
  getStats: () => apiRequest('/mining/stats/'),
  getUserStats: (userId: number) => apiRequest(`/users/${userId}/stats/`),
  getPostStats: (postId: number) => apiRequest(`/posts/${postId}/stats/`),
  getMiningStats: () => apiRequest('/mining/stats/'),
};

// MINING API (REFINED AND TYPE-SAFE)
export const miningAPI = {
  getStats: (): Promise<MiningStats> => apiRequest('/mining/stats/'),
  start: (): Promise<MiningStats> => apiRequest('/mining/start/', { method: 'POST' }),
  stop: (): Promise<MiningStats> => apiRequest('/mining/stop/', { method: 'POST' }),
  claim: (): Promise<{ success: boolean; message: string; amount: number }> => apiRequest('/mining/claim/', { method: 'POST' }),
  heartbeat: (): Promise<Partial<MiningStats>> => apiRequest('/mining/heartbeat/', { method: 'PATCH' }),
  createBoost: (boostType: string, multiplier?: number) => apiRequest('/mining/boost/', { method: 'POST', body: JSON.stringify({ boost_type: boostType, multiplier }) }),
  getHistory: (params = {}) => apiRequest(`/mining/activities/?${new URLSearchParams(params).toString()}`),
  getAchievements: () => apiRequest('/mining/achievements/'),
  getLeaderboard: () => apiRequest('/mining/leaderboard/'),
};

// Faucet API
export const faucetAPI = {
  getStatus: () => apiRequest('/wallet/'),
  claim: (data: Record<string, unknown>) => apiRequest('/wallet/transfer/', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/transactions/${query ? '?' + query : ''}`);
  },
};

// Referral API
export const referralAPI = {
  getCode: () => apiRequest('/auth/user/'),
  getReferrals: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/friendships/${query ? '?' + query : ''}`);
  },
  getStats: () => apiRequest('/auth/user/'),
};

// Story API
export const storyAPI = {
  // Story CRUD
  getStories: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/stories/${query ? '?' + query : ''}`);
  },
  createStory: (data: Record<string, unknown>) => apiRequest('/stories/', { method: 'POST', body: JSON.stringify(data) }),
  updateStory: (id: number, data: Record<string, unknown>) => apiRequest(`/stories/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStory: (id: number) => apiRequest(`/stories/${id}/`, { method: 'DELETE' }),
  
  // Story Management
  getMyStories: () => apiRequest('/stories/my/'),
  getFollowingStories: () => apiRequest('/stories/following/'),
  markStoryViewed: (storyId: number) => apiRequest(`/stories/${storyId}/view/`, { method: 'POST' }),
  
  // Story Interactions
  likeStory: (storyId: number) => apiRequest(`/stories/${storyId}/like/`, { method: 'POST' }),
  unlikeStory: (storyId: number) => apiRequest(`/stories/${storyId}/like/`, { method: 'DELETE' }),
  getStoryComments: (storyId: number) => apiRequest(`/stories/${storyId}/comments/`),
  createStoryComment: (storyId: number, data: Record<string, unknown>) => apiRequest(`/stories/${storyId}/comments/`, { method: 'POST', body: JSON.stringify(data) }),
  deleteStoryComment: (storyId: number, commentId: number) => apiRequest(`/stories/${storyId}/comments/${commentId}/`, { method: 'DELETE' }),
  shareStory: (storyId: number, data: Record<string, unknown>) => apiRequest(`/stories/${storyId}/share/`, { method: 'POST', body: JSON.stringify(data) }),
  bookmarkStory: (storyId: number) => apiRequest(`/stories/${storyId}/bookmark/`, { method: 'POST' }),
  unbookmarkStory: (storyId: number) => apiRequest(`/stories/${storyId}/bookmark/`, { method: 'DELETE' }),
  getStoryBookmarks: () => apiRequest('/stories/bookmarks/'),
  
  // Story Management (Admin)
  cleanupStories: (dryRun: boolean = false) => apiRequest('/stories/cleanup/', { method: 'POST', body: JSON.stringify({ dry_run: dryRun }) }),
  getStoryStats: () => apiRequest('/stories/statistics/'),
};

// Allgemeiner API-Client (z.B. für dynamische Endpunkte)
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => apiRequest(endpoint, { ...options, method: 'GET' }) as Promise<T>,
  post: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestInit) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }) as Promise<T>,
  patch: <T>(endpoint: string, body: Record<string, unknown>, options?: RequestInit) => apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }) as Promise<T>,
  put: <T>(endpoint: string, body: Record<string, unknown>, options?: RequestInit) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }) as Promise<T>,
  delete: <T>(endpoint: string, options?: RequestInit) => apiRequest(endpoint, { ...options, method: 'DELETE' }) as Promise<T>,
  
  upload: <T>(
    endpoint: string, 
    formData: FormData, 
    onUploadProgress?: (progress: UploadProgress) => void
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${BASE_URL}${endpoint}`, true);

      // Token aus localStorage holen und als Header setzen
      const token = localStorage.getItem('access_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // Fortschritts-Event-Listener
      if (onUploadProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            onUploadProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: percentage,
            });
          }
        };
      }
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const jsonResponse = JSON.parse(xhr.responseText);
            resolve(jsonResponse);
          } catch (e) {
            // Falls die Antwort kein valides JSON ist (z.B. leerer String)
            resolve(xhr.responseText as T);
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const detail = errorResponse?.detail || errorResponse?.error || errorResponse?.message;
            if (typeof detail === 'object' && detail !== null) {
              const message = Object.values(detail).flat().join(' ');
              reject(new Error(message || xhr.statusText));
            } else {
              reject(new Error(detail || xhr.statusText));
            }
          } catch (e) {
            reject(new Error(xhr.statusText));
          }
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Ein Netzwerkfehler ist aufgetreten.'));
      };
      
      xhr.ontimeout = () => {
        reject(new Error('Die Anfrage hat das Zeitlimit überschritten.'));
      };

      xhr.send(formData);
    });
  }
};

// API WRAPPER
// =============================================
const djangoApi = {
  ...authAPI,
  ...userAPI,
  ...socialAPI,
  ...groupAPI,
  ...notificationAPI,
  ...userRelationshipAPI,
  ...postAPI,
  ...notificationCreationAPI,
  ...postSubscriptionAPI,
  ...realtimeAPI,
  ...searchAPI,
  ...mediaAPI,
  ...analyticsAPI,
  ...miningAPI,
  ...faucetAPI,
  ...referralAPI,
  ...storyAPI,
  ...apiClient,
  
  // Helper to get base URL
  getBaseUrl: () => BASE_URL,

  async startMining() {
    return this.post('/mining/start/');
  },

  async stopMining() {
    return this.post('/mining/stop/');
  },

  async claimTokens() {
    return this.post('/mining/claim/');
  },

  // Spread mining methods with a 'mining' prefix for clarity
  miningGetStats: miningAPI.getStats,
  miningStart: miningAPI.start,
  miningStop: miningAPI.stop,
  miningClaim: miningAPI.claim,
  miningHeartbeat: miningAPI.heartbeat,
  miningCreateBoost: miningAPI.createBoost,
  miningGetHistory: miningAPI.getHistory,
  miningGetAchievements: miningAPI.getAchievements,
  miningGetLeaderboard: miningAPI.getLeaderboard,
};

// Default-Export für Kompatibilität
export default djangoApi;

// Benannter Export für Kompatibilität
export const api = djangoApi; 