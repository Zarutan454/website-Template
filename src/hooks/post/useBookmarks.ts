
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Hook zum Verwalten von Lesezeichen für Posts
 */
export const useBookmarks = (postId?: string, userId?: string) => {
  const [bookmarked, setBookmarked] = useState(false);

  /**
   * Post als Lesezeichen speichern oder Lesezeichen entfernen
   */
  const handleBookmark = async () => {
    if (!userId || !postId) {
      toast.error('Du musst angemeldet sein, um einen Beitrag zu speichern');
      return false;
    }

    try {
      if (bookmarked) {
        // Unbookmark the post
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);
          
        if (error) throw error;
        
        setBookmarked(false);
        toast.info('Lesezeichen entfernt');
      } else {
        // Bookmark the post
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            post_id: postId
          });
          
        if (error) throw error;
        
        setBookmarked(true);
        toast.success('Zu Lesezeichen hinzugefügt');
      }
      return true;
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Fehler beim Setzen des Lesezeichens');
      return false;
    }
  };

  /**
   * Überprüfen, ob Post als Lesezeichen gespeichert ist
   */
  const checkBookmarkStatus = async () => {
    if (!userId || !postId) return false;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking bookmark status:', error);
        return false;
      }
      
      const isBookmarked = !!data;
      setBookmarked(isBookmarked);
      return isBookmarked;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  };

  /**
   * Lesezeichen für einen bestimmten Post abrufen
   */
  const getBookmarkedStatus = async (specificPostId: string) => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', specificPostId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking bookmark status:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  };

  /**
   * Lesezeichen für einen bestimmten Post umschalten
   */
  const toggleBookmark = async (specificPostId: string) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um ein Lesezeichen zu setzen');
      return { success: false, isBookmarked: false };
    }
    
    try {
      const isCurrentlyBookmarked = await getBookmarkedStatus(specificPostId);
      
      if (isCurrentlyBookmarked) {
        // Unbookmark the post
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', specificPostId);
          
        if (error) throw error;
        
        toast.info('Lesezeichen entfernt');
        return { success: true, isBookmarked: false };
      } else {
        // Bookmark the post
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            post_id: specificPostId
          });
          
        if (error) throw error;
        
        toast.success('Zu Lesezeichen hinzugefügt');
        return { success: true, isBookmarked: true };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Fehler beim Setzen des Lesezeichens');
      return { success: false, isBookmarked: false };
    }
  };

  return {
    bookmarked,
    setBookmarked,
    handleBookmark,
    checkBookmarkStatus,
    getBookmarkedStatus,
    toggleBookmark
  };
};

// Fix: Create a useGeneralBookmarks hook that properly manages authentication state
export const useGeneralBookmarks = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data?.session?.user?.id);
    };
    
    fetchUserId();
  }, []);

  // Use the base useBookmarks hook with the userId
  const bookmarkHook = useBookmarks(undefined, userId);
  
  return {
    ...bookmarkHook,
    // Ensure we're only exposing the functions that don't rely on a specific postId
    getBookmarkedStatus: bookmarkHook.getBookmarkedStatus,
    toggleBookmark: bookmarkHook.toggleBookmark
  };
};
