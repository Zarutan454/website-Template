
/**
 * Represents user profile data across the application
 */
export interface ProfileData {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  email?: string;
  role?: string;
  role_name?: string; // Added role_name property
  bio?: string;
  social_links?: {
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
    instagram?: string;
  };
  created_at?: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
  post_count?: number;
  total_likes_received?: number;
  mined_tokens?: number;
  mining_stats?: Record<string, unknown>;
  wallet_address?: string;
  location?: string;
  website?: string;
  cover_url?: string;
}

// Alias für vereinfachte Kompatibilität mit existierenden Komponenten
export type Profile = ProfileData;

/**
 * Minimal profile data used for display in feed items
 */
export interface MinimalProfileData {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

/**
 * Response object when fetching profile data
 */
export interface ProfileResponse {
  profile: ProfileData | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}
