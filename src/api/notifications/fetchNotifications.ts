import { Notification } from '@/types/notifications';
import { apiClient } from '@/lib/django-api-new';

interface NotificationsResponse {
  results?: Notification[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface UnreadCountResponse {
  count: number;
}

// Django API placeholder for notifications - Notifications are disabled until Django backend is implemented
const notificationsAPI = {
  fetchUserNotifications: async (userId: string): Promise<Notification[]> => {
    console.log('Notifications API called for user:', userId);
    return [];
  },
  countUnreadNotifications: async (userId: string): Promise<number> => {
    console.log('Count unread notifications called for user:', userId);
    return 0;
  }
};

/**
 * Fetches a user's notifications with actor details
 * @param userId The user's ID
 * @returns An array of the user's notifications
 */
export const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    console.log('Fetching notifications for user:', userId);
    
    // Try to fetch from Django API
    const response = await apiClient.get<NotificationsResponse | Notification[]>('/notifications/');
    
    console.log('Raw API response:', response);
    
    if (response) {
      // Handle both paginated and non-paginated responses
      const notifications = Array.isArray(response) ? response : response.results || [];
      console.log('Notifications fetched successfully:', notifications);
      return notifications;
    }
    
    console.log('No notifications found, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching notifications from Django API:', error);
    
    // Fallback: return empty array
    return [];
  }
};

/**
 * Counts a user's unread notifications
 * @param userId The user's ID
 * @returns The number of unread notifications
 */
export const countUnreadNotifications = async (userId: string): Promise<number> => {
  try {
    console.log('Counting unread notifications for user:', userId);
    
    // Try to fetch unread count from Django API
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count/');
    
    console.log('Unread count response:', response);
    
    if (response && response.count !== undefined) {
      console.log('Unread count fetched successfully:', response.count);
      return response.count;
    }
    
    console.log('No unread count found, returning 0');
    return 0;
  } catch (error) {
    console.error('Error counting unread notifications from Django API:', error);
    
    // Fallback: return 0
    return 0;
  }
};
