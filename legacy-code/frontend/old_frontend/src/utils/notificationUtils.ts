
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Format date for notifications
export const formatNotificationTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return format(date, "HH:mm 'Uhr'", { locale: de });
    } else if (diffInHours < 48) {
      return 'Gestern';
    } else {
      return format(date, "d. MMMM", { locale: de });
    }
  } catch (err) {
    return timestamp;
  }
};

// Create realtime channel for notifications
export const createNotificationChannel = (
  supabase: { channel: (name: string) => { on: (event: string, config: object, callback: (payload: unknown) => void) => { subscribe: () => unknown } } }, 
  userId: string, 
  callback: (notification: unknown) => void
) => {
  return supabase
    .channel('notifications-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, async (payload: { new: unknown }) => {
      callback(payload.new);
    })
    .subscribe();
};
