
import { useState, useEffect, useCallback } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { FeedType } from './useFeedData';
import { useFeedRefresh } from './useFeedRefresh';

interface UseEnhancedFeedDataProps {
  feedType: FeedType;
  selectedFilter: string | null;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Erweiterter Hook für Feed-Daten mit integrierter Filterung und Aktualisierung
 */
export const useEnhancedFeedData = ({
  feedType,
  selectedFilter,
  enableAutoRefresh = true,
  refreshInterval = 120000 // 2 Minuten
}: UseEnhancedFeedDataProps) => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  
  // Basis-Hooks
  const { 
    posts, 
    adaptedPosts, 
    isLoading, 
    error, 
    fetchPosts: fetchPostsBase,
    likePost,
    deletePost,
    createComment,
    getPostComments,
    sharePost,
    createPost
  } = usePosts();
  
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  
  // Wrapper für fetchPosts, um zusätzliche Logik hinzuzufügen
  const fetchPosts = useCallback(async () => {
    if (isAuthenticated && profile) {
      await fetchPostsBase(feedType);
      setLastUpdated(new Date());
      return;
    }
  }, [feedType, isAuthenticated, profile, fetchPostsBase]);
  
  // Feed-Aktualisierungs-Hook
  const {
    hasNewPosts,
    setHasNewPosts,
    isRefreshing,
    handleRefresh
  } = useFeedRefresh({
    fetchPosts,
    feedType,
    isAuthenticated,
    enableAutoRefresh,
    refreshInterval
  });
  
  // Initialer Datenladevorgang
  useEffect(() => {
    if (isAuthenticated && profile) {
      console.log(`[useEnhancedFeedData] Initialer Ladevorgang für Feed-Typ: ${feedType}`);
      fetchPosts().then(() => {
        setLastUpdated(new Date());
      });
    }
  }, [feedType, isAuthenticated, profile, fetchPosts]);
  
  // Filter-basierte Aktualisierung
  useEffect(() => {
    if (isAuthenticated && profile && selectedFilter) {
      console.log(`[useEnhancedFeedData] Filter geändert zu: ${selectedFilter}, aktualisiere Feed`);
      fetchPosts().then(() => {
        setLastUpdated(new Date());
      });
    }
  }, [selectedFilter, isAuthenticated, profile, fetchPosts]);
  
  return {
    adaptedPosts,
    posts,
    isLoading: isLoading || isRefreshing,
    error,
    fetchPosts: handleRefresh, // Wir verwenden den handleRefresh aus useFeedRefresh
    profileLoading,
    isAuthenticated,
    profile,
    lastUpdated,
    hasNewPosts,
    setHasNewPosts,
    likePost,
    deletePost,
    createComment,
    getPostComments,
    sharePost,
    createPost
  };
};
