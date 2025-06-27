import { notificationAPI } from '@/lib/django-api-new';

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
    
    // Update the notification using Django API
    await notificationAPI.markAsRead(notificationId);
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
    
    // Mark each notification as read individually using Django API
    const promises = realNotificationIds.map(id => notificationAPI.markAsRead(id));
    await Promise.all(promises);
    
    return true;
  } catch (error) {
    console.error('Exception marking notifications as read:', error);
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 * @param userId The user's ID (not needed for Django API as it uses authentication)
 * @returns True if the operation was successful
 */
export const markAllNotificationsAsRead = async (userId?: string): Promise<boolean> => {
  try {
    // Mark all notifications as read using Django API
    await notificationAPI.markAllAsRead();
    return true;
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return false;
  }
};
