
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { BaseInteractionRepository } from './interactions/BaseInteractionRepository';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';

/**
 * Repository für Benutzer-Interaktionen wie Likes, Shares und Reports
 */
class InteractionRepository extends BaseInteractionRepository {
  /**
   * Likt oder unlikt einen Post
   */
  async togglePostLike(userId: string, postId: string) {
    try {
      // Verwende die Supabase-Funktion toggle_post_like
      const { data, error } = await this.supabase.rpc('toggle_post_like', {
        p_user_id: userId,
        p_post_id: postId
      });
      
      if (error) throw error;
      
      return {
        success: true,
        isLiked: data.is_liked,
        likesCount: data.likes_count
      };
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Toggling des Likes:', error);
      return {
        success: false,
        isLiked: false,
        likesCount: 0
      };
    }
  }
  
  /**
   * Prüft, ob ein Post von einem Benutzer geliked wurde
   */
  async isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
    try {
      console.log(`[InteractionRepository] Prüfe Like-Status für Post ${postId} von User ${userId}`);
      
      const { data, error } = await this.supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle(); // Fixed: Changed from .single() to .maybeSingle() to avoid 406 errors
      
      if (error) {
        console.error('[InteractionRepository] Fehler beim Prüfen des Like-Status:', error);
        return false;
      }
      
      const isLiked = !!data;
      console.log(`[InteractionRepository] Post ${postId} ist vom User ${userId} geliked: ${isLiked}`);
      
      return isLiked;
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Prüfen des Like-Status:', error);
      return false;
    }
  }
  
  /**
   * Holt die Anzahl der Likes für einen Post
   */
  async getPostLikesCount(postId: string): Promise<number> {
    try {
      console.log(`[InteractionRepository] Hole Likes-Anzahl für Post ${postId}`);
      
      const { data, error } = await this.supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      console.log(`[InteractionRepository] Likes-Anzahl für Post ${postId}: ${count}`);
      
      return count;
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Abrufen der Likes-Anzahl:', error);
      return 0;
    }
  }
  
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
  
  /**
   * Prüft, ob ein Post einen YouTube-Link enthält und gibt den Embed-URL zurück
   */
  async getYouTubeEmbedForPost(postId: string) {
    try {
      console.log(`[InteractionRepository] Prüfe auf YouTube-Link in Post ${postId}`);
      
      // Holt den Post-Inhalt
      const { data, error } = await this.supabase
        .from('posts')
        .select('content')
        .eq('id', postId)
        .single();
        
      if (error) {
        console.error('[InteractionRepository] Fehler beim Abrufen des Posts:', error);
        return null;
      }
      
      if (!data || !data.content) {
        console.log('[InteractionRepository] Kein Inhalt im Post gefunden');
        return null;
      }
      
      // Rufe die Hilfsfunktion auf, um die YouTube-ID zu extrahieren
      const youtubeId = extractYoutubeVideoId(data.content);
      
      if (youtubeId) {
        console.log(`[InteractionRepository] YouTube-ID gefunden: ${youtubeId}`);
        return `https://www.youtube.com/embed/${youtubeId}`;
      } else {
        console.log('[InteractionRepository] Keine YouTube-ID gefunden');
        return null;
      }
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Extrahieren des YouTube-Links:', error);
      return null;
    }
  }
}

// Singleton-Instanz für die Verwendung in der gesamten Anwendung
export const interactionRepository = new InteractionRepository();
