// Hier existierende Typdefinitionen beibehalten (wenn vorhanden)

export interface Post {
  id: string;
  author_id?: string; // Machen wir optional, da es in manchen Datenstrukturen fehlt
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
    role?: string;
  };
  title?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked_by_user?: boolean;
  is_bookmarked_by_user?: boolean;
  tags?: string[];
  media_url?: string;
  media_type?: string;
  video_url?: string;
  image_url?: string;
  token_data?: {
    token_name: string;
    token_symbol: string;
    token_image?: string;
    token_network: string;
    token_address: string;
  };
  nft_data?: {
    nft_id: string;
    nft_name: string;
    nft_image: string;
    nft_collection: string;
    nft_network: string;
  };
  user?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
    role?: string;
  };
  is_liked?: boolean;
  is_repost?: boolean;
  original_post_id?: string;
  original_author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
    role?: string;
  };
  has_comments?: boolean;
  comments?: Array<{
    id: string;
    content: string;
    author_id: string;
    created_at: string;
    author?: {
      id: string;
      username?: string;
      display_name?: string;
      avatar_url?: string;
    };
  }>;
  time_ago?: string;
}

export interface CreatePostData {
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  hashtags?: string[];
  action?: string; // Added this property to support action types in post creation
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}

export interface FeedEmptyProps {
  darkMode?: boolean;
  message?: string;
  description?: string;
  onCreatePost?: () => void;
}
