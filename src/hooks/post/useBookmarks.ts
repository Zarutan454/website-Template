
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import djangoApi, { PaginatedResponse, Post } from '@/lib/django-api-new';
import { useProfile } from '@/hooks/useProfile';

/**
 * Hook zum Verwalten von Lesezeichen für Posts mit Django API
 */
export const useBookmarks = (postId?: string, userId?: string) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { profile } = useProfile();

  // Use current user if no userId provided
  const currentUserId = userId || profile?.id?.toString();

  /**
   * Überprüfen, ob Post als Lesezeichen gespeichert ist
   */
  const checkBookmarkStatus = useCallback(async () => {
    if (!currentUserId || !postId) return false;
    
    try {
      setIsLoading(true);
      
      // Get user's bookmarked posts to check if this post is bookmarked
      const response = await djangoApi.get<PaginatedResponse<Post>>(`/posts/?bookmarked_by=${currentUserId}`);
      
      if (response?.results) {
        const isBookmarked = response.results.some((post: Post) => post.id.toString() === postId);
        setBookmarked(isBookmarked);
        return isBookmarked;
      }
      
      return false;
    } catch (error) {
      console.error('[useBookmarks] Error checking bookmark status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, postId]);

  /**
   * Post als Lesezeichen speichern oder Lesezeichen entfernen
   */
  const handleBookmark = useCallback(async () => {
    if (!currentUserId || !postId) {
      toast.error('Du musst angemeldet sein, um einen Beitrag zu speichern');
      return false;
    }

    if (isProcessing) return false;

    try {
      setIsProcessing(true);
      
      // Optimistic update
      const newBookmarkedState = !bookmarked;
      setBookmarked(newBookmarkedState);

      if (bookmarked) {
        // Unbookmark the post
        await djangoApi.unbookmarkPost(parseInt(postId));
        toast.info('Lesezeichen entfernt');
      } else {
        // Bookmark the post
        await djangoApi.bookmarkPost(parseInt(postId));
        toast.success('Zu Lesezeichen hinzugefügt');
      }
      
      return true;
    } catch (error) {
      console.error('[useBookmarks] Error toggling bookmark:', error);
      
      // Revert optimistic update on error
      setBookmarked(bookmarked);
      toast.error('Fehler beim Setzen des Lesezeichens');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUserId, postId, bookmarked, isProcessing]);

  /**
   * Lesezeichen für einen bestimmten Post abrufen
   */
  const getBookmarkedStatus = useCallback(async (specificPostId: string) => {
    if (!currentUserId) return false;
    
    try {
      const response = await djangoApi.get<PaginatedResponse<Post>>(`/posts/?bookmarked_by=${currentUserId}`);
      
      if (response?.results) {
        return response.results.some((post: Post) => post.id.toString() === specificPostId);
      }
      
      return false;
    } catch (error) {
      console.error('[useBookmarks] Error checking bookmark status:', error);
      return false;
    }
  }, [currentUserId]);

  /**
   * Lesezeichen für einen bestimmten Post umschalten
   */
  const toggleBookmark = useCallback(async (specificPostId?: string) => {
    const targetPostId = specificPostId || postId;
    
    if (!currentUserId || !targetPostId) {
      toast.error('Du musst angemeldet sein, um ein Lesezeichen zu setzen');
      return { success: false, isBookmarked: false };
    }
    
    try {
      const isCurrentlyBookmarked = await getBookmarkedStatus(targetPostId);
      
      if (isCurrentlyBookmarked) {
        // Unbookmark the post
        await djangoApi.unbookmarkPost(parseInt(targetPostId));
        toast.info('Lesezeichen entfernt');
        
        // Update local state if this is the current post
        if (targetPostId === postId) {
          setBookmarked(false);
        }
        
        return { success: true, isBookmarked: false };
      } else {
        // Bookmark the post
        await djangoApi.bookmarkPost(parseInt(targetPostId));
        toast.success('Zu Lesezeichen hinzugefügt');
        
        // Update local state if this is the current post
        if (targetPostId === postId) {
          setBookmarked(true);
        }
        
        return { success: true, isBookmarked: true };
      }
    } catch (error) {
      console.error('[useBookmarks] Error toggling bookmark:', error);
      toast.error('Fehler beim Setzen des Lesezeichens');
      return { success: false, isBookmarked: false };
    }
  }, [currentUserId, postId, getBookmarkedStatus]);

  // Initialize bookmark status when component mounts
  useEffect(() => {
    if (currentUserId && postId) {
      checkBookmarkStatus();
    }
  }, [currentUserId, postId, checkBookmarkStatus]);

  return {
    bookmarked,
    setBookmarked,
    isLoading,
    isProcessing,
    handleBookmark,
    checkBookmarkStatus,
    getBookmarkedStatus,
    toggleBookmark
  };
};

/**
 * Hook für allgemeine Lesezeichen-Funktionen ohne spezifischen Post
 */
export const useGeneralBookmarks = () => {
  const { profile } = useProfile();
  const userId = profile?.id?.toString();

  // Use the base useBookmarks hook without a specific postId
  const bookmarkHook = useBookmarks(undefined, userId);
  
  return {
    // Expose only the general functions
    getBookmarkedStatus: bookmarkHook.getBookmarkedStatus,
    toggleBookmark: bookmarkHook.toggleBookmark,
    isLoading: bookmarkHook.isLoading,
    isProcessing: bookmarkHook.isProcessing
  };
};
