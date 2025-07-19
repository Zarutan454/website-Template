
import * as React from 'react';
import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useTheme } from '@/components/ThemeProvider.utils';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// Import unserer optimierten Komponenten
import PostRenderer from './OptimizedFeed/PostRenderer';
import ErrorMessage from './OptimizedFeed/ErrorMessage';
import FeedLoadingSkeleton from './OptimizedFeed/FeedLoadingSkeleton';
import NetworkStatusMessage from './OptimizedFeed/NetworkStatusMessage';
import ScrollToTopButton from './ScrollToTopButton';
import LoadMoreTrigger from './OptimizedFeed/LoadMoreTrigger';
import ScrollOptimizer from './OptimizedFeed/ScrollOptimizer';
import ErrorBoundary from './ErrorBoundary';

interface Post {
  id: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  media_url?: string;
  image_url?: string;
  media_type?: string;
  video_url?: string;
  author?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

interface VirtualizedFeedListProps {
  posts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  onLike: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<unknown>;
  onGetComments: (postId: string) => Promise<unknown[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  showMiningRewards: boolean;
  currentUser?: unknown;
  error?: Error | null;
  onRetry?: () => void;
}

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
  showMiningRewards,
  currentUser,
  error,
  onRetry
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { isOnline } = useNetworkStatus();
  
  // Refs für Virtualisierung und Scroll-Position
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const feedIdRef = useRef<string>(`feed-${Date.now()}`);
  
  // State für Performance-Optimierung
  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
  const [preloadedPostIds, setPreloadedPostIds] = useState<Set<string>>(new Set());
  const [postHeights, setPostHeights] = useState<Map<string, number>>(new Map());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  
  // Device Capabilities Detection
  const deviceCapabilities = useMemo(() => ({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    hasTouch: 'ontouchstart' in window,
    hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }), []);

  // Virtualizer Setup
  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      const post = posts[index];
      if (!post) return 400; // Default height
      
      // Verwende gespeicherte Höhe oder schätze basierend auf Content
      const savedHeight = postHeights.get(post.id);
      if (savedHeight) return savedHeight;
      
      // Schätze Höhe basierend auf Content-Länge und Media
      let estimatedHeight = 200; // Base height
      if (post.content) {
        estimatedHeight += Math.ceil(post.content.length / 100) * 20;
      }
      if (post.media_url || post.image_url || post.video_url) {
        estimatedHeight += 300;
      }
      if (post.commentsCount > 0) {
        estimatedHeight += 100;
      }
      
      return Math.min(estimatedHeight, 800); // Max height
    }, [posts, postHeights]),
    overscan: 5, // Anzahl der zusätzlichen Items zum Vorabladen
    scrollPaddingEnd: 100, // Padding am Ende für Load More
  });

  // Scroll Event Handler mit Throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const scrollHeight = event.currentTarget.scrollHeight;
    const clientHeight = event.currentTarget.clientHeight;
    
    // Show/hide scroll to top button
    setShowScrollTop(scrollTop > 500);
    
    // Load more when near bottom
    if (hasMore && !isLoading && scrollTop + clientHeight >= scrollHeight - 200) {
      onLoadMore();
    }
    
    // Update visible posts for performance
    const visibleItems = rowVirtualizer.getVirtualItems();
    const newVisibleIds = new Set(visibleItems.map(item => posts[item.index]?.id).filter(Boolean));
    setVisiblePostIds(newVisibleIds);
    
    // Preload next items
    const preloadIds = new Set<string>();
    visibleItems.forEach(item => {
      const post = posts[item.index];
      if (post) {
        preloadIds.add(post.id);
        // Preload next few items
        for (let i = 1; i <= 3; i++) {
          const nextPost = posts[item.index + i];
          if (nextPost) preloadIds.add(nextPost.id);
        }
      }
    });
    setPreloadedPostIds(preloadIds);
    
    setLastScrollTop(scrollTop);
  }, [hasMore, isLoading, onLoadMore, rowVirtualizer, posts]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    parentRef.current?.scrollTo({
      top: 0,
      behavior: deviceCapabilities.hasReducedMotion ? 'auto' : 'smooth'
    });
  }, [deviceCapabilities.hasReducedMotion]);

  // Height measurement callback
  const measurePostHeight = useCallback((postId: string, height: number) => {
    setPostHeights(prev => {
      const newHeights = new Map(prev);
      newHeights.set(postId, height);
      return newHeights;
    });
  }, []);

  // Error handling
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('VirtualizedFeedList error:', error, errorInfo);
    toast.error('Ein Fehler ist aufgetreten beim Laden der Beiträge');
  }, []);

  // Network status effect
  useEffect(() => {
    if (!isOnline) {
      toast.error('Keine Internetverbindung');
    }
  }, [isOnline]);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline && onRetry) {
      onRetry();
    }
  }, [isOnline, onRetry]);

  // Render error state
  if (error) {
    return (
      <ErrorBoundary onError={handleError}>
        <ErrorMessage 
          error={error} 
          onRetry={onRetry} 
          isDarkMode={isDarkMode}
        />
      </ErrorBoundary>
    );
  }

  // Render loading state
  if (isLoading && posts.length === 0) {
    return (
      <ErrorBoundary onError={handleError}>
        <FeedLoadingSkeleton isDarkMode={isDarkMode} />
      </ErrorBoundary>
    );
  }

  // Render empty state
  if (!isLoading && posts.length === 0) {
    return (
      <ErrorBoundary onError={handleError}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Keine Beiträge gefunden</h3>
          <p className="text-gray-500 mb-6">
            Schau später noch einmal vorbei oder folge anderen Benutzern, um mehr Beiträge zu sehen.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <ScrollOptimizer 
        onScroll={handleScroll}
        saveKey={feedIdRef.current}
        maxHeight="80vh"
        className="w-full"
      >
        <div
          aria-live="polite"
          data-testid="virtualized-feed-container"
        >
          {/* Network Status Message */}
          {!isOnline && (
            <NetworkStatusMessage 
              isOnline={isOnline} 
              isDarkMode={isDarkMode}
            />
          )}
          
          {/* Virtualized items container */}
          <div
            ref={parentRef}
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const post = posts[virtualRow.index];
              if (!post) return null;
              
              return (
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
                  onComment={onComment}
                  onGetComments={onGetComments}
                  onShare={onShare}
                  onReport={onReport}
                  onMeasureHeight={(height) => measurePostHeight(post.id, height)}
                />
              );
            })}
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
            show={showScrollTop} 
            onClick={scrollToTop} 
            labelVisible={!deviceCapabilities.isMobile} 
          />
        </div>
      </ScrollOptimizer>
    </ErrorBoundary>
  );
};

export default VirtualizedFeedList;

