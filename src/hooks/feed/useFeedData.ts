import { useState, useEffect, useCallback } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

// Export feed type for reuse
export type FeedType = 'recent' | 'popular' | 'following' | 'tokens' | 'nfts' | 'foryou';

/**
 * Hook for managing feed data and state
 */
export const useFeedData = ({
  feedType,
  selectedFilter,
  enableAutoRefresh = true,
  refreshInterval = 120000,
  onNewPostsAvailable,
  customUser
}: {
  feedType: FeedType;
  selectedFilter: string | null;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  onNewPostsAvailable?: (hasNew: boolean) => void;
  customUser?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const { user: profile, isAuthenticated, isLoading: profileLoading } = useAuth();
  
  // Log only in development mode
  if (import.meta.env.DEV) {
    console.log(`[useFeedData] Hook state - isAuthenticated: ${isAuthenticated}, profile: ${profile ? profile.username : 'null'}, profileLoading: ${profileLoading}`);
  }
  
  // Get post data and actions from usePosts
  const { 
    posts, 
    adaptedPosts, 
    fetchPosts: baseFetchPosts, 
    likePost, 
    deletePost, 
    createComment, 
    getPostComments, 
    sharePost,
    createPost 
  } = usePosts();
  
  // Wrapper for fetchPosts
  const fetchPosts = useCallback(async (feedTypeOverride?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await baseFetchPosts(feedTypeOverride || feedType, customUser);
      setLastUpdated(new Date());
      setHasNewPosts(false);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading feed';
      setError(new Error(errorMessage));
      
      // Log error only in development
      if (import.meta.env.DEV) {
        console.error('Feed fetch error:', err);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [feedType, baseFetchPosts, customUser]);
  
  // Initial load
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[useFeedData] Effect triggered - isAuthenticated: ${isAuthenticated}, profile: ${profile ? profile.username : 'null'}, feedType: ${feedType}, customUser: ${customUser}`);
    }
    
    if ((isAuthenticated && profile) || customUser) {
      if (import.meta.env.DEV) {
        console.log(`[useFeedData] Fetching posts for feedType: ${feedType} (customUser: ${customUser})`);
      }
      fetchPosts();
    } else {
      if (import.meta.env.DEV) {
        console.log(`[useFeedData] Not fetching posts - isAuthenticated: ${isAuthenticated}, profile: ${!!profile}, customUser: ${customUser}`);
      }
    }
  }, [feedType, selectedFilter, isAuthenticated, profile, fetchPosts, customUser]);
  
  // Auto-refresh logic
  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated) return;
    
    const checkForNewPosts = () => {
      setHasNewPosts(true);
      if (onNewPostsAvailable) {
        onNewPostsAvailable(true);
      }
    };
    
    const intervalId = setInterval(checkForNewPosts, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [enableAutoRefresh, refreshInterval, isAuthenticated, onNewPostsAvailable]);
  
  // Function to refresh the feed
  const refreshFeed = useCallback(async () => {
    const result = await fetchPosts();
    return result;
  }, [fetchPosts]);
  
  return {
    isLoading,
    error,
    adaptedPosts,
    posts,
    fetchPosts,
    likePost,
    deletePost,
    createComment,
    getPostComments,
    sharePost,
    createPost,
    lastUpdated,
    hasNewPosts,
    setHasNewPosts,
    refreshFeed,
    profile,
    isAuthenticated,
    profileLoading
  };
};
