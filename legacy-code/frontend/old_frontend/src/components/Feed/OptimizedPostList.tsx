
import React from 'react';
import { motion } from 'framer-motion';
import { TooltipProvider } from "@/components/ui/tooltip";
import PostCard from './Post/PostCard';
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from '@/components/ThemeProvider';

interface OptimizedPostListProps {
  posts: any[];
  currentUser: any;
  isLoading: boolean;
  error: Error | null;
  onLike: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onDelete?: (postId: string) => Promise<boolean>;
  onGetComments?: (postId: string) => Promise<any[]>;
  onShare?: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onRetry?: () => void;
  onLoginRedirect?: () => void;
  isDarkMode?: boolean;
  showMiningRewards?: boolean;
  loadingMore?: boolean;
  autoRefresh?: boolean; 
}

const OptimizedPostList: React.FC<OptimizedPostListProps> = ({
  posts,
  currentUser,
  isLoading,
  error,
  onLike,
  onComment,
  onDelete,
  onGetComments,
  onShare,
  onReport,
  onRetry,
  onLoginRedirect,
  isDarkMode: propsDarkMode,
  showMiningRewards = false,
  loadingMore = false,
  autoRefresh = false 
}) => {
  const { theme } = useTheme();
  // Use propsDarkMode if provided, otherwise determine from theme context
  const effectiveDarkMode = propsDarkMode !== undefined ? propsDarkMode : theme === 'dark';

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={`post-${post.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: Math.min(index * 0.05, 0.5)
            }}
            className="w-full"
          >
            <PostCard
              post={post}
              onLike={() => onLike(post.id)}
              onDelete={onDelete ? () => onDelete(post.id) : undefined}
              onComment={(content) => onComment(post.id, content)}
              onGetComments={onGetComments ? () => onGetComments(post.id) : async () => []}
              onShare={onShare ? () => onShare(post.id) : async () => false}
              onReport={onReport ? (reason) => onReport(post.id, reason) : undefined}
              darkMode={effectiveDarkMode}
              currentUserId={currentUser?.id}
              currentUser={currentUser}
              showMiningRewards={showMiningRewards}
            />
          </motion.div>
        ))}
        
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Spinner size="md" />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default OptimizedPostList;
