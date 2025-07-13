import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDjangoFeed, type FeedType } from '@/hooks/feed/useDjangoFeed';
import { useTheme } from '@/components/ThemeProvider';
import { adaptApiPostToFrontendPost } from '@/utils/postAdapter';
import { Post as FrontendPost } from '@/types/post';
import { socialAPI } from '@/lib/django-api-new';
// import { useMining } from '@/hooks/useMining';
// import { useAchievementProgress } from '@/hooks/mining/achievements/useAchievementProgress';

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
  const { user, isAuthenticated, isLoading: profileLoading } = useAuth();
  const { theme } = useTheme();
  // const { recordActivity } = useMining();
  // const { trackSocialActivity } = useAchievementProgress();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  const {
    posts: apiPosts,
    isLoading,
    error,
    fetchPosts,
    toggleLike,
    deletePost,
    createPost,
    sharePost
  } = useDjangoFeed({
    feedType,
    enableAutoRefresh,
    refreshInterval: 120000
  });
  
  const isDarkMode = theme === 'dark';
  
  // Posts adaptieren
  const adaptedPosts: FrontendPost[] = apiPosts.map(adaptApiPostToFrontendPost);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPosts(1, false).then(() => {
        setLastRefresh(new Date());
        setHasNewPosts(false);
      });
    }
  }, [feedType, isAuthenticated, user, fetchPosts]);
  
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
      await fetchPosts(1, false);
      setLastRefresh(new Date());
      setHasNewPosts(false);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Feeds');

    }
  }, [fetchPosts, isAuthenticated]);
  
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      const result = await toggleLike(postId);
      
      if (result && showMiningRewards && user) {
        try {
          // await recordActivity('like');
          // await trackSocialActivity(user.id, 'like');
          console.log('Mining rewards temporarily disabled');
        } catch (achievementError) {
          console.warn('Achievement tracking failed:', achievementError);
        }
      }
      
      return result;
    } catch (error) {
      return false;
    }
  }, [toggleLike, showMiningRewards, user]);
  
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const result = await deletePost(postId);
      
      if (result) {
        toast.success('Beitrag erfolgreich gelöscht');
        await fetchPosts(1, false);
      }
      
      return result;
    } catch (error) {
      toast.error('Fehler beim Löschen des Beitrags');
      return false;
    }
  }, [deletePost, fetchPosts]);
  
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    try {
      const result = await addComment(postId, content);
      
      if (result && showMiningRewards && user) {
        try {
          // await recordActivity('comment');
          // await trackSocialActivity(user.id, 'comment');
          console.log('Mining rewards temporarily disabled');
        } catch (achievementError) {
          console.warn('Achievement tracking failed:', achievementError);
        }
      }
      
      return result;
    } catch (error) {
      toast.error('Fehler beim Erstellen des Kommentars');
      return null;
    }
  }, [addComment, showMiningRewards, user]);
  
  const handleSharePost = useCallback(async (postId: string) => {
    try {
      const result = await sharePost(postId, 'clipboard');
      
      if (result && showMiningRewards && user) {
        try {
          // await recordActivity('share');
          // await trackSocialActivity(user.id, 'share');
          toast.success('Beitrag wurde geteilt!');
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
  }, [sharePost, showMiningRewards, user]);
  
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
      const result = await createPost(content, mediaUrl);
      
      if (result) {
        toast.success('Beitrag erfolgreich erstellt');
        return true;
      }
      
      return false;
    } catch (error) {
      toast.error('Fehler beim Erstellen des Beitrags');
      return false;
    }
  }, [createPost, isAuthenticated]);
  
  return {
    profile: user,
    isAuthenticated,
    profileLoading,
    adaptedPosts,
    isLoading,
    error: error ? new Error(error) : null,
    isDarkMode,
    lastRefresh,
    hasNewPosts,
    handleRefresh,
    setHasNewPosts,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments: async (postId: string) => {
      try {
        console.log('🔍 Fetching comments for post:', postId);
        const response = await socialAPI.getComments(postId);
        console.log('🔍 Fetched comments response:', response);
        const comments = response.results || [];
        console.log('🔍 Extracted comments:', comments);
        return comments;
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Fehler beim Laden der Kommentare');
        return [];
      }
    },
    handleSharePost,
    handleReportPost,
    handleCreatePost
  };
};

