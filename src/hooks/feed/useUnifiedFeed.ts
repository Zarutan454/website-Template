import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext.utils';
import { useMining } from '@/hooks/useMining';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider.utils';
import { useMiningRewards } from '@/hooks/mining/useMiningRewards';
import { usePostActions } from '@/hooks/post/usePostActions';
import { useCommentActions } from '@/hooks/post/useCommentActions';
import { socialAPI } from '@/lib/django-api-new';
import { UiFilterType } from '@/hooks/feed/useFilterControl';
import { FeedType } from '@/hooks/feed/useFeedData';
import { toast } from 'sonner';
import { CreateCommentData } from '@/types/posts';

export interface UseUnifiedFeedProps {
  feedType: FeedType;
  selectedFilter: UiFilterType | null;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  showMiningRewards?: boolean;
}

/**
 * Zentraler Feed-Hook, der alle benötigten Daten und Aktionen für Feed-Komponenten bereitstellt
 */
export const useUnifiedFeed = ({
  feedType,
  selectedFilter,
  enableAutoRefresh = true,
  refreshInterval = 120000,
  showMiningRewards = false
}: UseUnifiedFeedProps) => {
  const { theme } = useTheme();
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  const { recordActivity, isMining } = useMining();
  const isDarkMode = theme === 'dark';
  
  // Timer-Referenzen
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshLockRef = useRef<boolean>(false);
  
  // Post-Daten und -Aktionen abrufen
  const { 
    adaptedPosts, 
    posts,
    isLoading, 
    error, 
    fetchPosts: baseFetchPosts, 
    likePost: baseLikePost, 
    deletePost: baseDeletePost, 
    createComment: baseCreateComment, 
    getPostComments: baseGetComments,
    sharePost: baseSharePost,
    createPost: baseCreatePost
  } = usePosts();
  
  // State für Aktualisierungszeitpunkt und Verfügbarkeit neuer Beiträge
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Verbesserte Fetch-Funktion
  const fetchPosts = useCallback(async (checkForNew: boolean = false) => {
    if (!isAuthenticated || !profile || (refreshLockRef.current && !checkForNew)) return;
    
    if (!checkForNew) {
      setIsRefreshing(true);
      refreshLockRef.current = true;
    }
    
    try {
      await baseFetchPosts(feedType);
      
      if (!checkForNew) {
        setLastUpdated(new Date());
        setHasNewPosts(false);
      }
      
      return true;
    } catch (error) {
      return false;
    } finally {
      if (!checkForNew) {
        setIsRefreshing(false);
        
        // Kurze Verzögerung, um zu häufige Anfragen zu verhindern
        setTimeout(() => {
          refreshLockRef.current = false;
        }, 1000);
      }
    }
  }, [isAuthenticated, profile, feedType, baseFetchPosts]);
  
  // Like-Handler mit Mining-Unterstützung
  const handleLikePost = useCallback(async (postId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu liken");
      return false;
    }
    
    try {
      const result = await baseLikePost(postId);
      
      if (result && showMiningRewards && isMining) {
        await recordActivity('like', 5, 0.5);
      }
      
      return result;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Liken des Beitrags:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  }, [isAuthenticated, profile, baseLikePost, showMiningRewards, isMining, recordActivity]);
  
  // Delete-Handler
  const handleDeletePost = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu löschen");
      return false;
    }
    
    try {
      const result = await baseDeletePost(postId);
      
      if (result) {
        toast.success("Beitrag erfolgreich gelöscht");
        await fetchPosts(false);
      }
      
      return result;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Löschen des Beitrags:', error);
      toast.error("Fehler beim Löschen des Beitrags");
      return false;
    }
  }, [isAuthenticated, baseDeletePost, fetchPosts]);
  
  // Kommentar-Handler mit Mining-Unterstützung
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return null;
    }
    
    try {
      const commentData: CreateCommentData = {
        post_id: postId,
        content
      };
      
      const result = await baseCreateComment(commentData);
      
      if (result && showMiningRewards && isMining) {
        await recordActivity('comment', 10, 1);
      }
      
      await baseGetComments(postId);
      await fetchPosts(false);
      
      return result;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Erstellen des Kommentars:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
      return null;
    }
  }, [isAuthenticated, profile, baseCreateComment, showMiningRewards, isMining, recordActivity, baseGetComments, fetchPosts]);
  
  // Kommentar-Lösch-Handler
  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Kommentare zu löschen");
      return false;
    }
    
    try {
      const result = await socialAPI.deleteComment(commentId);
      
      if (result) {
        toast.success("Kommentar erfolgreich gelöscht");
        await fetchPosts(false);
      }
      
      return result;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Löschen des Kommentars:', error);
      toast.error("Fehler beim Löschen des Kommentars");
      return false;
    }
  }, [isAuthenticated, fetchPosts]);
  
  // Share-Handler mit Mining-Unterstützung
  const handleSharePost = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu teilen");
      return false;
    }
    
    try {
      const shareResult = await baseSharePost(postId);
      
      if (shareResult) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
        
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
      }
      
      return shareResult;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Teilen des Beitrags:', error);
      toast.error("Fehler beim Teilen des Beitrags");
      return false;
    }
  }, [isAuthenticated, baseSharePost, showMiningRewards, isMining, recordActivity]);
  
  // Report-Handler
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu melden");
      return false;
    }
    
    try {
      toast.success("Deine Meldung wurde erfolgreich übermittelt. Unser Team wird den Beitrag überprüfen.");
      return true;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Melden des Beitrags:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  }, [isAuthenticated, profile]);
  
  // Erstellen eines neuen Beitrags
  const handleCreatePost = useCallback(async (content: string, mediaUrl?: string | null) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um einen Beitrag zu erstellen");
      return false;
    }
    
    try {
      const result = await baseCreatePost({
        content,
        media_url: mediaUrl
      });
      
      if (result.success) {
        if (showMiningRewards && isMining) {
          await recordActivity('post', 25, 2.5);
        }
        
        await fetchPosts(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Erstellen des Beitrags:', error);
      toast.error("Fehler beim Erstellen des Beitrags");
      return false;
    }
  }, [isAuthenticated, profile, baseCreatePost, showMiningRewards, isMining, recordActivity, fetchPosts]);
  
  // Aktualisierung beim ersten Laden und bei Änderung des Filters oder Feed-Typs
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchPosts(false);
    }
  }, [feedType, selectedFilter, isAuthenticated, profile, fetchPosts]);
  
  // Auto-Refresh-Effekt
  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated) return;
    
    const checkForNewPosts = () => {
      setHasNewPosts(true);
    };
    
    refreshTimerRef.current = setInterval(checkForNewPosts, refreshInterval);
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [enableAutoRefresh, isAuthenticated, refreshInterval]);
  
  // Manuelle Aktualisierungsfunktion
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return false;
    
    toast.info("Feed wird aktualisiert...");
    const success = await fetchPosts(false);
    
    if (success) {
      toast.success("Feed wurde aktualisiert");
    }
    
    return success;
  }, [isRefreshing, fetchPosts]);
  
  // Kommentare für einen Beitrag abrufen
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return await baseGetComments(postId);
    } catch (error) {
      console.error('[useUnifiedFeed] Fehler beim Abrufen der Kommentare:', error);
      return [];
    }
  }, [baseGetComments]);
  
  return {
    // Status
    posts,
    adaptedPosts,
    isLoading: isLoading || isRefreshing,
    error,
    profile,
    isAuthenticated,
    profileLoading,
    isDarkMode,
    lastUpdated,
    hasNewPosts,
    
    // Feed-Aktionen
    handleRefresh,
    setHasNewPosts,
    
    // Post-Aktionen
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost,
    handleCreatePost,
    handleDeleteComment
  };
};
