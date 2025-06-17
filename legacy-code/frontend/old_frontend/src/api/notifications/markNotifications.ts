import { supabase } from '@/lib/supabase';

/**
 * Marks a notification as read
 * @param notificationId The ID of the notification to mark as read
 * @returns True if the operation was successful
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    if (!notificationId) return false;
    
    // Check if it's a demo notification
    if (notificationId.startsWith('demo-')) {
      return true;
    }
    
    // Update the notification in the database
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception marking notification as read:', error);
    return false;
  }
};

/**
 * Marks multiple notifications as read
 * @param notificationIds Array of notification IDs to mark as read
 * @returns True if the operation was successful
 */
export const markNotificationsAsRead = async (notificationIds: string[]): Promise<boolean> => {
  try {
    if (!notificationIds.length) return true;
    
    // Filter out demo notifications
    const realNotificationIds = notificationIds.filter(id => !id.startsWith('demo-'));
    
    if (realNotificationIds.length === 0) return true;
    
    // Update the notifications in the database
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .in('id', realNotificationIds);
    
    if (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception marking notifications as read:', error);
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 * @param userId The user's ID
 * @returns True if the operation was successful
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Update all unread notifications for the user
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return false;
  }
};
