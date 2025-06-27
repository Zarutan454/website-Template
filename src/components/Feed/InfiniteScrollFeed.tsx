import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './Post/PostCard';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface InfiniteScrollFeedProps {
  posts: any[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLike: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onLoadMore: () => Promise<void>;
  onRetry: () => void;
  onLoginRedirect: () => void;
  isDarkMode: boolean;
  showMiningRewards?: boolean;
  currentUser?: any;
  currentUserId?: string;
}

const InfiniteScrollFeed: React.FC<InfiniteScrollFeedProps> = ({
  posts,
  isLoading,
  error,
  hasMore,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onLoadMore,
  onRetry,
  onLoginRedirect,
  isDarkMode,
  showMiningRewards = false,
  currentUser,
  currentUserId
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer für Load More Trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Automatisches Laden beim Scrollen
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      handleLoadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Spinner size="lg" />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Beiträge werden geladen...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className={`h-12 w-12 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {error}
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className={`text-6xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
          📝
        </div>
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Noch keine Beiträge
        </h3>
        <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Sei der Erste, der einen Beitrag erstellt!
        </p>
        <Button onClick={onLoginRedirect} variant="default">
          Jetzt beitreten
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3, 
              delay: Math.min(index * 0.05, 0.5) // Max 0.5s delay
            }}
            className="w-full"
          >
            <PostCard
              post={post}
              onLike={() => onLike(post.id)}
              onDelete={onDelete ? () => onDelete(post.id) : undefined}
              onComment={(content) => onComment(post.id, content)}
              onGetComments={() => onGetComments(post.id)}
              onShare={() => onShare(post.id)}
              onReport={onReport ? (reason) => onReport(post.id, reason) : undefined}
              darkMode={isDarkMode}
              currentUserId={currentUserId}
              currentUser={currentUser}
              showMiningRewards={showMiningRewards}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isLoadingMore && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Weitere Beiträge werden geladen...
            </span>
          </div>
        )}
        
        {!isLoadingMore && hasMore && (
          <Button 
            onClick={handleLoadMore} 
            variant="outline" 
            size="sm"
            className="text-sm"
          >
            Weitere Beiträge laden
          </Button>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            🎉 Du hast alle Beiträge gesehen!
          </div>
        )}
      </div>

      {/* Initial Loading Indicator */}
      {isLoading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollFeed; 
