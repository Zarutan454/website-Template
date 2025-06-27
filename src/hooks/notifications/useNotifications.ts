import { useState, useEffect, useCallback } from 'react';
import { djangoApi, type ApiResponse, type PaginatedResponse } from '@/lib/django-api-new';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
  sender?: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<PaginatedResponse<Notification>> = await djangoApi.getNotifications(page);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const newNotifications = response.data.results;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setHasMore(!!response.data.next);
        setCurrentPage(page);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await djangoApi.getUnreadNotificationCount();
      
      if (response.error) {
        console.error('Failed to fetch unread count:', response.error);
        return;
      }

      if (response.data) {
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const markNotificationRead = useCallback(async (notificationId: number): Promise<boolean> => {
    try {
      const response = await djangoApi.markNotificationRead(notificationId);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Update the notification in the local state
      setNotifications(prev => prev.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, is_read: true };
        }
        return notification;
      }));

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  const markAllNotificationsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await djangoApi.markAllNotificationsRead();
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Update all notifications in the local state
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true
      })));

      // Reset unread count
      setUnreadCount(0);

      return true;
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchNotifications]);

  const refresh = useCallback(() => {
    Promise.all([fetchNotifications(1, false), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markNotificationRead,
    markAllNotificationsRead,
    loadMore,
    refresh,
  };
}; 
