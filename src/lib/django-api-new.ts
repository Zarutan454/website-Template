// Zentrale API-Client-Schnittstelle für das Django-Backend (rekonstruiert nach API-Doku und Code-Imports)
// Alle Endpunkte: /api/

// BASE_URL dynamisch aus Umgebungsvariable oder Fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Token-Refresh-Funktion
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${BASE_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// Hilfsfunktion für API-Requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Token aus localStorage holen
  let token = localStorage.getItem('access_token');
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  });
  
  // Authorization-Header hinzufügen, wenn Token vorhanden
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  let response = await fetch(`${BASE_URL}/api${endpoint}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  
  // Wenn 401 Unauthorized, versuche Token zu refresh
  if (response.status === 401 && token) {
    console.log('[API] Token expired, attempting refresh...');
    const refreshSuccess = await refreshAccessToken();
    
    if (refreshSuccess) {
      // Token wurde erfolgreich refreshed, versuche Request erneut
      token = localStorage.getItem('access_token');
      headers.set('Authorization', `Bearer ${token}`);
      
      response = await fetch(`${BASE_URL}/api${endpoint}`, {
        credentials: 'include',
        headers,
        ...options,
      });
    } else {
      // Refresh fehlgeschlagen, User abmelden
      console.log('[API] Token refresh failed, clearing auth data');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Event auslösen für Auth-Context
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }
  
  if (!response.ok) {
    let errorMessage = response.statusText;
    
    try {
      const error = await response.json();
      // Versuche, eine spezifischere Fehlermeldung aus der Django-Antwort zu extrahieren
      const detail = error?.detail || error?.error || error?.message;
      if (typeof detail === 'object' && detail !== null) {
        // Wenn das Detail ein Objekt ist, versuche gängige Schlüssel zu finden
        errorMessage = Object.values(detail).flat().join(' ') || response.statusText;
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      }
    } catch (parseError) {
      // Wenn JSON-Parsing fehlschlägt, verwende Status-Text
      errorMessage = response.statusText;
    }
    
    // Log error only in development
    if (import.meta.env.DEV) {
      console.error(`API Error (${response.status}): ${errorMessage}`, { endpoint, status: response.status });
    }
    
    throw new Error(errorMessage);
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
  wallet_address?: string;
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
  media_url?: string | null;
  media_type?: string | null;
  hashtags?: string[];
  privacy?: 'public' | 'friends' | 'private';
  group?: string;
}

export interface UpdatePostData {
  content?: string;
  media_url?: string | null;
  media_type?: string | null;
  hashtags?: string[];
  privacy?: 'public' | 'friends' | 'private';
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
  getProfileByUsername: (username: string) => apiRequest(`/users/profile/${username}/`),
  updateProfile: (data: Record<string, unknown>) => apiRequest('/auth/user/', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadAvatar: (file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file); // Backend erwartet 'file'
    formData.append('type', 'avatar'); // Upload-Typ für Backend
    
    return fetch(`${BASE_URL}/api/upload/media/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    }).then(r => r.json());
  },
  uploadCover: (file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file); // Backend erwartet 'file'
    formData.append('type', 'cover'); // Upload-Typ für Backend
    
    return fetch(`${BASE_URL}/api/upload/media/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    }).then(r => r.json());
  },
  deleteAccount: (data: Record<string, unknown>) => apiRequest('/auth/user/', { method: 'DELETE', body: JSON.stringify(data) }),
  
  // Neue Profil-Endpunkte
  getUserPhotos: (userId: number, page: number = 1) => apiRequest(`/users/${userId}/photos/?page=${page}`),
  getUserActivity: (userId: number, page: number = 1) => apiRequest(`/users/${userId}/activity/?page=${page}`),
  getUserAnalytics: (userId: number) => apiRequest(`/users/${userId}/analytics/`),
  getUserPrivacy: (userId: number) => apiRequest(`/users/${userId}/privacy/`),
  getUserSocialLinks: (userId: number) => apiRequest(`/users/${userId}/social-links/`),
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
  getPosts: (page: number = 1, limit: number = 20, group?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: limit.toString(),
    });
    if (group) {
      params.append('group', group);
    }
    return apiRequest(`/posts/?${params.toString()}`)
  },
  getTrendingPosts: () => apiRequest('/posts/?ordering=-likes_count'),
  searchPosts: (query: string) => apiRequest(`/posts/?search=${encodeURIComponent(query)}`),
};

// Group API
export const groupAPI = {
  getGroups: async (tab: string = 'all') => {
    console.log('[groupAPI.getGroups] Calling API with tab:', tab);
    const response = await apiRequest(`/groups/?tab=${tab}`);
    console.log('[groupAPI.getGroups] API response:', response);
    return response;
  },
  getGroupDetails: (groupId: string) => apiRequest(`/groups/${groupId}/`),
  createGroup: (formData: FormData) => fetch(`${BASE_URL}/api/groups/`, {
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
  updateAISummary: (groupId: string) => apiRequest(`/groups/${groupId}/ai-summary/`, { method: 'POST' }) as Promise<{ ai_summary: string; ai_recommendations: string[] }>,
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
  // Korrigiert: getPosts mit group Parameter
  getPosts: (page: number = 1, limit: number = 20, group?: string) => socialAPI.getPosts(page, limit, group),
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
  // Get WebSocket connection info
  getConnectionInfo: async () => {
    const token = localStorage.getItem('access_token');
    const wsUrl = BASE_URL.replace('http', 'ws');
    return {
      data: {
        ws_url: `${wsUrl}/ws/chat/`,
        token: token
      }
    };
  },

  // Send message via WebSocket or HTTP fallback
  sendMessage: async (message: Record<string, unknown>) => {
    return apiRequest('/messaging/send/', { method: 'POST', body: JSON.stringify(message) });
  },

  // Join room
  joinRoom: async (room: string) => {
    return apiRequest('/messaging/join-room/', { method: 'POST', body: JSON.stringify({ room }) });
  },

  // Leave room
  leaveRoom: async (room: string) => {
    return apiRequest('/messaging/leave-room/', { method: 'POST', body: JSON.stringify({ room }) });
  },

  // Subscribe to user events
  subscribeToUser: async (targetUserId: string) => {
    return apiRequest('/messaging/subscribe-user/', { method: 'POST', body: JSON.stringify({ target_user_id: targetUserId }) });
  },

  // Unsubscribe from user events
  unsubscribeFromUser: async (targetUserId: string) => {
    return apiRequest('/messaging/unsubscribe-user/', { method: 'POST', body: JSON.stringify({ target_user_id: targetUserId }) });
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    return apiRequest('/messaging/subscription-status/');
  },

  // Legacy methods for compatibility
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
  upload: (formData: FormData) => {
    const token = localStorage.getItem('access_token');
    return fetch(`${BASE_URL}/api/upload/media/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    }).then(r => r.json());
  },
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

  // --- NEU: Vollständige Facebook-Story-Interaktionen ---
  // Poll Vote
  voteInPoll: (storyId: number, option: string) => apiRequest(`/stories/${storyId}/poll/vote/`, { method: 'POST', body: JSON.stringify({ option }) }),
  // Highlight Toggle (add/remove)
  // Für Facebook-Logik: Highlight ist eine Sammlung, daher POST für anlegen, ggf. DELETE für entfernen
  createHighlight: (title: string, stories: number[]) => apiRequest('/stories/highlights/', { method: 'POST', body: JSON.stringify({ title, stories }) }),
  getHighlights: () => apiRequest('/stories/highlights/', { method: 'GET' }),
  // Hide Story (moderator, aber für UI-Flow)
  hideStory: (storyId: number, reason: string) => apiRequest(`/stories/${storyId}/hide/`, { method: 'POST', body: JSON.stringify({ reason }) }),
  // Viewer Tracking (Liste der Viewer)
  getViewers: (storyId: number) => apiRequest(`/stories/${storyId}/viewers/`, { method: 'GET' }),
  // Reaction (Emoji/Text)
  reactToStory: (storyId: number, reaction_type: string, value: string) => apiRequest(`/stories/${storyId}/react/`, { method: 'POST', body: JSON.stringify({ reaction_type, value }) }),
  // Reply (Antwort auf Story)
  replyToStory: (storyId: number, message: string) => apiRequest(`/stories/${storyId}/reply/`, { method: 'POST', body: JSON.stringify({ message }) }),
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

  // Auth methods
  login: authAPI.login,
  register: authAPI.register,
  logout: authAPI.logout,
  refresh: authAPI.refresh,
  getProfile: userAPI.getProfile,

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

