import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './Post/PostCard';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface VirtualizedFeedProps {
  posts: any[];
  isLoading: boolean;
  error: string | null;
  onLike: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onRetry: () => void;
  onLoginRedirect: () => void;
  isDarkMode: boolean;
  showMiningRewards?: boolean;
  currentUser?: any;
  currentUserId?: string;
}

const VirtualizedFeed: React.FC<VirtualizedFeedProps> = ({
  posts,
  isLoading,
  error,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onRetry,
  onLoginRedirect,
  isDarkMode,
  showMiningRewards = false,
  currentUser,
  currentUserId
}) => {
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
    <div className="w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
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
          </div>
          {isLoading && posts.length > 0 && (
            <div className="flex justify-center py-4">
              <Spinner size="md" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VirtualizedFeed;
