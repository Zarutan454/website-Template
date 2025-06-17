
import React, { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import PostCard from './Post/PostCard';
import FeedSkeletonLoader from './FeedSkeletonLoader';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import { useTheme } from '@/components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';

interface VirtualizedFeedProps {
  posts: any[];
  profile: any;
  isLoading: boolean;
  error: Error | null;
  showMiningRewards: boolean;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport: (postId: string, reason: string) => Promise<boolean>;
  onRetry: () => void;
  onLoginRedirect: () => void;
  isDarkMode?: boolean; // Make isDarkMode optional
}

const VirtualizedFeed: React.FC<VirtualizedFeedProps> = ({
  posts,
  profile,
  isLoading,
  error,
  showMiningRewards,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onRetry,
  onLoginRedirect,
  isDarkMode: propsDarkMode
}) => {
  const { theme } = useTheme();
  // Use propsDarkMode if provided, otherwise determine from theme context
  const effectiveDarkMode = propsDarkMode !== undefined ? propsDarkMode : theme === 'dark';
  const [mountedPosts, setMountedPosts] = useState<any[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);
  
  // Aktualisiere die Posts im State, wenn sich die Prop ändert
  useEffect(() => {
    if (!isLoading) {
      if (posts && posts.length > 0) {
        setMountedPosts(posts);
        setIsEmpty(false);
      } else {
        setMountedPosts([]);
        setIsEmpty(true);
      }
    }
  }, [posts, isLoading]);

  // Position für das Auto-Scrollen merken
  const [previousScrollPosition, setPreviousScrollPosition] = useState<number | null>(null);
  
  // Komponenten für verschiedene Zustände
  if (isLoading) {
    return <FeedSkeletonLoader count={5} darkMode={effectiveDarkMode} />;
  }

  if (error) {
    return (
      <FeedError 
        message={error.message} 
        onRetry={onRetry} 
      />
    );
  }

  if (isEmpty) {
    return (
      <FeedEmpty
        darkMode={effectiveDarkMode}
        onCreatePost={() => {
          if (!profile) {
            onLoginRedirect();
          }
        }}
      />
    );
  }

  // Footer-Element für die Liste
  const Footer = () => (
    <div className="py-6 text-center text-gray-500 text-sm">
      Du hast alle Beiträge gesehen 🎉
    </div>
  );

  // Wrappers for the PostCard event handlers that properly pass the post ID
  const handleLike = (post: any) => {
    return () => onLike(post.id);
  };

  const handleDelete = (post: any) => {
    return () => onDelete(post.id);
  };

  const handleComment = (post: any) => {
    return (content: string) => onComment(post.id, content);
  };

  const handleGetComments = (post: any) => {
    return () => onGetComments(post.id);
  };

  const handleShare = (post: any) => {
    return () => onShare(post.id);
  };

  const handleReport = (post: any) => {
    return (reason: string) => onReport(post.id, reason);
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Virtuoso
            style={{ height: 'calc(100vh - 250px)' }}
            className="hide-scrollbar" // Add hide-scrollbar class here
            data={mountedPosts}
            overscan={5}
            initialTopMostItemIndex={previousScrollPosition || 0}
            rangeChanged={(range) => {
              if (range.startIndex > 0) {
                setPreviousScrollPosition(range.startIndex);
              }
            }}
            components={{
              Footer
            }}
            itemContent={(index, post) => (
              <motion.div 
                className="mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  onLike={handleLike(post)}
                  onDelete={handleDelete(post)}
                  onComment={handleComment(post)}
                  onGetComments={handleGetComments(post)}
                  onShare={handleShare(post)}
                  onReport={handleReport(post)}
                  darkMode={effectiveDarkMode}
                  currentUserId={profile?.id}
                  showMiningRewards={showMiningRewards}
                />
              </motion.div>
            )}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VirtualizedFeed;
