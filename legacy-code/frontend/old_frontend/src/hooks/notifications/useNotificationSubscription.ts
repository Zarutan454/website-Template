
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { UserNotification } from './types';

export function useNotificationSubscription(
  setNotifications: React.Dispatch<React.SetStateAction<UserNotification[]>>
) {
  // Setup real-time notifications subscription
  useEffect(() => {
    const setupSubscription = async () => {
      // Verify the user is authenticated before setting up subscription
      const { data: userResponse } = await supabase.auth.getUser();
      
      if (!userResponse?.user) {
        return () => {}; // Return empty cleanup function
      }
      
      // Unified channel for both notification tables
      const notificationsChannel = supabase
        .channel('user-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_details',
          filter: `user_id=eq.${userResponse.user.id}`
        }, (payload) => {
          console.log('New notification_details received:', payload);
          
          if (payload.new) {
            const newNotification = payload.new as UserNotification;
            
            // Check if notification already exists before adding it
            setNotifications(prev => {
              // Check if notification already exists in state
              const exists = prev.some(notification => notification.id === newNotification.id);
              if (exists) {
                console.log('Notification already exists in state, not adding again:', newNotification.id);
                return prev;
              }
              
              // Only show toast notification if it's new
              showNotificationToast(newNotification);
              
              return [newNotification, ...prev];
            });
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userResponse.user.id}`
        }, (payload) => {
          if (payload.new) {
            // Update notification in state
            setNotifications(prev => prev.map(notification => 
              notification.id === (payload.new as UserNotification).id
                ? { ...(payload.new as UserNotification) }
                : notification
            ));
          }
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userResponse.user.id}`
        }, async (payload) => {
          console.log('New notification received:', payload);
          
          // For notifications table we need additional information about the Actor
          if (payload.new) {
            try {
              const { data, error } = await supabase
                .from('notifications')
                .select(`
                  *,
                  actor:users!actor_id (
                    id, 
                    username, 
                    display_name, 
                    avatar_url
                  )
                `)
                .eq('id', payload.new.id)
                .single();
                
              if (!error && data) {
                const formattedNotification = {
                  ...data,
                  actor_username: data.actor?.username || null,
                  actor_display_name: data.actor?.display_name || null,
                  actor_avatar_url: data.actor?.avatar_url || null,
                };
                
                // Check if notification already exists before adding it
                setNotifications(prev => {
                  // Check if notification already exists in state
                  const exists = prev.some(notification => notification.id === formattedNotification.id);
                  if (exists) {
                    console.log('Notification already exists in state, not adding again:', formattedNotification.id);
                    return prev;
                  }
                  
                  // Only show toast notification if it's new
                  showNotificationToast(formattedNotification);
                  
                  return [formattedNotification, ...prev];
                });
              }
            } catch (subscriptionError) {
              console.error('Error processing realtime notification:', subscriptionError);
            }
          }
        })
        .subscribe();
      
      return () => {
        console.log('Cleaning up notification subscription');
        supabase.removeChannel(notificationsChannel);
      };
    };
    
    const cleanup = setupSubscription();
    
    return () => {
      cleanup.then(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [setNotifications]);
}

// Helper function to show toast notifications
function showNotificationToast(notification: UserNotification) {
  const actor = notification.actor_display_name || notification.actor_username || 'System';
  let toastVariant: 'default' | 'destructive' = 'default';
  
  // Select toast variant based on notification type
  switch (notification.type) {
    case 'mining_reward':
      // Fix: Changed from 'success' to 'default' as 'success' is not a valid variant
      toastVariant = 'default';
      break;
    default:
      toastVariant = 'default';
      break;
  }
  
  toast({
    title: "Neue Benachrichtigung",
    description: `${actor} ${notification.content}`,
    variant: toastVariant
  });
}