import type { 
  ConversationResponse, 
  MessagesResponse, 
  CreateConversationRequest, 
  SendMessageRequest,
  ApiResponse as MessagingApiResponse 
} from '../types/messaging';

// Messaging API Methods
export const messagingAPI = {
  // Get all conversations for current user
  getConversations: async (): Promise<ConversationResponse> => {
    try {
      const response = await apiClient.get('/api/messaging/conversations/');
      return response as ConversationResponse;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Create a new conversation
  createConversation: async (data: CreateConversationRequest): Promise<MessagingApiResponse> => {
    try {
      const response = await apiClient.post('/api/messaging/conversations/create/', data as unknown as Record<string, unknown>);
      return response as MessagingApiResponse;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Get messages for a conversation
  getMessages: async (conversationId: number): Promise<MessagesResponse> => {
    try {
      const response = await apiClient.get(`/api/messaging/conversations/${conversationId}/messages/`);
      return response as MessagesResponse;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (conversationId: number, data: SendMessageRequest): Promise<MessagingApiResponse> => {
    try {
      const response = await apiClient.post(`/api/messaging/conversations/${conversationId}/send/`, data as unknown as Record<string, unknown>);
      return response as MessagingApiResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark conversation as read
  markConversationRead: async (conversationId: number): Promise<MessagingApiResponse> => {
    try {
      const response = await apiClient.post(`/api/messaging/conversations/${conversationId}/read/`);
      return response as MessagingApiResponse;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },

  // Add reaction to message
  addMessageReaction: async (messageId: number, reactionType: string): Promise<MessagingApiResponse> => {
    try {
      const response = await apiClient.post(`/api/messaging/messages/${messageId}/reactions/`, {
        reaction_type: reactionType
      });
      return response as MessagingApiResponse;
    } catch (error) {
      console.error('Error adding message reaction:', error);
      throw error;
    }
  },

  // Remove reaction from message
  removeMessageReaction: async (messageId: number, reactionType: string): Promise<MessagingApiResponse> => {
    try {
      // DELETE-Requests unterstützen kein 'data'-Feld, daher ggf. als Query-Parameter oder Body (je nach Backend)
      // Hier: Sende reaction_type als Query-Parameter
      const response = await apiClient.delete(`/api/messaging/messages/${messageId}/reactions/remove/?reaction_type=${encodeURIComponent(reactionType)}`);
      return response as MessagingApiResponse;
    } catch (error) {
      console.error('Error removing message reaction:', error);
      throw error;
    }
  },
}; 

// Hashtag API Methods
export const hashtagAPI = {
  // Get all hashtags
  getHashtags: () => apiRequest('/hashtags/'),
  
  // Get trending hashtags
  getTrendingHashtags: () => apiRequest('/hashtags/trending/'),
  
  // Get hashtag details
  getHashtag: (id: number) => apiRequest(`/hashtags/${id}/`),
  
  // Get posts for a hashtag
  getHashtagPosts: (id: number) => apiRequest(`/hashtags/${id}/posts/`),
  
  // Search hashtags
  searchHashtags: (query: string) => apiRequest(`/hashtags/?search=${encodeURIComponent(query)}`),
}; 

// Group Event type
export interface GroupEvent {
  id: string;
  group: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  cover_image_url?: string;
  created_by: UserProfile;
  created_at: string;
  updated_at: string;
}

// Group Events API
export const groupEventsAPI = {
  getEvents: (groupId: string) => apiRequest(`/group-events/?group=${groupId}`) as Promise<{ results: GroupEvent[] }>,
  createEvent: (data: Omit<GroupEvent, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => apiRequest('/group-events/', { method: 'POST', body: JSON.stringify(data) }) as Promise<GroupEvent>,
  updateEvent: (id: string, data: Partial<GroupEvent>) => apiRequest(`/group-events/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }) as Promise<GroupEvent>,
  deleteEvent: (id: string) => apiRequest(`/group-events/${id}/`, { method: 'DELETE' }) as Promise<void>,
}; 

// Group Media API
export const groupMediaAPI = {
  getMedia: (groupId: string, page: number = 1) => apiRequest(`/groups/${groupId}/media/?page=${page}`),
}; 

// Group Files API
export interface GroupFile {
  id: string;
  file_name: string;
  file_size: number;
  sender: { id: string; username: string; avatar_url?: string };
  created_at: string;
  download_url: string;
}
export const groupFilesAPI = {
  getFiles: (groupId: string, page: number = 1) => apiRequest(`/groups/${groupId}/files/?page=${page}`) as Promise<{ results: GroupFile[]; count: number }>,
  deleteFile: (messageId: string) => apiRequest(`/groups/messages/${messageId}/file-delete/`, { method: 'DELETE' }) as Promise<{ success: boolean }>,
}; 

// Group Member Admin API
export const groupMemberAdminAPI = {
  promote: (groupId: string, userId: string) => apiRequest(`/groups/${groupId}/promote/${userId}/`, { method: 'POST' }),
  demote: (groupId: string, userId: string) => apiRequest(`/groups/${groupId}/demote/${userId}/`, { method: 'POST' }),
  kick: (groupId: string, userId: string) => apiRequest(`/groups/${groupId}/kick/${userId}/`, { method: 'POST' }),
}; 

// Group Settings API
export interface GroupSettingsUpdate {
  name?: string;
  description?: string;
  privacy?: string;
  avatar_url?: string;
  banner_url?: string;
  guidelines?: string;
  tags?: string[];
  type?: string;
}
export const groupSettingsAPI = {
  update: (groupId: string, data: GroupSettingsUpdate) => apiRequest(`/groups/${groupId}/`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Group Analytics API
export const groupAnalyticsAPI = {
  getAnalytics: (groupId: string) => apiRequest(`/groups/${groupId}/analytics/`),
};

export const groupReportsAPI = {
  getReports: (groupId: string) => apiRequest(`/groups/${groupId}/reports/`),
};

// Group Event RSVP API
export interface GroupEventRSVP {
  id: string;
  event: string;
  user: UserProfile;
  status: 'going' | 'interested' | 'declined';
  responded_at: string;
}

export const groupEventRSVPAPI = {
  getRSVPs: (eventId: string, status?: 'going' | 'interested' | 'declined') =>
    apiRequest(`/group-event-rsvps/?event=${eventId}${status ? `&status=${status}` : ''}`) as Promise<{ results: GroupEventRSVP[] }>,
  setRSVP: (eventId: string, status: 'going' | 'interested' | 'declined') =>
    apiRequest('/group-event-rsvps/', { method: 'POST', body: JSON.stringify({ event: eventId, status }) }) as Promise<GroupEventRSVP>,
  getMyRSVP: (eventId: string) =>
    apiRequest(`/group-event-rsvps/my_rsvp/?event=${eventId}`) as Promise<GroupEventRSVP | { status: null }>,
};

// Media Upload Helper
export const uploadMedia = (file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return fetch('/api/upload/media/', {
    method: 'POST',
    body: formData,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
  }).then(r => r.json());
}; 

export const moderationAPI = {
  getReports: () => apiRequest('/get_moderation_dashboard/'),
  resolveReport: (reportId: string, action: string, notes = '') => apiRequest(`/resolve_report/${reportId}/`, { method: 'POST', body: JSON.stringify({ action, notes }) }),
}; 