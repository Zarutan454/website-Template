import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useUnifiedFeedData } from '@/hooks/feed/useUnifiedFeedData';
import VirtualizedFeedList from './VirtualizedFeedList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FeedFilterOptimized from '../FeedFilterOptimized';
import CreatePostBoxFacebook from '../../CreatePostBoxFacebook';
import { UiFilterType } from '@/hooks/feed/useFilterControl';
import { interactionRepository } from '@/repositories/InteractionRepository';
import { commentRepository } from '@/repositories/CommentRepository';
import { postRepository } from '@/repositories/PostRepository';
import { useMining } from '@/hooks/useMining';
import { RotateCw, AlertCircle } from 'lucide-react';

interface OptimizedFeedContainerProps {
  feedType: FeedType;
  showFilters?: boolean;
  showMiningRewards?: boolean;
  showCreateBox?: boolean;
  title?: string;
  description?: string;
  onOpenCreateModal?: () => void;
}

/**
 * Leistungsoptimierter Feed-Container mit virtualisiertem Scrollen und 
 * effizienter Datenverwaltung
 */
const OptimizedFeedContainer: React.FC<OptimizedFeedContainerProps> = ({
  feedType,
  showFilters = true,
  showMiningRewards = false,
  showCreateBox = true,
  title,
  description,
  onOpenCreateModal
}) => {
  const navigate = useNavigate();
  const { recordActivity, isMining } = useMining();
  const [selectedFilter, setSelectedFilter] = useState<UiFilterType | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const {
    adaptedPosts,
    isLoading,
    error,
    hasMore,
    hasNewPosts,
    setHasNewPosts,
    isRefreshing,
    loadMore,
    refreshFeed,
    profile,
    isAuthenticated
  } = useUnifiedFeedData({
    feedType,
    selectedFilter,
    enableAutoRefresh: true,
    pageSize: 15,
    onNewPostsAvailable: (hasNew) => {
    }
  });
  
  const handleLikePost = useCallback(async (postId: string) => {
    if (!isAuthenticated || !profile?.id) {
      toast.error("Bitte melde dich an, um Beiträge zu liken");
      return false;
    }
    
    try {
      const result = await interactionRepository.togglePostLike(profile.id, postId);
      
      if (result.success && showMiningRewards && isMining && result.isLiked) {
        await recordActivity('like', 5, 0.5);
      }
      
      return result.isLiked;
    } catch (error) {
      return false;
    }
  }, [isAuthenticated, profile, showMiningRewards, isMining, recordActivity]);
  
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    if (!isAuthenticated || !profile?.id) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return null;
    }
    
    try {
      const result = await commentRepository.createComment(profile.id, postId, content);
      
      if (result && showMiningRewards && isMining) {
        await recordActivity('comment', 10, 1);
      }
      
      return result;
    } catch (error) {
      return null;
    }
  }, [isAuthenticated, profile, showMiningRewards, isMining, recordActivity]);
  
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return await commentRepository.getPostComments(postId);
    } catch (error) {
      return [];
    }
  }, []);
  
  const handleDeletePost = useCallback(async (postId: string) => {
    if (!isAuthenticated || !profile?.id) {
      toast.error("Bitte melde dich an, um Beiträge zu löschen");
      return false;
    }
    
    try {
      const success = await postRepository.deletePost(postId);
      
      if (success) {
        toast.success("Beitrag erfolgreich gelöscht");
        refreshFeed();
      }
      
      return success;
    } catch (error) {
      return false;
    }
  }, [isAuthenticated, profile, refreshFeed]);
  
  const handleSharePost = useCallback(async (postId: string) => {
    if (!isAuthenticated || !profile?.id) {
      toast.error("Bitte melde dich an, um Beiträge zu teilen");
      return false;
    }
    
    try {
      const shareResult = await interactionRepository.sharePost(postId);
      
      if (shareResult) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
        
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
      }
      
      return shareResult;
    } catch (error) {
      return false;
    }
  }, [isAuthenticated, profile, showMiningRewards, isMining, recordActivity]);
  
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    if (!isAuthenticated || !profile?.id) {
      toast.error("Bitte melde dich an, um Beiträge zu melden");
      return false;
    }
    
    try {
      const result = await interactionRepository.reportPost(profile.id, postId, reason);
      
      if (result) {
        toast.success("Deine Meldung wurde erfolgreich übermittelt.");
      }
      
      return result;
    } catch (error) {
      return false;
    }
  }, [isAuthenticated, profile]);
  
  const handleFilterSelect = useCallback((filter: UiFilterType | null) => {
    setSelectedFilter(filter);
  }, []);
  
  const toggleFilters = useCallback(() => {
    setShowFilterMenu(prev => !prev);
  }, []);
  
  const handleCreatePost = useCallback(() => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um einen Beitrag zu erstellen");
      navigate('/login');
    }
  }, [onOpenCreateModal, isAuthenticated, navigate]);
  
  const handleRetry = useCallback(() => {
    refreshFeed();
    toast.info("Feed wird aktualisiert...");
  }, [refreshFeed]);
  
  if (error && !isLoading) {
    return (
      <Card className="p-6 my-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={40} className="text-red-500" />
          <h3 className="text-xl font-bold">Fehler beim Laden der Beiträge</h3>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={refreshFeed} variant="outline">
            <RotateCw className="mr-2 h-4 w-4" /> Erneut versuchen
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="mb-4">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      
      {showCreateBox && (
        <div className="mb-4">
          <CreatePostBoxFacebook onCreatePost={handleCreatePost} darkMode={isDarkMode} />
        </div>
      )}
      
      {/* Filter Section entfernt */}
      
      {hasNewPosts && (
        <div className="mb-4">
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => {
              setHasNewPosts(false);
              refreshFeed();
            }}
          >
            <RotateCw className="mr-2 h-4 w-4" /> Neue Beiträge anzeigen
          </Button>
        </div>
      )}
      
      <VirtualizedFeedList
        posts={adaptedPosts}
        isLoading={isLoading || isRefreshing}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        onComment={handleCreateComment}
        onGetComments={handleGetComments}
        onShare={handleSharePost}
        onReport={handleReportPost}
        showMiningRewards={showMiningRewards && isMining}
        currentUser={profile}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default OptimizedFeedContainer;
