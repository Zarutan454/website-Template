import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext.utils';
import { notificationAPI, type Notification } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface UseDjangoNotificationsProps {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  isRefreshing: boolean;
}

/**
 * Django-basierter Notification Hook - Migriert von Supabase
 * 
 * ALT (Supabase):
 * const { data: notifications } = useSupabaseQuery('notifications');
 * 
 * NEU (Django):
 * const { notifications, unreadCount, markAsRead } = useDjangoNotifications();
 */
export const useDjangoNotifications = ({
  enableAutoRefresh = true,
  refreshInterval = 30000, // 30 Sekunden für Notifications
  pageSize = 20
}: UseDjangoNotificationsProps) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    isRefreshing: false
  });

  // Timer-Referenzen
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshLockRef = useRef<boolean>(false);

  // Fetch Notifications
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, error: 'Nicht authentifiziert' }));
      return;
    }

    if (refreshLockRef.current && !append) return;

    try {
      setState(prev => ({
        ...prev,
        isLoading: !append,
        isRefreshing: !append,
        error: null
      }));

      refreshLockRef.current = true;

      const response = await notificationAPI.getNotifications({ page, limit: pageSize });
      const newNotifications = response.data.results;
      const hasNext = !!response.data.next;

      setState(prev => ({
        ...prev,
        notifications: append ? [...prev.notifications, ...newNotifications] : newNotifications,
        isLoading: false,
        isRefreshing: false,
        hasMore: hasNext,
        currentPage: page,
        error: null
      }));

    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
      
      let errorMessage = 'Fehler beim Laden der Benachrichtigungen';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string } } };
        errorMessage = apiError.response?.data?.detail || errorMessage;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage
      }));
    } finally {
      setTimeout(() => {
        refreshLockRef.current = false;
      }, 1000);
    }
  }, [isAuthenticated, user, pageSize]);

  // Fetch Unread Count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await notificationAPI.getUnreadCount();
      setState(prev => ({
        ...prev,
        unreadCount: response.data.count
      }));
    } catch (error: unknown) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated, user]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      fetchNotifications(state.currentPage + 1, true);
    }
  }, [state.hasMore, state.isLoading, state.currentPage, fetchNotifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) {
      toast.error('Bitte melde dich an');
      return false;
    }

    try {
      await notificationAPI.markAsRead(notificationId);

      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));

      return true;
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      toast.error('Fehler beim Markieren als gelesen');
      return false;
    }
  }, [isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Bitte melde dich an');
      return false;
    }

    try {
      await notificationAPI.markAllAsRead();

      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      }));

      toast.success('Alle Benachrichtigungen als gelesen markiert');
      return true;
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Fehler beim Markieren aller als gelesen');
      return false;
    }
  }, [isAuthenticated]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) {
      toast.error('Bitte melde dich an');
      return false;
    }

    try {
      await notificationAPI.deleteNotification(notificationId);

      // Update local state
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: notification && !notification.read 
            ? Math.max(0, prev.unreadCount - 1) 
            : prev.unreadCount
        };
      });

      toast.success('Benachrichtigung gelöscht');
      return true;
    } catch (error: unknown) {
      console.error('Error deleting notification:', error);
      toast.error('Fehler beim Löschen der Benachrichtigung');
      return false;
    }
  }, [isAuthenticated]);

  // Get notification settings
  const getSettings = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const response = await notificationAPI.getSettings();
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  }, [isAuthenticated]);

  // Update notification settings
  const updateSettings = useCallback(async (settings: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    like_notifications?: boolean;
    comment_notifications?: boolean;
    follow_notifications?: boolean;
    mention_notifications?: boolean;
    mining_notifications?: boolean;
    system_notifications?: boolean;
  }) => {
    if (!isAuthenticated) {
      toast.error('Bitte melde dich an');
      return false;
    }

    try {
      await notificationAPI.updateSettings(settings);
      toast.success('Einstellungen aktualisiert');
      return true;
    } catch (error: unknown) {
      console.error('Error updating notification settings:', error);
      toast.error('Fehler beim Aktualisieren der Einstellungen');
      return false;
    }
  }, [isAuthenticated]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }) => {
    if (!isAuthenticated) {
      toast.error('Bitte melde dich an');
      return false;
    }

    try {
      await notificationAPI.subscribeToPush(subscription);
      toast.success('Push-Benachrichtigungen aktiviert');
      return true;
    } catch (error: unknown) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Fehler beim Aktivieren der Push-Benachrichtigungen');
      return false;
    }
  }, [isAuthenticated]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Bitte melde dich an');
      return false;
    }

    try {
      await notificationAPI.unsubscribeFromPush();
      toast.success('Push-Benachrichtigungen deaktiviert');
      return true;
    } catch (error: unknown) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Fehler beim Deaktivieren der Push-Benachrichtigungen');
      return false;
    }
  }, [isAuthenticated]);

  // Auto-refresh setup
  useEffect(() => {
    if (enableAutoRefresh && isAuthenticated) {
      refreshTimerRef.current = setInterval(() => {
        if (!refreshLockRef.current) {
          fetchUnreadCount(); // Nur unread count aktualisieren
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [enableAutoRefresh, isAuthenticated, refreshInterval, fetchUnreadCount]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(1, false);
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    isRefreshing: state.isRefreshing,

    // Actions
    fetchNotifications,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getSettings,
    updateSettings,
    subscribeToPush,
    unsubscribeFromPush
  };
}; 

