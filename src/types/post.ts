export interface Post {
  id: string;
  author: {
    id: string;
    avatar_url?: string;
    display_name?: string;
    username: string;
    is_verified?: boolean;
  };
  content: string;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_repost: boolean;
  original_post_id?: string;
  original_author?: {
    id: string;
    avatar_url?: string;
    display_name?: string;
    username: string;
  };
  has_comments?: boolean;
  comments?: any[];
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
  is_bookmarked_by_user?: boolean;
} 
