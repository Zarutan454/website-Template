import React from 'react';
import FeedSkeletonLoader from '../FeedSkeletonLoader';
import FeedError from '../FeedError';
import VirtualizedFeed from '../VirtualizedFeed';
import PostCard from '../PostCard'; // Korrekter Default-Import
import { ProfileData } from '@/types/profile';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText } from 'lucide-react';
import { Post as FrontendPost } from '@/types/post';
import { Comment } from '@/lib/django-api-new';

interface FeedStateRendererProps {
  isLoading: boolean;
  error: Error | null;
  posts: FrontendPost[];
  profile: ProfileData | null;
  isEmpty: boolean;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<Comment | null>;
  onGetComments: (postId: string) => Promise<Comment[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onRetry: () => void;
  onLoginRedirect: () => void;
  isDarkMode: boolean;
  showMiningRewards: boolean;
}

/**
 * Zentrale Komponente zur Darstellung des Feeds abhängig vom aktuellen Status (Laden, Fehler, leer, etc.)
 * Vereinheitlicht die Darstellung über alle Feed-Komponenten hinweg
 */
export const FeedStateRenderer: React.FC<FeedStateRendererProps> = ({
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
  showMiningRewards
}) => {
  // Fehler-Zustand anzeigen
  if (error) {
    return (
      <FeedError
        message={error.message}
        onRetry={onRetry}
        retryText="Erneut versuchen"
      />
    );
  }

  // Lade-Zustand anzeigen
  if (isLoading) {
    return <FeedSkeletonLoader count={5} darkMode={isDarkMode} />;
  }

  // Leerer Zustand anzeigen
  if (isEmpty) {
    return (
      <EmptyState
        title="Keine Beiträge gefunden"
        description="Versuche einen anderen Filter oder komm später wieder."
        icon={<FileText className="h-10 w-10" />}
        action={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        }
        className="py-10"
      />
    );
  }

  // Liste der Posts anzeigen
  return (
    <VirtualizedFeed
      posts={posts}
      currentUser={profile}
      currentUserId={profile?.id?.toString()}
      isLoading={isLoading}
      error={error}
      showMiningRewards={showMiningRewards}
      onLike={onLike}
      onDelete={onDelete}
      onComment={onComment}
      onGetComments={onGetComments}
      onShare={onShare}
      onReport={onReport}
      onRetry={onRetry}
      onLoginRedirect={onLoginRedirect}
    />
  );
};

// Export default for compatibility
export default FeedStateRenderer;
