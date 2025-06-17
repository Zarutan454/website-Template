
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { isPostSubscribedByUser, subscribeToPost, unsubscribeFromPost } from '@/api/notifications/postSubscriptions';

/**
 * Hook zur Verwaltung von Benachrichtigungen für Likes und Abonnements
 * @param postId Die ID des Posts
 * @param userId Die ID des Benutzers (optional)
 */
const useLikeNotifications = (postId: string, userId?: string) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialisiere den Abonnement-Status
  const initialize = useCallback(async () => {
    if (!postId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const subscribed = await isPostSubscribedByUser(userId, postId);
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Fehler beim Laden des Abonnementstatus:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId]);

  // Abonnement umschalten (an/aus)
  const toggleSubscription = useCallback(async () => {
    if (!postId || !userId) return false;

    try {
      setIsLoading(true);

      // Toggle subscription state
      if (isSubscribed) {
        await unsubscribeFromPost(userId, postId);
        setIsSubscribed(false);
        return false;
      } else {
        await subscribeToPost(userId, postId);
        setIsSubscribed(true);
        return true;
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Abonnementstatus:', error);
      toast.error('Benachrichtigungseinstellung konnte nicht geändert werden');
      return isSubscribed;
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId, isSubscribed]);

  // Automatisch abonnieren wenn ein Post geliked wird
  const subscribeOnLike = useCallback(async (silent: boolean = false) => {
    if (!postId || !userId) return false;

    // Wenn bereits abonniert, nichts tun
    if (isSubscribed) return true;

    try {
      setIsLoading(true);
      await subscribeToPost(userId, postId);
      setIsSubscribed(true);
      
      if (!silent) {
        toast.success('Du wirst nun über Aktivitäten bei diesem Post informiert');
      }
      
      return true;
    } catch (error) {
      console.error('Fehler beim Abonnieren nach Like:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId, isSubscribed]);

  // Supabase-Realtime-Kanal für Abonnement-Updates einrichten
  useEffect(() => {
    if (!postId || !userId) return;

    const channel = supabase
      .channel(`post_subscriptions_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_subscriptions',
        filter: `user_id=eq.${userId} AND post_id=eq.${postId}`
      }, (payload) => {
        initialize();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, userId, initialize]);

  return {
    isSubscribed,
    isLoading,
    toggleSubscription,
    subscribeOnLike,
    initialize
  };
};

export default useLikeNotifications;
