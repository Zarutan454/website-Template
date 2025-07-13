import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/notifications';
import { formatTimeAgo } from '@/utils/dateUtils';
import { useProfile } from './useProfile';
import { useNotificationActions } from './notifications/useNotificationActions';
import { toast } from 'sonner';
import { fetchUserNotifications } from '@/api/notifications/fetchNotifications';
import { useAuth } from '@/hooks/useAuth';
import { notificationAPI } from '@/lib/django-api-new';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: profile } = useAuth();
  
  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Use the optimized fetchUserNotifications function
      const notificationsData = await fetchUserNotifications(profile.id);
      
      // Set the retrieved notifications
      setNotifications(notificationsData);
      
      // Count unread notifications
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      setError(null);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error fetching notifications:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);
  
  // Using notification actions from separate hook
  const { markAsRead, markAllAsRead } = useNotificationActions(
    setNotifications,
    fetchNotifications
  );
  
  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;
    
    try {
      if (notificationId.startsWith('demo-')) {
        // Handle demo notifications in the UI only
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return;
      }
      
      // Delete using Django API
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      console.log(`Notification ${notificationId} deleted successfully`);
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Fehler beim Löschen der Benachrichtigung');
    }
  }, [profile, notifications]);
  
  // Format time to localized string
  const formatTime = useCallback((timestamp: string) => {
    return formatTimeAgo(new Date(timestamp));
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    formatTime
  };
};

export type { Notification };
