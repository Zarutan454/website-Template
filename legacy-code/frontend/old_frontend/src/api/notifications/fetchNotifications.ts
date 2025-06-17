
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';

/**
 * Fetches a user's notifications with actor details
 * @param userId The user's ID
 * @returns An array of the user's notifications
 */
export const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    
    // Use the optimized notification_details view for faster queries
    const { data, error } = await supabase
      .from('notification_details')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    return data as Notification[];
  } catch (error) {
    console.error('Unexpected error fetching notifications:', error);
    throw error;
  }
};

/**
 * Counts a user's unread notifications
 * @param userId The user's ID
 * @returns The number of unread notifications
 */
export const countUnreadNotifications = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notification_details')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error counting unread notifications:', error);
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Unexpected error counting unread notifications:', error);
    return 0;
  }
};
