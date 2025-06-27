
import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import FeedListItem from './FeedListItem';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import FeedLoading from './FeedLoading';
import { useTheme } from '@/components/ThemeProvider';

interface VirtualizedFeedListProps {
  posts: any[];
  profile: any;
  isLoading: boolean;
  error: Error | null;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onDeleteComment?: (commentId: string) => Promise<boolean>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport: (postId: string, reason: string) => Promise<boolean>;
  onRetry: () => void;
  onLoginRedirect?: () => void;
  showMiningRewards?: boolean;
  isDarkMode?: boolean; // Make isDarkMode optional
}

const VirtualizedFeedList: React.FC<VirtualizedFeedListProps> = ({
  posts,
  profile,
  isLoading,
  error,
  onLike,
  onDelete,
  onComment,
  onDeleteComment,
  onGetComments,
  onShare,
  onReport,
  onRetry,
  onLoginRedirect,
  showMiningRewards = true,
  isDarkMode: propsDarkMode
}) => {
  const { theme } = useTheme();
  // Use propsDarkMode if provided, otherwise determine from theme context
  const effectiveDarkMode = propsDarkMode !== undefined ? propsDarkMode : theme === 'dark';
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated height of each post
    overscan: 5, // Number of items to render outside of the viewport
  });

  // Ensure parent element has height
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.style.height = `${virtualizer.getTotalSize()}px`;
    }
  }, [posts.length, virtualizer.getTotalSize]);

  if (isLoading) {
    return <FeedLoading />;
  }

  if (error) {
    return <FeedError message={error.message} onRetry={onRetry} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <FeedEmpty
        darkMode={effectiveDarkMode}
        onCreatePost={() => {
          if (!profile && onLoginRedirect) {
            onLoginRedirect();
          }
        }}
      />
    );
  }

  return (
    <motion.div
      ref={parentRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 max-h-[calc(100vh-200px)] overflow-auto relative feed-scroll-container hide-scrollbar"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const post = posts[virtualItem.index];
          return (
            <div
              key={post.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <FeedListItem
                key={`post-${post.id}`}
                post={post}
                index={virtualItem.index}
                profile={profile}
                onLike={onLike}
                onDelete={onDelete}
                onComment={onComment}
                onDeleteComment={onDeleteComment}
                onGetComments={onGetComments}
                onShare={onShare}
                onReport={onReport}
                isDarkMode={effectiveDarkMode}
                showMiningRewards={showMiningRewards}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default VirtualizedFeedList;
