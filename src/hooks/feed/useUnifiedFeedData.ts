
import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { postRepository } from '@/repositories/PostRepository';
import { FeedType } from '@/hooks/feed/useFeedData';
import { adaptPostForCardSync } from '@/utils/postAdapter';
import { toast } from 'sonner';

export interface FeedDataOptions {
  feedType: FeedType;
  selectedFilter?: string | null;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
  onNewPostsAvailable?: (hasNew: boolean) => void;
}

/**
 * Vereinheitlichter Hook für Feed-Daten mit Optimierungen für:
 * - Paginierung
 * - Auto-Refresh
 * - Virtualisiertes Scrollen
 * - Post-Interaktionen
 */
export const useUnifiedFeedData = ({
  feedType,
  selectedFilter = null,
  enableAutoRefresh = true,
  refreshInterval = 120000,
  pageSize = 20,
  onNewPostsAvailable
}: FeedDataOptions) => {
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
  const [adaptedPosts, setAdaptedPosts] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs für Optimierung
  const postIdsRef = useRef<Set<string>>(new Set());
  const checkTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Hauptfunktion zum Laden der Posts
  const fetchPosts = useCallback(async (
    checkForNew: boolean = false, 
    resetPagination: boolean = false
  ) => {
    if (!isAuthenticated || !profile) return false;
    
    try {
      // Nur bei vollständigem Refresh oder initialem Laden setzen wir isLoading
      if (!checkForNew && !isRefreshing) {
        if (resetPagination) {
          setIsLoading(true);
        }
      }
      
      setError(null);
      
      
      // Parameter für das Repository vorbereiten
      const options = {
        page: resetPagination ? 1 : page,
        pageSize: pageSize,
        filter: selectedFilter || undefined
      };
      
      // Posts vom Repository laden - Korrektur: Nur zwei Argumente übergeben (feedType und profile.id)
      const fetchedPosts = await postRepository.getFeedPosts(
        feedType, 
        profile.id
      );
      
      // Bei Check for New nur prüfen, ob neue Posts vorhanden sind
      if (checkForNew) {
        const newPosts = fetchedPosts.filter(post => !postIdsRef.current.has(post.id));
        
        if (newPosts.length > 0) {
          console.log(`[useUnifiedFeedData] Found ${newPosts.length} new posts`);
          setHasNewPosts(true);
          
          if (onNewPostsAvailable) {
            onNewPostsAvailable(true);
          }
        }
        
        return true;
      }
      
      // Bei Reset die Posts ersetzen, sonst anhängen
      if (resetPagination) {
        // Posts speichern und IDs aktualisieren
        setPosts(fetchedPosts);
        postIdsRef.current = new Set(fetchedPosts.map(post => post.id));
        setPage(1);
      } else {
        // Neue Posts filtern und anhängen
        const newPosts = fetchedPosts.filter(post => !postIdsRef.current.has(post.id));
        
        if (newPosts.length === 0) {
          // Keine neuen Posts mehr verfügbar
          setHasMore(false);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          // Neue IDs zum Set hinzufügen
          newPosts.forEach(post => postIdsRef.current.add(post.id));
        }
      }
      
      // Aktualisierungsstatus zurücksetzen
      setHasNewPosts(false);
      setLastUpdated(new Date());
      
      return true;
    } catch (err: any) {
      console.error('[useUnifiedFeedData] Error fetching posts:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading feed'));
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    feedType, 
    profile, 
    isAuthenticated, 
    page, 
    pageSize, 
    selectedFilter,
    isRefreshing,
    onNewPostsAvailable
  ]);
  
  // Post-Adaptierung in einen useEffect auslagern
  useEffect(() => {
    if (posts.length > 0 && profile) {
      const adapted = posts.map(post => adaptPostForCardSync(post, profile.id));
      setAdaptedPosts(adapted);
    } else {
      setAdaptedPosts([]);
    }
  }, [posts, profile]);
  
  // Initiales Laden, wenn sich wichtige Parameter ändern
  useEffect(() => {
    if (isAuthenticated && profile) {
      console.log(`[useUnifiedFeedData] Initial load for feed type: ${feedType}`);
      fetchPosts(false, true);
    }
  }, [feedType, selectedFilter, isAuthenticated, profile, fetchPosts]);
  
  // Auto-Refresh Logic
  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated) return;
    
    const checkForNewPosts = () => {
      fetchPosts(true, false);
    };
    
    // Vorhandenen Timer löschen
    if (checkTimer.current) {
      clearInterval(checkTimer.current);
    }
    
    // Neuen Timer setzen
    checkTimer.current = setInterval(checkForNewPosts, refreshInterval);
    
    return () => {
      if (checkTimer.current) {
        clearInterval(checkTimer.current);
        checkTimer.current = null;
      }
    };
  }, [
    enableAutoRefresh, 
    refreshInterval, 
    isAuthenticated, 
    fetchPosts
  ]);
  
  // Funktion zum Laden weiterer Posts (Paginierung)
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setPage(prevPage => prevPage + 1);
    fetchPosts(false, false);
  }, [fetchPosts, isLoading, hasMore]);
  
  // Funktion zum Aktualisieren des Feeds
  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    const result = await fetchPosts(false, true);
    return result;
  }, [fetchPosts]);
  
  return {
    posts,
    adaptedPosts,
    isLoading,
    error,
    hasMore,
    lastUpdated,
    hasNewPosts,
    setHasNewPosts,
    isRefreshing,
    loadMore,
    refreshFeed,
    fetchPosts,
    profile,
    isAuthenticated,
    profileLoading
  };
};
