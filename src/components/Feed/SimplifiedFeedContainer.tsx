
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useFeedData } from '@/hooks/feed/useFeedData';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import SimplifiedFeed from './SimplifiedFeed';
import { FeedLayout } from './FeedLayout';
import { toast } from 'sonner';

interface SimplifiedFeedContainerProps {
  feedType: FeedType;
  showFilters?: boolean;
  showHeader?: boolean;
  showMiningRewards?: boolean;
  showCreateBox?: boolean;
  title?: string;
  description?: string;
}

/**
 * Container-Komponente für SimplifiedFeed, die alle notwendigen Daten und Aktionen bereitstellt
 */
const SimplifiedFeedContainer: React.FC<SimplifiedFeedContainerProps> = ({
  feedType,
  showFilters = true,
  showHeader = true,
  showMiningRewards = false,
  showCreateBox = true,
  title,
  description
}) => {
  const navigate = useNavigate();
  const { selectedFilter } = useFilterControl();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Feed-Daten abrufen
  const {
    adaptedPosts, 
    isLoading, 
    error,
    likePost,
    deletePost,
    createComment,
    getPostComments,
    sharePost,
    hasNewPosts,
    refreshFeed
  } = useFeedData({
    feedType,
    selectedFilter,
    enableAutoRefresh: true,
    onNewPostsAvailable: (hasNew) => {
    }
  });
  
  // Handler für verschiedene Post-Aktionen
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      return await likePost(postId);
    } catch (error) {
      toast.error('Fehler beim Liken des Beitrags');
      return false;
    }
  }, [likePost]);
  
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      return await deletePost(postId);
    } catch (error) {
      toast.error('Fehler beim Löschen des Beitrags');
      return false;
    }
  }, [deletePost]);
  
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    try {
      return await createComment({ post_id: postId, content });
    } catch (error) {
      toast.error('Fehler beim Erstellen des Kommentars');
      return null;
    }
  }, [createComment]);
  
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return await getPostComments(postId);
    } catch (error) {
      return [];
    }
  }, [getPostComments]);
  
  const handleSharePost = useCallback(async (postId: string) => {
    try {
      return await sharePost(postId);
    } catch (error) {
      toast.error('Fehler beim Teilen des Beitrags');
      return false;
    }
  }, [sharePost]);
  
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    try {
      toast.success('Beitrag wurde gemeldet');
      return true;
    } catch (error) {
      toast.error('Fehler beim Melden des Beitrags');
      return false;
    }
  }, []);
  
  // Feed aktualisieren
  const handleRefreshFeed = useCallback(async () => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    
    try {
      const result = await refreshFeed();
      return result;
    } catch (error) {
      return false;
    } finally {
      // Verzögerung zum Anzeigen des Ladezustands
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [isRefreshing, refreshFeed]);

  return (
    <FeedLayout>
      <div className="w-full max-w-6xl mx-auto px-4 pb-8">
        <SimplifiedFeed
          feedType={feedType}
          posts={adaptedPosts}
          isLoading={isLoading || isRefreshing}
          error={error}
          showFilters={showFilters}
          showHeader={showHeader}
          showMiningRewards={showMiningRewards}
          title={title}
          description={description}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
          onComment={handleCreateComment}
          onGetComments={handleGetComments}
          onShare={handleSharePost}
          onReport={handleReportPost}
          onRefresh={handleRefreshFeed}
          hasNewPosts={hasNewPosts}
          className="animate-in"
        />
      </div>
    </FeedLayout>
  );
};

export default SimplifiedFeedContainer;
