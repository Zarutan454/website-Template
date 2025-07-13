import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTheme } from '@/components/ThemeProvider';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Post } from '@/types/post';

// Import unserer optimierten Komponenten
import PostRenderer from './PostRenderer';
import ErrorMessage from './ErrorMessage';
import FeedLoadingSkeleton from './FeedLoadingSkeleton';
import NetworkStatusMessage from './NetworkStatusMessage';
import ScrollToTopButton from './ScrollToTopButton';
import LoadMoreTrigger from './LoadMoreTrigger';
import ScrollOptimizer from './ScrollOptimizer';

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface FeedComment {
  id: string;
  content: string;
  author: User;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  author_id?: string; // Optional für Kompatibilität
}

interface VirtualizedFeedListProps {
  posts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<FeedComment>;
  onGetComments: (postId: string) => Promise<FeedComment[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  showMiningRewards?: boolean;
  currentUser: User;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Optimierte virtualisierte Liste für Feed-Posts mit verbesserter Wartbarkeit und Performance
 */
const VirtualizedFeedList: React.FC<VirtualizedFeedListProps> = ({
  posts,
  isLoading,
  hasMore,
  onLoadMore,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  showMiningRewards = false,
  currentUser,
  error,
  onRetry
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
  const [preloadedPostIds, setPreloadedPostIds] = useState<Set<string>>(new Set());
  const feedIdRef = useRef(`feed-${Date.now()}`);
  
  // Verwende unseren verbesserten Netzwerkstatus-Hook
  const { status: networkStatus, isOffline, attemptReconnection } = useNetworkStatus();
  
  // Verwende useInView für Infinite Scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });
  
  // Optimierte Leistungseinstellungen basierend auf Gerätekapazitäten
  const deviceCapabilities = useMemo(() => {
    return {
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      isLowEnd: typeof navigator !== 'undefined' ? 
        navigator.hardwareConcurrency < 4 || 
        false : false,
      isReducedMotionPreferred: typeof window !== 'undefined' ? 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
    };
  }, []);
  
  // Adaptive overscan basierend auf der Geräteleistung
  const getOptimalOverscan = useCallback(() => {
    if (deviceCapabilities.isLowEnd) return 2;
    if (deviceCapabilities.isMobile) return 3;
    return 5;
  }, [deviceCapabilities]);
  
  // Post-Höhen-Cache für stabilere Virtualisierung
  const postHeightCache = useRef<Record<string, number>>({});
  
  // TanStack Virtualizer-Konfiguration mit verbessertem estimateSize
  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => document.querySelector('[data-testid="scroll-optimizer"]'),
    estimateSize: useCallback((index) => {
      const post = posts[index];
      if (!post) return 350; // Fallback
      
      // Verwende gespeicherte Höhe falls verfügbar
      if (postHeightCache.current[post.id]) {
        return postHeightCache.current[post.id];
      }
      
      // Schätze Höhe basierend auf Inhalt
      let estimatedHeight = 180; // Grundhöhe
      
      // Zusätzliche Höhe für längeren Content
      if (post.content) {
        const contentLength = post.content.length;
        if (contentLength > 280) estimatedHeight += 60;
        if (contentLength > 500) estimatedHeight += 40;
      }
      
      // Zusätzliche Höhe für Medien
      if (post.image_url) {
        estimatedHeight += 300;
      }
      
      // Zusätzliche Höhe für Video/YouTube
      if (post.content?.includes('youtube.com')) {
        estimatedHeight += 350;
      }
      
      // Mobile Anpassung
      if (deviceCapabilities.isMobile) {
        estimatedHeight += 50;
      }
      
      return estimatedHeight;
    }, [posts, deviceCapabilities]),
    overscan: getOptimalOverscan(),
    scrollMargin: 0
  });
  
  // Optimierung: Speichere tatsächliche Post-Höhen wenn sie gemessen werden können
  const measurePostHeight = useCallback((postId: string, height: number) => {
    if (height > 0 && postHeightCache.current[postId] !== height) {
      postHeightCache.current = { ...postHeightCache.current, [postId]: height };
    }
  }, []);
  
  // Track visible posts - Optimierte Version mit Debouncing
  const trackVisiblePostsDebounced = useCallback((scrollY: number) => {
    if (!posts.length) return;
    
    const currentlyVisible = new Set<string>();
    const shouldPreload = new Set<string>();
    
    rowVirtualizer.getVirtualItems().forEach(virtualRow => {
      const post = posts[virtualRow.index];
      if (post?.id) {
        currentlyVisible.add(post.id);
        
        // Intelligenteres Preload-Fenster basierend auf Scroll-Richtung und Geschwindigkeit
        const preloadWindow = scrollY > (rowVirtualizer as { scrollOffset: number }).scrollOffset ? 5 : 2;
        for (let i = 1; i <= preloadWindow; i++) {
          const preloadIndex = virtualRow.index + i;
          if (preloadIndex < posts.length) {
            const preloadPost = posts[preloadIndex];
            if (preloadPost?.id) {
              shouldPreload.add(preloadPost.id);
            }
          }
        }
      }
    });
    
    // Update visible posts only when they change - mit Set-Vergleich
    const hasVisibleChanged = !areSetsEqual(visiblePostIds, currentlyVisible);
    if (hasVisibleChanged) {
      setVisiblePostIds(new Set(currentlyVisible));
    }
    
    // Update preloaded posts - mit Set-Vergleich
    const hasPreloadChanged = !areSetsEqual(preloadedPostIds, shouldPreload);
    if (hasPreloadChanged) {
      setPreloadedPostIds(new Set(shouldPreload));
    }
  }, [posts, rowVirtualizer, visiblePostIds, preloadedPostIds]);
  
  // Debounced trackVisiblePosts für bessere Performance
  const debouncedTrackRef = useRef<NodeJS.Timeout | null>(null);
  const trackVisiblePosts = useCallback((scrollY: number) => {
    if (debouncedTrackRef.current) {
      clearTimeout(debouncedTrackRef.current);
    }
    debouncedTrackRef.current = setTimeout(() => {
      trackVisiblePostsDebounced(scrollY);
    }, 50); // 50ms Debounce für flüssigeres Scrolling
  }, [trackVisiblePostsDebounced]);
  
  // Cleanup für Debounce-Timer
  useEffect(() => {
    return () => {
      if (debouncedTrackRef.current) {
        clearTimeout(debouncedTrackRef.current);
      }
    };
  }, []);
  
  // Helper function to compare sets
  const areSetsEqual = (a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    for (const item of a) if (!b.has(item)) return false;
    return true;
  };
  
  // Load more posts when reaching the bottom - mit verbesserten Schutz gegen multiple Aufrufe
  const loadMoreTriggeredRef = useRef(false);
  
  useEffect(() => {
    if (inView && hasMore && !isLoading && networkStatus === 'online' && !loadMoreTriggeredRef.current) {
      loadMoreTriggeredRef.current = true;
      onLoadMore();
      
      // Reset Trigger nach kurzer Verzögerung
      setTimeout(() => {
        loadMoreTriggeredRef.current = false;
      }, 1000);
    }
  }, [inView, hasMore, isLoading, onLoadMore, networkStatus]);
  
  // Handle scroll events using our ScrollOptimizer component
  const handleScroll = useCallback((scrollY: number) => {
    // Show/hide scroll-to-top button
    setShowScrollTop(scrollY > 800);
    
    // Update visible posts periodically
    trackVisiblePosts(scrollY);
  }, [trackVisiblePosts]);
  
  // Handle network retry
  const handleNetworkRetry = useCallback(async () => {
    if (onRetry) {
      await attemptReconnection(onRetry);
    }
  }, [onRetry, attemptReconnection]);
  
  // Memoized virtual items to prevent unnecessary re-renders
  const virtualItems = useMemo(() => {
    return rowVirtualizer.getVirtualItems().map(virtualRow => {
      const post = posts[virtualRow.index];
      return { virtualRow, post };
    });
  }, [rowVirtualizer, posts]);

  // Scroll to top function - moved before conditional returns
  const scrollToTop = useCallback(() => {
    const scrollElement = document.querySelector('[data-testid="scroll-optimizer"]');
    if (scrollElement) {
      scrollElement.scrollTo({
        top: 0,
        behavior: deviceCapabilities.isReducedMotionPreferred ? 'auto' : 'smooth'
      });
      console.log("[VirtualizedFeedList] User scrolled to top");
      toast.success("Zum Anfang gescrollt", {
        duration: 1500,
        position: "bottom-right"
      });
    }
  }, [deviceCapabilities.isReducedMotionPreferred]);

  // Error state
  if (error) {
    return <ErrorMessage error={error} onRetry={onRetry} />;
  }
  
  // Offline state
  if (isOffline) {
    return <NetworkStatusMessage status={networkStatus} onRetry={handleNetworkRetry} />;
  }
  
  // Initial loading state
  if (!posts.length && isLoading) {
    return <FeedLoadingSkeleton count={3} darkMode={isDarkMode} />;
  }
  
  return (
    <ScrollOptimizer 
      onScroll={handleScroll}
      saveKey={feedIdRef.current}
      maxHeight="80vh"
      className="w-full"
    >
      <div
        data-testid="virtualized-feed-container"
      >
        {/* Virtualized items container */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map(({ virtualRow, post }) => (
            <PostRenderer
              key={post.id}
              virtualRow={virtualRow}
              post={post}
              isVisible={visiblePostIds.has(post.id)}
              shouldPreload={preloadedPostIds.has(post.id)}
              isDarkMode={isDarkMode}
              showMiningRewards={showMiningRewards}
              currentUser={currentUser}
              onLike={onLike}
              onDelete={onDelete}
              onComment={onComment as any}
              onGetComments={onGetComments as any}
              onShare={onShare}
              onReport={onReport}
              onMeasureHeight={(height) => measurePostHeight(post.id, height)}
            />
          ))}
        </div>
        
        {/* Load more trigger */}
        <LoadMoreTrigger
          hasMore={hasMore}
          isLoading={isLoading}
          postsCount={posts.length}
          onLoadMore={onLoadMore}
          loadMoreRef={loadMoreRef}
          showMinimalVersion={deviceCapabilities.isMobile}
        />
        
        {/* Scroll to top button */}
        <ScrollToTopButton 
          visible={showScrollTop} 
          onClick={scrollToTop} 
          showLabel={!deviceCapabilities.isMobile} 
        />
      </div>
    </ScrollOptimizer>
  );
};

export default VirtualizedFeedList;
