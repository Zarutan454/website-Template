
import React from 'react';
import { motion } from 'framer-motion';
import FeedListItem from './FeedListItem';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import FeedLoading from './FeedLoading';
import { useTheme } from '@/components/ThemeProvider';

interface FeedListProps {
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
}

const FeedList: React.FC<FeedListProps> = ({
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
  showMiningRewards = true
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  if (isLoading) {
    return <FeedLoading />;
  }

  if (error) {
    return <FeedError message={error.message} onRetry={onRetry} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <FeedEmpty
        darkMode={isDarkMode}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {posts.map((post, index) => (
        <FeedListItem
          key={`post-${post.id}`}
          post={post}
          index={index}
          profile={profile}
          onLike={onLike}
          onDelete={onDelete}
          onComment={onComment}
          onDeleteComment={onDeleteComment}
          onGetComments={onGetComments}
          onShare={onShare}
          onReport={onReport}
          isDarkMode={isDarkMode}
          showMiningRewards={showMiningRewards}
        />
      ))}
    </motion.div>
  );
};

export default FeedList;
