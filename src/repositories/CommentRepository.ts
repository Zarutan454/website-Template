import { socialAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

/**
 * Repository für Kommentar-bezogene Datenbankoperationen (Django-API)
 */
export class CommentRepository {
  /**
   * Erstellt einen Kommentar für einen Post
   */
  async createComment(userId: string, postId: string, content: string) {
    try {
      const sanitizedContent = content.trim();
      if (!sanitizedContent) throw new Error('Kommentarinhalt darf nicht leer sein');
      
      // Django-API: Kommentar anlegen
      const comment = await socialAPI.createComment(postId, { content: sanitizedContent });
      
      // Prüfen, ob ein Boost gewährt wurde
      if (comment && comment.boost_granted) {
        toast.success("✨ Mining Boost! Deine Mining-Rate wurde temporär erhöht.");
      }
      
      return comment;
    } catch (error) {
      console.error('[CommentRepository] Error creating comment:', error);
      toast.error('Fehler beim Erstellen des Kommentars');
      return null;
    }
  }

  /**
   * Lädt Kommentare für einen Post (paginiert, mit User-Infos)
   */
  async getPostComments(postId: string, page: number = 1) {
    try {
      // Korrigierter API-Aufruf mit korrekten Parametern
      const response = await socialAPI.getComments(postId, { page: page.toString() });
      console.log('[CommentRepository] Raw response:', response);
      
      // Stelle sicher, dass wir ein Array zurückgeben
      if (response && response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('[CommentRepository] Unexpected response format:', response);
        return [];
      }
    } catch (error) {
      console.error('[CommentRepository] Error fetching post comments:', error);
      return [];
    }
  }

  /**
   * Like oder Unlike einen Kommentar
   */
  async toggleCommentLike(commentId: string) {
    try {
      const response = await socialAPI.likeComment(parseInt(commentId));
      if (response.data) {
        return response.data.liked;
      }
      return false;
    } catch (error) {
      console.error('[CommentRepository] Error toggling comment like:', error);
      toast.error('Fehler beim Liken des Kommentars');
      return false;
    }
  }
}

export const commentRepository = new CommentRepository(); 