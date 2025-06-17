import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { postRepository } from '@/repositories/PostRepository';
import { adaptPostForCardSync, isNFTRelatedPost, isTokenRelatedPost } from '@/utils/postAdapter';
import { toast } from 'sonner';
import { Post } from '@/types/posts';

export type FeedType = 'recent' | 'popular' | 'following' | 'tokens' | 'nfts';
export type SortType = 'newest' | 'popular' | 'trending';
export type FilterType = 'all' | 'following' | 'nfts' | 'tokens';

interface UseOptimizedFeedProps {
  feedType: FeedType;
  initialSort?: SortType;
  initialFilter?: FilterType;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
}

export const useOptimizedFeed = ({
  feedType,
  initialSort = 'newest',
  initialFilter = 'all',
  enableAutoRefresh = true,
  refreshInterval = 120000, // 2 Minuten
  pageSize = 20
}: UseOptimizedFeedProps) => {
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [adaptedPosts, setAdaptedPosts] = useState<ReturnType<typeof adaptPostForCardSync>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [sortType, setSortType] = useState<SortType>(initialSort);
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const postIdsRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<Date>(new Date());

  const fetchPosts = useCallback(async (checkForNew: boolean = false, reset: boolean = false) => {
    if (!profile || !isAuthenticated) return;
    
    try {
      if (!checkForNew) {
        if (reset) {
          setIsLoading(true);
          setPage(1);
          postIdsRef.current = new Set();
        }
      }
      setError(null);
      
      
      const fetchedPosts = await postRepository.getFeedPosts(feedType, profile.id);
      
      if (checkForNew) {
        const newPostIds = fetchedPosts
          .map(post => post.id)
          .filter(id => !postIdsRef.current.has(id));
        
        if (newPostIds.length > 0) {
          console.log(`[useOptimizedFeed] Found ${newPostIds.length} new posts`);
          setHasNewPosts(true);
        }
        
        return;
      }
      
      console.log(`[useOptimizedFeed] Fetched ${fetchedPosts.length} posts for feed type '${feedType}'`);
      
      if (reset) {
        setPosts(fetchedPosts);
        postIdsRef.current = new Set(fetchedPosts.map(post => post.id));
      } else {
        const newPosts = fetchedPosts.filter(post => !postIdsRef.current.has(post.id));
        
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          newPosts.forEach(post => postIdsRef.current.add(post.id));
        }
      }
      
      setHasNewPosts(false);
      setLastUpdated(new Date());
      lastCheckRef.current = new Date();
      
    } catch (err: any) {
      console.error('[useOptimizedFeed] Error fetching posts:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [feedType, profile, isAuthenticated]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setPage(prevPage => prevPage + 1);
    fetchPosts(false, false);
  }, [fetchPosts, isLoading, hasMore]);

  const refreshFeed = useCallback(() => {
    return fetchPosts(false, true);
  }, [fetchPosts]);

  const changeFeedType = useCallback((newFeedType: FeedType) => {
    if (feedType === newFeedType) return;
    
    setIsLoading(true);
    setPosts([]);
    setFilteredPosts([]);
    setAdaptedPosts([]);
    setPage(1);
    postIdsRef.current = new Set();
    setHasMore(true);
  }, [feedType]);

  useEffect(() => {
    if (posts.length > 0 && profile) {
      let filtered = [...posts];
      
      if (filterType === 'nfts' || feedType === 'nfts') {
        filtered = filtered.filter(isNFTRelatedPost);
      } else if (filterType === 'tokens' || feedType === 'tokens') {
        filtered = filtered.filter(isTokenRelatedPost);
      } else if (filterType === 'following' && profile) {
        const userFollowing: string[] = (profile as any).following || [];
        filtered = filtered.filter(post => 
          userFollowing.includes(post.author_id) || post.author_id === profile.id
        );
      }
      
      if (sortType === 'newest') {
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortType === 'popular') {
        filtered = filtered.sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        );
      } else if (sortType === 'trending') {
        filtered = filtered.sort((a, b) => 
          ((b.comments_count || 0) + (b.likes_count || 0) + (b.shares_count || 0)) - 
          ((a.comments_count || 0) + (a.likes_count || 0) + (a.shares_count || 0))
        );
      }
      
      setFilteredPosts(filtered);
      setAdaptedPosts(filtered.map(post => adaptPostForCardSync(post, profile.id)));
    } else {
      setFilteredPosts([]);
      setAdaptedPosts([]);
    }
  }, [posts, sortType, filterType, profile, feedType]);

  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated || profileLoading) return;
    
    const checkNewPostsTimer = setInterval(() => {
      const now = new Date();
      const timeSinceLastCheck = now.getTime() - lastCheckRef.current.getTime();
      
      if (timeSinceLastCheck > 30000) {
        console.log('[useOptimizedFeed] Checking for new posts...');
        fetchPosts(true);
        lastCheckRef.current = now;
      }
    }, refreshInterval / 2);
    
    return () => clearInterval(checkNewPostsTimer);
  }, [enableAutoRefresh, refreshInterval, fetchPosts, isAuthenticated, profileLoading]);

  useEffect(() => {
    if (!profileLoading && isAuthenticated) {
      fetchPosts(false, true);
    }
  }, [fetchPosts, isAuthenticated, profileLoading]);

  useEffect(() => {
    if (feedType === 'recent') {
      setSortType('newest');
    } else if (feedType === 'popular') {
      setSortType('popular');
    }
    
    if (feedType === 'nfts') {
      setFilterType('nfts');
    } else if (feedType === 'tokens') {
      setFilterType('tokens');
    } else {
      setFilterType('all');
    }
  }, [feedType]);

  return {
    posts,
    filteredPosts,
    adaptedPosts,
    isLoading,
    error,
    hasMore,
    lastUpdated,
    hasNewPosts,
    setHasNewPosts,
    sortType,
    setSortType,
    filterType,
    setFilterType,
    fetchPosts,
    refreshFeed,
    loadMore,
    changeFeedType,
    profile,
    isAuthenticated,
    profileLoading
  };
};
