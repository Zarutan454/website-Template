import { useState, useEffect, useCallback } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';

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
  onNewPostsAvailable
}: {
  feedType: FeedType;
  selectedFilter: string | null;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  onNewPostsAvailable?: (hasNew: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  
  console.log(`[useFeedData] Hook state - isAuthenticated: ${isAuthenticated}, profile: ${profile ? profile.username : 'null'}, profileLoading: ${profileLoading}`);
  
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
      await baseFetchPosts(feedTypeOverride || feedType);
      setLastUpdated(new Date());
      setHasNewPosts(false);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Unknown error loading feed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [feedType, baseFetchPosts]);
  
  // Initial load
  useEffect(() => {
    console.log(`[useFeedData] Effect triggered - isAuthenticated: ${isAuthenticated}, profile: ${profile ? profile.username : 'null'}, feedType: ${feedType}`);
    if (isAuthenticated && profile) {
      console.log(`[useFeedData] Fetching posts for feedType: ${feedType}`);
      fetchPosts();
    } else {
      console.log(`[useFeedData] Not fetching posts - isAuthenticated: ${isAuthenticated}, profile: ${!!profile}`);
    }
  }, [feedType, selectedFilter, isAuthenticated, profile, fetchPosts]);
  
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
