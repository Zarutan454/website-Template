
import { BaseInteractionRepository } from './BaseInteractionRepository';

/**
 * Repository für Kommentar-bezogene Interaktionen
 */
export class CommentRepository extends BaseInteractionRepository {
  /**
   * Liked einen Kommentar
   */
  async likeComment(userId: string, commentId: string) {
    try {
      // Füge einen Like in die likes-Tabelle ein
      const { data, error } = await this.supabase
        .from('likes')
        .insert({
          user_id: userId,
          comment_id: commentId
        });
        
      if (error) throw error;
      
      // Aktualisiere den Likes-Zähler im Kommentar
      const { error: updateError } = await this.supabase
        .from('comments')
        .update({ 
          likes_count: this.supabase.rpc('increment', { value: 1 })
        })
        .eq('id', commentId);
        
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Fehler beim Liken des Kommentars:', error);
      return false;
    }
  }
  
  /**
   * Setzt Like eines Kommentars zurück
   */
  async unlikeComment(userId: string, commentId: string) {
    try {
      // Entferne den Like aus der likes-Tabelle
      const { data, error } = await this.supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId);
        
      if (error) throw error;
      
      // Aktualisiere den Likes-Zähler im Kommentar
      const { error: updateError } = await this.supabase
        .from('comments')
        .update({ 
          likes_count: this.supabase.rpc('decrement', { value: 1 })
        })
        .eq('id', commentId);
        
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Fehler beim Rücksetzen des Kommentar-Like:', error);
      return false;
    }
  }
  
  /**
   * Prüft, ob ein Kommentar von einem Benutzer geliked wurde
   */
  async isCommentLikedByUser(userId: string, commentId: string): Promise<boolean> {
    if (!userId || !commentId) return false;
    
    try {
      const { data, error } = await this.supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .maybeSingle();
        
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Fehler beim Prüfen des Kommentar-Like-Status:', error);
      return false;
    }
  }
}

// Singleton-Instanz für die Verwendung in der gesamten Anwendung
export const commentRepository = new CommentRepository();
