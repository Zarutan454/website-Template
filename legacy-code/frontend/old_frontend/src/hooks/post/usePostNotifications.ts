
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Hook für die Verwaltung von Post-Benachrichtigungen und Abonnements
 */
export const usePostNotifications = (postId: string, userId?: string) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Prüft, ob der Benutzer den Post abonniert hat
  const checkSubscriptionStatus = useCallback(async () => {
    if (!userId || !postId) return false;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('post_subscriptions')
        .select('active')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
      
      if (error) throw error;
      
      setIsSubscribed(data?.active || false);
      return data?.active || false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, postId]);
  
  // Abonniert oder kündigt das Abonnement eines Posts
  const toggleSubscription = useCallback(async () => {
    if (!userId || !postId) {
      toast.error('Du musst angemeldet sein, um Benachrichtigungen zu erhalten');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Prüfen, ob bereits ein Eintrag existiert
      const { data: existingData, error: checkError } = await supabase
        .from('post_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingData) {
        // Eintrag existiert bereits, Status umschalten
        const newStatus = !existingData.active;
        
        const { error: updateError } = await supabase
          .from('post_subscriptions')
          .update({ active: newStatus })
          .eq('id', existingData.id);
        
        if (updateError) throw updateError;
        
        setIsSubscribed(newStatus);
        
        return newStatus;
      } else {
        // Neues Abonnement erstellen
        const { error: insertError } = await supabase
          .from('post_subscriptions')
          .insert([
            { user_id: userId, post_id: postId, active: true }
          ]);
        
        if (insertError) throw insertError;
        
        setIsSubscribed(true);
        
        return true;
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Benachrichtigungseinstellungen');
      return isSubscribed; // Aktuellen Status zurückgeben
    } finally {
      setIsLoading(false);
    }
  }, [userId, postId, isSubscribed]);
  
  // Initialisierung
  const initialize = useCallback(async () => {
    await checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Beim ersten Laden des Hooks den Status prüfen
  useEffect(() => {
    if (userId && postId) {
      initialize();
    }
  }, [userId, postId, initialize]);
  
  // Add aliases for compatibility with existing code
  const hasNotifications = isSubscribed;
  const toggleNotifications = toggleSubscription;
  
  return {
    isSubscribed,
    hasNotifications,
    isLoading,
    toggleSubscription,
    toggleNotifications,
    checkSubscriptionStatus,
    initialize
  };
};

export default usePostNotifications;
