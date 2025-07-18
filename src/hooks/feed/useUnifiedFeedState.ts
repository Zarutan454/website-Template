import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDjangoFeed, type FeedType } from '@/hooks/feed/useDjangoFeed';
import { useTheme } from '@/components/ThemeProvider';
import { adaptPost } from '@/utils/postAdapter';
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
    hasMore,
    fetchPosts,
    loadMore,
    commentPost,
    // toggleLike, // TODO: wieder aktivieren, sobald API bereit
    // deletePost, // TODO: wieder aktivieren, sobald API bereit
    // createPost, // TODO: wieder aktivieren, sobald API bereit
    // sharePost,  // TODO: wieder aktivieren, sobald API bereit
  } = useDjangoFeed({
    feedType,
    // enableAutoRefresh, // TODO: wieder aktivieren, wenn unterstützt
    // refreshInterval: 120000
  });
  
  const isDarkMode = theme === 'dark';
  const adaptedPosts: FrontendPost[] = apiPosts.map(adaptPost);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPosts();
      setLastRefresh(new Date());
      setHasNewPosts(false);
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
  }, [enableAutoRefresh, isAuthenticated, refreshInterval]);

  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await fetchPosts();
      setLastRefresh(new Date());
      setHasNewPosts(false);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Feeds');
    }
  }, [fetchPosts, isAuthenticated]);

  // const handleLikePost = useCallback(async (postId: string) => {
  //   // TODO: wieder aktivieren, sobald toggleLike verfügbar
  // }, [/* toggleLike, showMiningRewards, user */]);

  // const handleDeletePost = useCallback(async (postId: string) => {
  //   // TODO: wieder aktivieren, sobald deletePost verfügbar
  // }, [/* deletePost, fetchPosts */]);

  // const handleCreateComment = useCallback(async (postId: string, content: string) => {
  //   // TODO: wieder aktivieren, sobald addComment verfügbar
  // }, [/* addComment, showMiningRewards, user */]);

  // const handleSharePost = useCallback(async (postId: string) => {
  //   // TODO: wieder aktivieren, sobald sharePost verfügbar
  // }, [/* sharePost, showMiningRewards, user */]);

  // const handleReportPost = useCallback(async (postId: string, reason: string) => {
  //   // TODO: wieder aktivieren, sobald reportPost verfügbar
  // }, []);

  // const handleCreatePost = useCallback(async (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
  //   // TODO: wieder aktivieren, sobald createPost verfügbar
  // }, [/* createPost, isAuthenticated */]);

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
    // handleLikePost, // TODO: wieder aktivieren
    // handleDeletePost, // TODO: wieder aktivieren
    // handleCreateComment, // TODO: wieder aktivieren
    handleGetComments: async (postId: string) => {
      // TODO: ggf. anpassen, wenn API für Kommentare geändert wird
      try {
        const response = await socialAPI.getComments(postId);
        const comments = response.results || [];
        return comments;
      } catch (error) {
        toast.error('Fehler beim Laden der Kommentare');
        return [];
      }
    },
    // handleSharePost, // TODO: wieder aktivieren
    // handleReportPost, // TODO: wieder aktivieren
    // handleCreatePost, // TODO: wieder aktivieren
  };
};

