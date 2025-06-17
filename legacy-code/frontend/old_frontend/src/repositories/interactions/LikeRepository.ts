
import { BaseInteractionRepository } from './BaseInteractionRepository';
import { createNotification } from '@/api/notifications/createNotifications';

/**
 * Repository für Like-bezogene Interaktionen
 */
export class LikeRepository extends BaseInteractionRepository {
  /**
   * Schaltet den Like-Status für einen Post um (like/unlike)
   */
  async togglePostLike(userId: string, postId: string) {
    try {
      // Nutze die DB-Funktion zum Umschalten des Like-Status
      const { data, error } = await this.supabase.rpc('toggle_post_like', {
        p_user_id: userId,
        p_post_id: postId
      });
      
      if (error) {
        console.error('[LikeRepository] Fehler beim Umschalten des Like-Status:', error);
        throw error;
      }

      console.log('[LikeRepository] Like-Status umgeschaltet, Ergebnis:', data);

      // Wenn der Post geliked wurde, sende eine Benachrichtigung
      if (data.action === 'liked') {
        try {
          // Hole den Post-Autor für die Benachrichtigung
          const { data: postData, error: postError } = await this.supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single();
          
          if (postError) {
            console.error('[LikeRepository] Fehler beim Abrufen des Post-Autors:', postError);
            throw postError;
          }
          
          if (postData && postData.author_id !== userId) {
            // Erstelle eine Benachrichtigung für den Post-Autor
            await createNotification({
              userId: postData.author_id,  // Post-Autor
              type: 'like',
              content: 'hat deinen Beitrag geliked',
              actorId: userId,              // Like-Autor
              targetId: postId,               // Post-ID
              targetType: 'post'
            });
            console.log('[LikeRepository] Like-Benachrichtigung erstellt');
            
            // Automatisch den Post für den Liker abonnieren
            await this.subscribeToPostOnLike(userId, postId);
          }
        } catch (notifError) {
          console.error('[LikeRepository] Fehler bei Benachrichtigung:', notifError);
          // Fehler bei der Benachrichtigung beeinträchtigt nicht die Like-Funktionalität
        }
      }
      
      return { 
        success: true, 
        isLiked: data.is_liked, 
        likesCount: data.likes_count,
        action: data.action
      };
    } catch (error) {
      console.error('[LikeRepository] Fehler beim Umschalten des Like-Status:', error);
      return { success: false, error, isLiked: false, likesCount: 0 };
    }
  }
  
  /**
   * Prüft, ob ein Post von einem Benutzer geliked wurde
   */
  async isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
    if (!userId || !postId) return false;
    
    try {
      const { data, error } = await this.supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
        
      if (error) {
        console.error('[LikeRepository] Fehler beim Prüfen des Like-Status:', error);
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('[LikeRepository] Fehler beim Prüfen des Like-Status:', error);
      return false;
    }
  }
  
  /**
   * Abonniert einen Post automatisch beim Liken für Benachrichtigungen
   */
  async subscribeToPostOnLike(userId: string, postId: string): Promise<boolean> {
    try {
      console.log(`[LikeRepository] Automatisches Abonnement des Posts ${postId} nach Like`);
      
      // Prüfen, ob bereits ein Abonnement existiert
      const { data: existingSubscription, error: checkError } = await this.supabase
        .from('post_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
        
      if (checkError) {
        console.error('[LikeRepository] Fehler beim Prüfen des Abonnements:', checkError);
        return false;
      }
      
      if (!existingSubscription) {
        // Erstelle ein neues Abonnement
        const { error: insertError } = await this.supabase
          .from('post_subscriptions')
          .insert([{
            user_id: userId,
            post_id: postId,
            active: true
          }]);
          
        if (insertError) {
          console.error('[LikeRepository] Fehler beim Erstellen des Abonnements:', insertError);
          return false;
        }
        
        console.log('[LikeRepository] Post wurde automatisch abonniert');
        return true;
      } else if (!existingSubscription.active) {
        // Aktiviere ein bestehendes, inaktives Abonnement
        const { error: updateError } = await this.supabase
          .from('post_subscriptions')
          .update({ active: true })
          .eq('id', existingSubscription.id);
          
        if (updateError) {
          console.error('[LikeRepository] Fehler beim Aktualisieren des Abonnements:', updateError);
          return false;
        }
        
        console.log('[LikeRepository] Inaktives Abonnement wurde aktiviert');
        return true;
      }
      
      return true; // Abonnement existiert bereits und ist aktiv
    } catch (error) {
      console.error('[LikeRepository] Fehler beim Abonnieren nach Like:', error);
      return false;
    }
  }
}

// Singleton-Instanz für die Verwendung in der gesamten Anwendung
export const likeRepository = new LikeRepository();
