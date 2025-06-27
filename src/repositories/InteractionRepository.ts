import { socialAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';

/**
 * Repository für Benutzer-Interaktionen wie Likes, Shares und Reports (Django-API)
 */
class InteractionRepository {
  /**
   * Likt oder unlikt einen Post
   */
  async togglePostLike(postId: string) {
    try {
      const result = await socialAPI.togglePostLike(parseInt(postId, 10));
      
      // Wenn ein Boost gewährt wurde, zeige eine Benachrichtigung
      if (result.boost_granted) {
        toast.success("✨ Mining Boost! Deine Mining-Rate wurde temporär erhöht.");
      }
      
      return {
        success: true,
        isLiked: result.liked,
        likesCount: result.like_count,
        boostGranted: result.boost_granted
      };
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Toggling des Likes:', error);
      return {
        success: false,
        isLiked: false,
        likesCount: 0,
        boostGranted: false
      };
    }
  }

  /**
   * Prüft, ob ein Post von einem Benutzer geliked wurde (über Post-Objekt)
   */
  async isPostLikedByUser(postId: string) {
    try {
      const post = await socialAPI.getPost(parseInt(postId, 10));
      return !!post.is_liked_by_user;
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Prüfen des Like-Status:', error);
      return false;
    }
  }

  /**
   * Holt die Anzahl der Likes für einen Post (über Post-Objekt)
   */
  async getPostLikesCount(postId: string) {
    try {
      const post = await socialAPI.getPost(parseInt(postId, 10));
      return post.likes_count || 0;
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Abrufen der Likes-Anzahl:', error);
      return 0;
    }
  }

  /**
   * Teilt einen Post (bereits Django-API)
   */
  async sharePost(postId: string) {
    try {
      const result = await socialAPI.sharePost(parseInt(postId, 10));
      return result;
    } catch (error) {
      console.error('Fehler beim Teilen des Posts:', error);
      return false;
    }
  }

  /**
   * Meldet einen Post (Platzhalter, ggf. anpassen)
   */
  async reportPost(postId: string, reason: string) {
    try {
      // TODO: Django-API-Endpunkt für Reports implementieren
      toast.info('Report-Funktion ist noch nicht implementiert.');
      return false;
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
      const post = await socialAPI.getPost(parseInt(postId, 10));
      if (!post || !post.content) return null;
      const youtubeId = extractYoutubeVideoId(post.content);
      if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error('[InteractionRepository] Fehler beim Extrahieren des YouTube-Links:', error);
      return null;
    }
  }
}

export const interactionRepository = new InteractionRepository();
