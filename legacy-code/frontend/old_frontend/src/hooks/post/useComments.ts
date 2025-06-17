
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { commentRepository } from '@/repositories/CommentRepository';
import { createCommentNotification } from '@/api/notifications/commentNotifications';

/**
 * Hook für die Verwaltung von Kommentaren zu einem Post
 * @param postId ID des Posts
 * @param userId ID des aktuellen Benutzers (optional)
 * @param onCommentCreated Callback-Funktion, die nach dem Erstellen eines Kommentars aufgerufen wird (optional)
 */
const useComments = (
  postId: string,
  userId?: string,
  onCommentCreated?: () => void
) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kommentare laden
  const loadComments = useCallback(async () => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const postComments = await commentRepository.getPostComments(postId, userId);
      setComments(postComments);
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
      toast.error('Kommentare konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId]);

  // Einen neuen Kommentar erstellen
  const createComment = useCallback(async (content: string) => {
    if (!userId || !postId) {
      toast.error('Du musst angemeldet sein, um zu kommentieren');
      return null;
    }

    try {
      setIsSubmitting(true);
      const comment = await commentRepository.createComment(userId, postId, content);
      
      if (comment) {
        // Kommentarbenachrichtigung erstellen
        await createCommentNotification(userId, postId, content);
        
        // Kommentare neu laden
        await loadComments();
        
        // Callback aufrufen, falls vorhanden
        if (onCommentCreated) {
          onCommentCreated();
        }
      }
      
      return comment;
    } catch (error) {
      console.error('Fehler beim Erstellen des Kommentars:', error);
      toast.error('Kommentar konnte nicht erstellt werden');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, postId, loadComments, onCommentCreated]);

  // Einen Kommentar löschen
  const deleteComment = useCallback(async (commentId: string) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um Kommentare zu löschen');
      return false;
    }

    try {
      const success = await commentRepository.deleteComment(commentId, userId);
      
      if (success) {
        // Kommentare aus dem lokalen State entfernen
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Kommentar wurde gelöscht');
      }
      
      return success;
    } catch (error) {
      console.error('Fehler beim Löschen des Kommentars:', error);
      toast.error('Kommentar konnte nicht gelöscht werden');
      return false;
    }
  }, [userId]);

  // Like für einen Kommentar umschalten
  const toggleCommentLike = useCallback(async (commentId: string) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um Kommentare zu liken');
      return false;
    }

    try {
      const result = await commentRepository.toggleCommentLike(userId, commentId);
      
      if (result.success) {
        // Lokalen Like-Status aktualisieren
        setComments(prev => 
          prev.map(c => 
            c.id === commentId
              ? {
                  ...c,
                  is_liked_by_user: result.isLiked,
                  likes_count: result.isLiked
                    ? (c.likes_count || 0) + 1
                    : Math.max(0, (c.likes_count || 0) - 1)
                }
              : c
          )
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Fehler beim Umschalten des Likes:', error);
      toast.error('Like konnte nicht gesetzt werden');
      return false;
    }
  }, [userId]);

  // Kommentare beim ersten Laden abrufen
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    isSubmitting,
    loadComments,
    createComment,
    deleteComment,
    toggleCommentLike
  };
};

export default useComments;
