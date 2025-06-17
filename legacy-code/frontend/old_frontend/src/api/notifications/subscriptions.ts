
import { supabase } from '@/lib/supabase';

/**
 * Sets up a realtime subscription for a user's notifications
 * @param userId The user's ID
 * @param onNotification Callback function when a notification is received
 * @returns A cleanup function to remove the subscription
 */
export const subscribeToUserNotifications = (
  userId: string,
  onNotification: (notification: Record<string, unknown>) => void
) => {
  // Subscribe to INSERT events on the notifications table
  const notificationsChannel = supabase
    .channel('user-notifications-' + userId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notification_details',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      onNotification(payload.new);
    })
    .subscribe();

  // Return a cleanup function
  return () => {
    supabase.removeChannel(notificationsChannel);
  };
};
