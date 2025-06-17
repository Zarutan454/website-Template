
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useProfile } from './useProfile';

export const useBookmarks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { profile, isAuthenticated } = useProfile();

  const toggleBookmark = useCallback(async (postId: string): Promise<{ success: boolean, isBookmarked: boolean }> => {
    try {
      if (!isAuthenticated || !profile?.id) {
        toast.error("Bitte melde dich an, um Beiträge zu speichern");
        return { success: false, isBookmarked: false };
      }

      setIsLoading(true);

      // Check if the post is already bookmarked - using .eq().eq() and array response instead of .single()
      const { data: existingBookmarks, error: checkError } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', profile.id)
        .eq('post_id', postId);

      if (checkError) {
        console.error('Error checking bookmark:', checkError);
        throw checkError;
      }

      if (existingBookmarks && existingBookmarks.length > 0) {
        console.log('Removing bookmark:', existingBookmarks[0].id);
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmarks[0].id);

        if (deleteError) throw deleteError;
        
        toast.success("Beitrag entfernt");
        return { success: true, isBookmarked: false };
      } else {
        console.log('Adding new bookmark for post:', postId);
        // Verwende UPSERT Strategie mit ON CONFLICT, um die UNIQUE Constraint zu berücksichtigen
        const { error: insertError } = await supabase
          .from('bookmarks')
          .upsert([
            {
              user_id: profile.id,
              post_id: postId
            }
          ], { 
            onConflict: 'user_id,post_id', // Verhindert Duplikate bei gleichem Benutzer und Post
            ignoreDuplicates: true // Ignoriert Duplikate ohne Fehler
          });

        if (insertError) throw insertError;
        
        // Create notification for post author (optional)
        try {
          const { data: postData } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single();
            
          if (postData && postData.author_id !== profile.id) {
            await supabase
              .from('notifications')
              .insert([
                {
                  user_id: postData.author_id,
                  type: 'bookmark',
                  content: 'hat deinen Beitrag gespeichert',
                  actor_id: profile.id,
                  target_id: postId,
                  target_type: 'post'
                }
              ]);
          }
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
          // Don't throw here, bookmark was successful
        }
        
        toast.success("Beitrag gespeichert");
        return { success: true, isBookmarked: true };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Check if error is a unique constraint violation and handle gracefully
      if (error instanceof Error && error.message.includes('unique constraint')) {
        toast.info('Dieser Beitrag ist bereits gespeichert');
        return { success: true, isBookmarked: true };
      }
      
      toast.error('Fehler beim Speichern des Beitrags');
      return { success: false, isBookmarked: false };
    } finally {
      setIsLoading(false);
    }
  }, [profile, isAuthenticated]);

  const getBookmarkedStatus = useCallback(async (postId: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !profile?.id) {
        return false;
      }

      // Durch die UNIQUE Constraint ist hier maximal ein Eintrag möglich
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', profile.id)
        .eq('post_id', postId);

      if (error) {
        console.error('Error checking bookmark status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error getting bookmark status:', error);
      return false;
    }
  }, [profile, isAuthenticated]);

  const getUserBookmarks = useCallback(async (): Promise<string[]> => {
    try {
      if (!isAuthenticated || !profile?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false }); // Neueste Lesezeichen zuerst

      if (error) {
        console.error('Error fetching user bookmarks:', error);
        return [];
      }

      return data.map(item => item.post_id);
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      return [];
    }
  }, [profile, isAuthenticated]);

  return {
    toggleBookmark,
    getBookmarkedStatus,
    getUserBookmarks,
    isLoading
  };
};
