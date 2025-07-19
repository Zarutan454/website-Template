import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import UnifiedPostCard from './UnifiedPostCard';

interface Post {
  id: string;
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  content?: string;
  [key: string]: unknown;
}
interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}
interface VirtualizedFeedProps {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  onLike: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<unknown>;
  onGetComments: (postId: string) => Promise<unknown[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onRetry: () => void;
  onLoginRedirect: () => void;
  isDarkMode: boolean;
  showMiningRewards?: boolean;
  currentUser?: UserProfile;
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
  // Defensive: posts darf nie undefined/null sein
  const safePosts = Array.isArray(posts) ? posts : [];
  // Loading state
  if (isLoading && safePosts.length === 0) {
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
  if (safePosts.length === 0) {
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
      <div role="feed" aria-label="Beitragsliste">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-4">
              {safePosts.length > 0 ? (
                safePosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                    role="article"
                    aria-label={`Beitrag von ${post.author?.display_name || post.author?.username || 'Unbekannter Nutzer'}: ${post.content?.slice(0, 40) || ''}`}
                    tabIndex={0}
                  >
                    <UnifiedPostCard
                      post={post}
                      onLike={onLike}
                      onDelete={onDelete}
                      onComment={onComment}
                      onGetComments={onGetComments}
                      onShare={onShare}
                      onReport={onReport}
                      currentUser={currentUser}
                      currentUserId={currentUserId}
                      darkMode={isDarkMode}
                    />
                  </motion.div>
                ))
              ) : (
                <div role="article" aria-label="Noch keine Beiträge" tabIndex={0} style={{ display: 'none' }} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {isLoading && posts.length > 0 && (
        <div className="flex justify-center py-4" aria-live="polite" aria-busy="true">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
};

export default VirtualizedFeed;
