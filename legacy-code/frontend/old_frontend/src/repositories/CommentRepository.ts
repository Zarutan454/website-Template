
import { BaseRepository } from './BaseRepository';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/api/notifications';

/**
 * Repository für Kommentar-bezogene Datenbankoperationen
 */
export class CommentRepository extends BaseRepository {
  /**
   * Erstellt einen Kommentar für einen Post
   */
  async createComment(userId: string, postId: string, content: string) {
    try {
      // Bereinige den Inhalt des Kommentars
      const sanitizedContent = content.trim();
      
      if (!sanitizedContent) {
        throw new Error('Kommentarinhalt darf nicht leer sein');
      }
      
      // Holen Sie zuerst den Post-Autor für die spätere Benachrichtigung
      const { data: postData, error: postError } = await this.supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
        
      if (postError) throw postError;
      
      const { data: comment, error } = await this.supabase
        .from('comments')
        .insert([{
          author_id: userId,
          user_id: userId, // Für Rückwärtskompatibilität
          post_id: postId,
          content: sanitizedContent,
          likes_count: 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Kommentarzähler erhöhen
      await this.supabase.rpc('increment_comments', { post_id: postId });
      
      // Benachrichtigung für den Post-Autor erstellen
      if (postData && postData.author_id && postData.author_id !== userId) {
        await createNotification({
          userId: postData.author_id,
          type: 'comment',
          content: `hat deinen Post kommentiert: "${sanitizedContent.substring(0, 30)}${sanitizedContent.length > 30 ? '...' : ''}"`,
          actorId: userId,
          targetId: postId,
          targetType: 'post'
        });
      }
      
      return comment;
    } catch (error) {
      console.error('[CommentRepository] Error creating comment:', error);
      toast.error('Fehler beim Erstellen des Kommentars');
      return null;
    }
  }
  
  /**
   * Lädt Kommentare für einen Post mit Benutzerinformationen
   */
  async getPostComments(postId: string, currentUserId?: string) {
    try {
      // Verbesserte Abfrage mit Benutzerinformationen über den author_id Foreign Key
      const { data: comments, error } = await this.supabase
        .from('comments')
        .select(`
          *,
          author:users!author_id(id, username, display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Kommentare mit zusätzlichen Infos für die UI anreichern
      const enhancedComments = await this.enrichCommentsWithUserInteractions(comments || [], currentUserId);
      
      return enhancedComments;
    } catch (error) {
      console.error('[CommentRepository] Error fetching post comments:', error);
      return [];
    }
  }
  
  /**
   * Reichert Kommentare mit Benutzerinteraktionen an (z.B. ob der aktuelle Benutzer den Kommentar geliked hat)
   */
  private async enrichCommentsWithUserInteractions(comments: Record<string, unknown>[], currentUserId?: string) {
    if (!comments.length || !currentUserId) return comments;
    
    try {
      // Kommentar-IDs sammeln
      const commentIds = comments.map(comment => comment.id);
      
      // Prüfen, welche Kommentare der aktuelle Benutzer geliked hat
      const { data: userLikes, error } = await this.supabase
        .from('likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds);
      
      if (error) throw error;
      
      // Set für schnelleren Lookup erstellen
      const likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || []);
      
      // Kommentare mit Like-Status anreichern
      return comments.map(comment => ({
        ...comment,
        is_liked_by_user: likedCommentIds.has(comment.id)
      }));
    } catch (error) {
      console.error('[CommentRepository] Error enriching comments:', error);
      return comments;
    }
  }
  
  /**
   * Löscht einen Kommentar und aktualisiert den Kommentarzähler
   */
  async deleteComment(commentId: string, userId: string) {
    try {
      // Zuerst den Kommentar holen, um die post_id zu finden
      const { data: comment, error: fetchError } = await this.supabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .eq('author_id', userId)
        .single();
      
      if (fetchError || !comment) {
        console.error('[CommentRepository] Error fetching comment:', fetchError);
        return false;
      }
      
      // Kommentar löschen
      const { error } = await this.supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', userId);
      
      if (error) throw error;
      
      // Kommentarzähler verringern
      if (comment && comment.post_id) {
        await this.supabase.rpc('decrement_comments', { post_id: comment.post_id });
      }
      
      return true;
    } catch (error) {
      console.error('[CommentRepository] Error deleting comment:', error);
      toast.error('Fehler beim Löschen des Kommentars');
      return false;
    }
  }
  
  /**
   * Holt einen einzelnen Kommentar anhand seiner ID
   */
  async getCommentById(commentId: string) {
    try {
      const { data, error } = await this.supabase
        .from('comments')
        .select(`
          *,
          author:users!author_id(id, username, display_name, avatar_url)
        `)
        .eq('id', commentId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('[CommentRepository] Error fetching comment:', error);
      return null;
    }
  }
  
  /**
   * Like oder Unlike einen Kommentar
   */
  async toggleCommentLike(userId: string, commentId: string) {
    try {
      // Prüfen, ob der Kommentar bereits geliked ist
      const { data, error: checkError } = await this.supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      const isLiked = !!data;
      
      if (isLiked) {
        // Unlike
        const { error } = await this.supabase
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('comment_id', commentId);
        
        if (error) throw error;
        
        // Likes-Zähler dekrementieren
        await this.updateCommentLikeCount(commentId, -1);
        
        return { success: true, isLiked: false };
      } else {
        // Like
        const { error } = await this.supabase
          .from('likes')
          .insert([{ user_id: userId, comment_id: commentId }]);
        
        if (error) throw error;
        
        // Likes-Zähler inkrementieren
        await this.updateCommentLikeCount(commentId, 1);
        
        return { success: true, isLiked: true };
      }
    } catch (error) {
      console.error('[CommentRepository] Error toggling comment like:', error);
      return { success: false, isLiked: false };
    }
  }
  
  /**
   * Aktualisiert den Like-Zähler eines Kommentars
   */
  private async updateCommentLikeCount(commentId: string, changeAmount: number) {
    try {
      const { data: comment, error: fetchError } = await this.supabase
        .from('comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newCount = Math.max(0, (comment.likes_count || 0) + changeAmount);
      
      const { error } = await this.supabase
        .from('comments')
        .update({ likes_count: newCount })
        .eq('id', commentId);
      
      if (error) throw error;
      
      return newCount;
    } catch (error) {
      console.error('[CommentRepository] Error updating comment like count:', error);
      return -1;
    }
  }
}

export const commentRepository = new CommentRepository();
