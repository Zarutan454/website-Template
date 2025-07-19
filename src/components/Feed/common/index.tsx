
import React from 'react';
import FeedLoading from '../FeedLoading';
import FeedError from '../FeedError';
import PostCard from '../Post/PostCard';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Komponente zum Anzeigen des Feed-Status (Laden, Fehler, leer oder Posts)
 */
export const FeedStateRenderer: React.FC<{
  isLoading: boolean;
  error: Error | null;
  posts: any[];
  profile: any;
  isEmpty: boolean;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport: (postId: string, reason: string) => Promise<boolean>;
  onRetry: () => void;
  onLoginRedirect: () => void;
  isDarkMode: boolean;
  showMiningRewards?: boolean;
}> = ({
  isLoading,
  error,
  posts,
  profile,
  isEmpty,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onRetry,
  onLoginRedirect,
  isDarkMode,
  showMiningRewards = false
}) => {
  if (isLoading) {
    return <FeedLoading />;
  }

  if (error) {
    const isAuthError = error.message.includes('anmelden') || error.message.includes('login');
    return (
      <FeedError 
        message={error.message || "Beim Laden der Beiträge ist ein Fehler aufgetreten"} 
        onRetry={isAuthError ? onLoginRedirect : onRetry}
        retryText={isAuthError ? "Zum Login" : "Erneut versuchen"}
      />
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Keine Beiträge gefunden</h3>
        <p className="text-gray-500 mb-6">
          Schau später noch einmal vorbei oder folge anderen Benutzern, um mehr Beiträge zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onDelete={onDelete}
          onComment={onComment}
          onGetComments={onGetComments}
          onShare={onShare}
          onReport={onReport}
          darkMode={isDarkMode}
          currentUserId={profile?.id}
          currentUser={profile}
          showMiningRewards={showMiningRewards}
        />
      ))}
    </div>
  );
};
