
import { BaseInteractionRepository } from './BaseInteractionRepository';

/**
 * Repository für Teilen und Melden von Inhalten
 */
export class ShareRepository extends BaseInteractionRepository {
  /**
   * Teilt einen Post (erhöht den Share-Zähler)
   */
  async sharePost(postId: string) {
    try {
      // Inkrementiere den Shares-Zähler in der posts-Tabelle
      const { error } = await this.supabase.rpc('increment_shares', { 
        post_id: postId 
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Fehler beim Teilen des Posts:', error);
      return false;
    }
  }
  
  /**
   * Meldet einen Post
   */
  async reportPost(userId: string, postId: string, reason: string) {
    try {
      // Füge einen Eintrag in die Berichte-Tabelle ein
      const { data, error } = await this.supabase
        .from('reports')
        .insert({
          user_id: userId,
          target_id: postId,
          target_type: 'post',
          reason,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Fehler beim Melden des Posts:', error);
      return false;
    }
  }
}

// Singleton-Instanz für die Verwendung in der gesamten Anwendung
export const shareRepository = new ShareRepository();
