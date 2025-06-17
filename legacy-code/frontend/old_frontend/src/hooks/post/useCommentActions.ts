
import { useState, useCallback } from 'react';
import { postRepository } from '@/repositories/PostRepository';
import { toast } from 'sonner';
import { CreateCommentData } from '@/types/posts';

/**
 * Hook für Kommentar-Aktionen (Erstellen, Löschen, Laden)
 */
export const useCommentActions = (onRefresh?: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Kommentar erstellen
   */
  const createComment = useCallback(async (userId: string, commentData: CreateCommentData) => {
    if (!userId || !commentData.post_id || !commentData.content.trim()) {
      toast.error("Ungültige Kommentardaten");
      return null;
    }
    
    try {
      setIsLoading(true);

      
      const result = await postRepository.createComment(
        userId, 
        commentData.post_id, 
        commentData.content
      );
      
      if (result) {
        console.log(`[useCommentActions] Kommentar erfolgreich erstellt`);
        
        // Aktualisierung triggern, falls gewünscht
        if (onRefresh) {
          await onRefresh();
        }
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error("Fehler beim Erstellen des Kommentars:", error);
      toast.error("Der Kommentar konnte nicht erstellt werden");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);
  
  /**
   * Kommentare für einen Post laden
   */
  const getPostComments = useCallback(async (postId: string) => {
    if (!postId) {
      return [];
    }
    
    try {
      setIsLoading(true);
      console.log(`[useCommentActions] Lade Kommentare für Post ${postId}`);
      
      const comments = await postRepository.getPostComments(postId);
      
      console.log(`[useCommentActions] ${comments.length} Kommentare geladen`);
      return comments;
    } catch (error) {
      console.error("Fehler beim Laden der Kommentare:", error);
      toast.error("Kommentare konnten nicht geladen werden");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Kommentar löschen
   */
  const deleteComment = useCallback(async (commentId: string, userId: string) => {
    if (!commentId || !userId) {
      toast.error("Ungültige Anfrage");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log(`[useCommentActions] Lösche Kommentar ${commentId}`);
      
      const result = await postRepository.deleteComment(commentId, userId);
      
      if (result) {
        console.log(`[useCommentActions] Kommentar erfolgreich gelöscht`);
        
        // Aktualisierung triggern, falls gewünscht
        if (onRefresh) {
          await onRefresh();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Fehler beim Löschen des Kommentars:", error);
      toast.error("Der Kommentar konnte nicht gelöscht werden");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);
  
  return {
    createComment,
    getPostComments,
    deleteComment,
    isLoading
  };
};
