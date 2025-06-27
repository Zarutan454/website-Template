
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { FeedType } from './useFeedData';

/**
 * Hook for managing feed refresh logic
 * Handles automatic refreshing, polling, and manual refreshes
 */
export const useFeedRefresh = ({
  fetchPosts,
  feedType,
  isAuthenticated = true,
  enableAutoRefresh = true,
  refreshInterval = 120000
}: {
  fetchPosts: (feedType: string) => Promise<unknown>;
  feedType: FeedType;
  isAuthenticated?: boolean;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}) => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Timer references
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshLockRef = useRef<boolean>(false);
  
  // Refresh function
  const refreshFeed = useCallback(async () => {
    if (refreshLockRef.current || isRefreshing) return false;
    
    try {
      setIsRefreshing(true);
      refreshLockRef.current = true;
      toast.info("Feed wird aktualisiert...");
      
      await fetchPosts(feedType);
      
      setLastRefresh(new Date());
      setHasNewPosts(false);
      toast.success("Feed aktualisiert");
      
      return true;
    } catch (error) {
      console.error('Error refreshing feed:', error);
      toast.error("Fehler beim Aktualisieren");
      return false;
    } finally {
      setIsRefreshing(false);
      
      // Prevent rapid consecutive refreshes
      setTimeout(() => {
        refreshLockRef.current = false;
      }, 1000);
    }
  }, [feedType, fetchPosts, isRefreshing]);
  
  // Check for new posts
  const checkForNewPosts = useCallback(() => {
    setHasNewPosts(true);
  }, []);
  
  // Set up auto-refresh timer
  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated) return;
    
    refreshTimerRef.current = setInterval(checkForNewPosts, refreshInterval);
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [enableAutoRefresh, refreshInterval, checkForNewPosts, isAuthenticated]);
  
  return {
    lastRefresh,
    hasNewPosts,
    setHasNewPosts,
    isRefreshing,
    refreshFeed: refreshFeed as () => Promise<boolean>,
    handleRefresh: refreshFeed as () => Promise<boolean>
  };
};
