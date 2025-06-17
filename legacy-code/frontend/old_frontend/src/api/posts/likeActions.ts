import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { createNotification } from '@/api/notifications';

/**
 * Schaltet den Like-Status eines Beitrags um und aktualisiert den Zähler in der Datenbank
 */
export async function togglePostLike(userId: string, postId: string) {
  
  try {
    if (!userId || !postId) {
      console.error('[API] togglePostLike: Ungültige Benutzerdaten oder Post-ID', { userId, postId });
      return { success: false, error: 'Invalid user or post data' };
    }
    
    // Direkte Ausführung der Datenbank-Funktion mit fester search_path
    const { data, error } = await supabase.rpc('toggle_post_like', {
      p_user_id: userId,
      p_post_id: postId
    });
    
    if (error) {
      console.error('[API] togglePostLike: Fehler bei RPC-Aufruf:', error);
      return { success: false, error };
    }
    
    console.log('[API] togglePostLike: Erfolgreiche Aktualisierung:', data);
    
    // Wenn der Beitrag geliked wurde, erstelle Benachrichtigungen
    if (data.action === 'liked') {
      try {
        // Import the createLikeNotification function
        const { createLikeNotification } = await import('@/api/notifications/likeNotifications');
        
        // Create notification for like
        await createLikeNotification(userId, postId);
      } catch (notifError) {
        console.error('[API] togglePostLike: Fehler bei Benachrichtigungserstellung:', notifError);
        // Fehler bei Benachrichtigung sollten den Erfolg des Like nicht beeinflussen
      }
    }
    
    // Prüfen, ob ein Post beim Liken automatisch abonniert werden soll
    if (data.action === 'liked') {
      try {
        await subscribeToPostOnLike(userId, postId);
      } catch (subError) {
        console.error('[API] togglePostLike: Fehler beim automatischen Abonnieren:', subError);
        // Fehler beim Abonnieren sollten den Erfolg des Like nicht beeinflussen
      }
    }
    
    // Rückgabe enthält action: 'liked'/'unliked', is_liked: boolean, likes_count: number
    return { 
      success: true, 
      isLiked: data.is_liked, 
      likesCount: data.likes_count,
      action: data.action
    };
  } catch (error) {
    console.error('[API] togglePostLike: Unbehandelter Fehler:', error);
    return { success: false, error };
  }
}

/**
 * Prüft, ob ein Beitrag von einem Benutzer geliked wurde
 */
export async function isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
  if (!userId || !postId) return false;
  
  try {
    // Use `select('id')` instead of `select('*')` and use maybeSingle() instead of single()
    // This will prevent the 406 error
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle(); // Changed from .single() to .maybeSingle() to avoid 406 errors
      
    if (error) {
      console.error('[API] isPostLikedByUser: Fehler:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('[API] isPostLikedByUser: Unbehandelter Fehler:', error);
    return false;
  }
}

/**
 * Erhöht den Like-Zähler für einen Post
 */
export async function incrementLikeCount(postId: string): Promise<boolean> {
  try {
    // Direkte Aktualisierung der Likes-Anzahl im Post
    const { error } = await supabase
      .from('posts')
      .update({ 
        likes_count: supabase.rpc('increment', { value: 1 }),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
      
    if (error) {
      console.error('[API] incrementLikeCount: Fehler bei der Aktualisierung des Like-Zählers:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[API] incrementLikeCount: Unbehandelter Fehler:', error);
    return false;
  }
}

/**
 * Verringert den Like-Zähler für einen Post
 */
export async function decrementLikeCount(postId: string): Promise<boolean> {
  try {
    // Direkte Aktualisierung der Likes-Anzahl im Post mit mathematischer Operation
    const { error } = await supabase
      .from('posts')
      .update({ 
        likes_count: supabase.rpc('decrement', { value: 1 }),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
      
    if (error) {
      console.error('[API] decrementLikeCount: Fehler bei der Aktualisierung des Like-Zählers:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[API] decrementLikeCount: Unbehandelter Fehler:', error);
    return false;
  }
}

/**
 * Automatisches Abonnieren eines Posts beim Liken
 */
export async function subscribeToPostOnLike(userId: string, postId: string): Promise<boolean> {
  try {
    // Prüfen, ob bereits ein Abonnement existiert
    const { data: existingSubscription, error: checkError } = await supabase
      .from('post_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    
    if (checkError) {
      console.error('[API] subscribeToPostOnLike: Fehler beim Prüfen des Abonnements:', checkError);
      throw checkError;
    }
    
    // Wenn kein Abonnement existiert oder es inaktiv ist, erstellen/aktivieren
    if (!existingSubscription) {
      const { error: insertError } = await supabase
        .from('post_subscriptions')
        .insert([
          { user_id: userId, post_id: postId, active: true }
        ]);
      
      if (insertError) {
        console.error('[API] subscribeToPostOnLike: Fehler beim Erstellen des Abonnements:', insertError);
        throw insertError;
      }
      
      console.log(`[API] subscribeToPostOnLike: Neues Abonnement für Post ${postId} erstellt`);
      return true;
    } else if (!existingSubscription.active) {
      const { error: updateError } = await supabase
        .from('post_subscriptions')
        .update({ active: true })
        .eq('id', existingSubscription.id);
      
      if (updateError) {
        console.error('[API] subscribeToPostOnLike: Fehler beim Aktivieren des Abonnements:', updateError);
        throw updateError;
      }
      
      console.log(`[API] subscribeToPostOnLike: Abonnement für Post ${postId} aktiviert`);
      return true;
    }
    
    return existingSubscription.active;
  } catch (error) {
    console.error('[API] subscribeToPostOnLike: Fehler beim Abonnieren des Posts:', error);
    return false;
  }
}
