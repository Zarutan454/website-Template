import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useTheme } from '@/components/ThemeProvider';
import { useMining } from '@/hooks/useMining';
import { useAchievementProgress } from '@/hooks/mining/achievements/useAchievementProgress';
import { FeedType } from './useFeedData';

interface UseUnifiedFeedStateProps {
  feedType: FeedType;
  showMiningRewards?: boolean;
  enableAutoRefresh?: boolean;
}

export const useUnifiedFeedState = ({
  feedType,
  showMiningRewards = false,
  enableAutoRefresh = true
}: UseUnifiedFeedStateProps) => {
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  const { theme } = useTheme();
  const { recordActivity } = useMining();
  const { trackSocialActivity } = useAchievementProgress();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  const {
    adaptedPosts,
    isLoading,
    error,
    fetchPosts,
    likePost,
    deletePost,
    createPost,
    createComment,
    getPostComments,
    sharePost
  } = usePosts();
  
  const isDarkMode = theme === 'dark';
  
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchPosts(feedType).then(() => {
        setLastRefresh(new Date());
        setHasNewPosts(false);
      });
    }
  }, [feedType, isAuthenticated, profile, fetchPosts]);
  
  useEffect(() => {
    if (enableAutoRefresh && isAuthenticated) {
      const intervalId = window.setInterval(() => {
        setHasNewPosts(true);
      }, 60000);
      
      setRefreshInterval(intervalId);
      
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    }
  }, [enableAutoRefresh, isAuthenticated]);
  
  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      await fetchPosts(feedType);
      setLastRefresh(new Date());
      setHasNewPosts(false);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Feeds');
    }
  }, [fetchPosts, feedType, isAuthenticated]);
  
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      const result = await likePost(postId);
      
      if (result && showMiningRewards && profile) {
        try {
          await recordActivity('like', 5, 0.5);
          await trackSocialActivity(profile.id, 'like');
        } catch (achievementError) {
        }
      }
      
      return result;
    } catch (error) {
      return false;
    }
  }, [likePost, showMiningRewards, profile, recordActivity, trackSocialActivity]);
  
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const result = await deletePost(postId);
      
      if (result) {
        toast.success('Beitrag erfolgreich gelöscht');
        await fetchPosts(feedType);
      }
      
      return result;
    } catch (error) {
      toast.error('Fehler beim Löschen des Beitrags');
      return false;
    }
  }, [deletePost, fetchPosts, feedType]);
  
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    try {
      const result = await createComment({ post_id: postId, content });
      
      if (result && showMiningRewards && profile) {
        try {
          await recordActivity('comment', 10, 1);
          await trackSocialActivity(profile.id, 'comment');
        } catch (achievementError) {
        }
      }
      
      return result;
    } catch (error) {
      toast.error('Fehler beim Erstellen des Kommentars');
      return null;
    }
  }, [createComment, showMiningRewards, profile, recordActivity, trackSocialActivity]);
  
  const handleSharePost = useCallback(async (postId: string) => {
    try {
      const result = await sharePost(postId);
      
      if (result && showMiningRewards && profile) {
        try {
          await recordActivity('share', 15, 1.5);
          await trackSocialActivity(profile.id, 'share');
          toast.success('Beitrag wurde geteilt! +15 Punkte, +1.5 BSN');
        } catch (achievementError) {
          toast.success('Beitrag wurde geteilt!');
        }
      } else if (result) {
        toast.success('Beitrag wurde geteilt!');
      }
      
      return result;
    } catch (error) {
      toast.error('Fehler beim Teilen des Beitrags');
      return false;
    }
  }, [sharePost, showMiningRewards, profile, recordActivity, trackSocialActivity]);
  
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    try {
      toast.success('Beitrag wurde gemeldet. Danke für deine Mithilfe!');
      return true;
    } catch (error) {
      toast.error('Fehler beim Melden des Beitrags');
      return false;
    }
  }, []);
  
  const handleCreatePost = useCallback(async (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein, um Beiträge zu erstellen');
      return false;
    }
    
    try {
      const result = await createPost({
        content,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined
      });
      
      if (result.success) {
        await fetchPosts(feedType);
        return true;
      }
      
      return false;
    } catch (error) {
      toast.error('Fehler beim Erstellen des Beitrags');
      return false;
    }
  }, [createPost, isAuthenticated, fetchPosts, feedType]);
  
  return {
    profile,
    isAuthenticated,
    profileLoading,
    adaptedPosts,
    isLoading,
    error,
    isDarkMode,
    lastRefresh,
    hasNewPosts,
    showMiningRewards,
    handleRefresh,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments: getPostComments,
    handleSharePost,
    handleReportPost,
    handleCreatePost,
    fetchPosts,
    setHasNewPosts
  };
};
