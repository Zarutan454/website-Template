
import { Post } from '@/types/posts';
import { timeAgo } from './dateUtils';

/**
 * Adapts a post object from Supabase to the format expected by the UI components
 */
interface PostUser {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface PostData {
  id: string;
  user?: PostUser;
  author_id?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked_by_user?: boolean;
  media_url?: string;
  media_type?: string;
  hashtags?: string[];
  type?: string;
  post_type?: string;
  nft_data?: Record<string, unknown>;
  token_data?: Record<string, unknown>;
}

export const adaptPostForCard = async (post: PostData, currentUserId: string): Promise<Record<string, unknown> | null> => {
  // Ensure we have a valid post object
  if (!post) return null;
  
  try {
    // Extract author info from user property (if available)
    const author = post.user ? {
      id: post.user.id,
      username: post.user.username || 'unknown',
      display_name: post.user.display_name || post.user.username || 'Unknown User',
      avatar_url: post.user.avatar_url,
      is_verified: post.user.is_verified || false
    } : {
      id: post.author_id || '',
      username: 'unknown',
      display_name: 'Unknown User',
      avatar_url: null,
      is_verified: false
    };
    
    // Format date as a relative time string
    const timeAgoStr = post.created_at ? timeAgo(new Date(post.created_at as string)) : '';
    
    // Determine if the post is liked by the current user
    const isLiked = post.is_liked_by_user || false;
    
    // Extract media content
    const mediaUrl = post.media_url || null;
    const mediaType = post.media_type || null;
    
    // Convert hashtags to a more usable format if needed
    const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
    
    // Check if the current user is the author
    const isOwnPost = post.author_id === currentUserId || author.id === currentUserId;
    
    // Categorize post based on content
    const postCategories = {
      isNFTRelated: isNFTRelatedPost(post),
      isTokenRelated: isTokenRelatedPost(post),
      hasMedia: !!mediaUrl
    };
    
    // Build the adapted post object
    return {
      id: post.id,
      author,
      content: post.content,
      created_at: post.created_at,
      updated_at: post.updated_at,
      time_ago: timeAgoStr,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      is_liked: isLiked,
      is_own_post: isOwnPost,
      media_url: mediaUrl,
      media_type: mediaType,
      image_url: mediaType === 'image' ? mediaUrl : null,
      video_url: mediaType === 'video' ? mediaUrl : null,
      audio_url: mediaType === 'audio' ? mediaUrl : null,
      has_comments: (post.comments_count || 0) > 0,
      hashtags,
      categories: postCategories
    };
  } catch (error) {
    return null;
  }
};

/**
 * Synchronous version of adaptPostForCard for use in components
 * that need to process multiple posts at once without async/await
 */
export const adaptPostForCardSync = (post: PostData, currentUserId: string): Record<string, unknown> | null => {
  if (!post) return null;
  
  try {
    // Extract author info
    const author = post.user ? {
      id: post.user.id,
      username: post.user.username || 'unknown',
      display_name: post.user.display_name || post.user.username || 'Unknown User',
      avatar_url: post.user.avatar_url,
      is_verified: post.user.is_verified || false
    } : {
      id: post.author_id,
      username: 'unknown',
      display_name: 'Unknown User',
      avatar_url: null,
      is_verified: false
    };
    
    // Format date as a relative time string
    const timeAgoStr = post.created_at ? timeAgo(new Date(post.created_at as string)) : '';
    
    // Categorize post based on content
    const postCategories = {
      isNFTRelated: isNFTRelatedPost(post),
      isTokenRelated: isTokenRelatedPost(post),
      hasMedia: !!post.media_url
    };
    
    // Build and return the adapted post
    return {
      id: post.id,
      author,
      content: post.content,
      created_at: post.created_at,
      updated_at: post.updated_at,
      time_ago: timeAgoStr,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      is_liked: post.is_liked_by_user || false,
      is_own_post: post.author_id === currentUserId || author.id === currentUserId,
      media_url: post.media_url || null,
      media_type: post.media_type || null,
      image_url: post.media_type === 'image' ? post.media_url : null,
      video_url: post.media_type === 'video' ? post.media_url : null,
      audio_url: post.media_type === 'audio' ? post.media_url : null,
      has_comments: (post.comments_count || 0) > 0,
      hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
      categories: postCategories
    };
  } catch (error) {
    return null;
  }
};

/**
 * Determines if a post is related to NFTs based on its content and tags
 */
export const isNFTRelatedPost = (post: PostData): boolean => {
  if (!post) return false;
  
  // Check hashtags for NFT-related terms
  const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
  const nftRelatedHashtags = ['nft', 'nfts', 'crypto', 'blockchain', 'collectible', 'digital art'];
  
  const hasNftHashtag = hashtags.some(tag => 
    nftRelatedHashtags.some(nftTag => 
      tag.toLowerCase().includes(nftTag.toLowerCase())
    )
  );
  
  // Check content for NFT-related keywords
  const content = (post.content || '').toLowerCase();
  const hasNftKeywords = content.includes('nft') || 
                         content.includes('collectible') || 
                         content.includes('digital art') ||
                         content.includes('opensea') ||
                         content.includes('rarible');
  
  // Check if post is specifically tagged as NFT type
  const isNftType = post.type === 'nft' || post.post_type === 'nft';
  
  // Check if post has NFT metadata
  const hasNftData = !!post.nft_data;
  
  return hasNftHashtag || hasNftKeywords || isNftType || hasNftData;
};

/**
 * Determines if a post is related to crypto tokens based on its content and tags
 */
export const isTokenRelatedPost = (post: PostData): boolean => {
  if (!post) return false;
  
  // Check hashtags for token-related terms
  const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
  const tokenRelatedHashtags = ['token', 'crypto', 'cryptocurrency', 'defi', 'bitcoin', 'ethereum', 'altcoin', 'trading'];
  
  const hasTokenHashtag = hashtags.some(tag => 
    tokenRelatedHashtags.some(tokenTag => 
      tag.toLowerCase().includes(tokenTag.toLowerCase())
    )
  );
  
  // Check content for token-related keywords
  const content = (post.content || '').toLowerCase();
  const hasTokenKeywords = content.includes('token') || 
                           content.includes('crypto') || 
                           content.includes('coin') ||
                           content.includes('bitcoin') ||
                           content.includes('ethereum') ||
                           content.includes('wallet') ||
                           content.includes('blockchain');
  
  // Check if post is specifically tagged as token type
  const isTokenType = post.type === 'token' || post.post_type === 'token';
  
  // Check if post has token metadata
  const hasTokenData = !!post.token_data;
  
  return hasTokenHashtag || hasTokenKeywords || isTokenType || hasTokenData;
};

/**
 * Filter posts by category (nft, token, media)
 */
export const filterPostsByCategory = (posts: PostData[], category: string): PostData[] => {
  if (!Array.isArray(posts) || posts.length === 0 || !category) return posts;
  
  switch (category.toLowerCase()) {
    case 'nft':
    case 'nfts':
      return posts.filter(post => isNFTRelatedPost(post));
    case 'token':
    case 'tokens':
      return posts.filter(post => isTokenRelatedPost(post));
    case 'media':
      return posts.filter(post => post.media_url);
    default:
      return posts;
  }
};

/**
 * Sort posts by various criteria (recent, popular, trending)
 */
export const sortPosts = (posts: PostData[], sortBy: string): PostData[] => {
  if (!Array.isArray(posts) || posts.length === 0 || !sortBy) return posts;
  
  const sortedPosts = [...posts];
  
  switch (sortBy.toLowerCase()) {
    case 'recent':
      return sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'popular':
      return sortedPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    case 'trending':
      // Combined score based on likes, comments, and recency
      return sortedPosts.sort((a, b) => {
        const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2;
        const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2;
        return scoreB - scoreA;
      });
    default:
      return sortedPosts;
  }
};
