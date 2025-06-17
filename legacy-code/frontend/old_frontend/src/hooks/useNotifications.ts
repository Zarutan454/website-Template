
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { formatTimeAgo } from '@/utils/timeAgo';
import { useProfile } from './useProfile';
import { useNotificationActions } from './notifications/useNotificationActions';
import { toast } from 'sonner';
import { fetchUserNotifications } from '@/api/notifications/fetchNotifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useProfile();
  
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
      
      // Delete from both tables
      const deleteFromNotifications = supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', profile.id);
        
      const deleteFromDetails = supabase
        .from('notification_details')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', profile.id);
        
      // Run both delete operations in parallel
      const [notificationsResult, detailsResult] = await Promise.all([
        deleteFromNotifications,
        deleteFromDetails
      ]);
      
      if (notificationsResult.error) {
        console.error('Error deleting from notifications table:', notificationsResult.error);
      }
      
      if (detailsResult.error) {
        console.error('Error deleting from notification_details table:', detailsResult.error);
      }
      
      if (notificationsResult.error && detailsResult.error) {
        throw new Error('Failed to delete notification from both tables');
      }
      
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
  
  // Set up a realtime subscription for new notifications
  useEffect(() => {
    if (!profile?.id) return;
    
    console.log('Setting up realtime notification subscription...');
    
    // Subscribe to notification changes
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`
      }, (payload) => {
        console.log('New notification received:', payload);
        // Reload all notifications since the new one might not be in notification_details immediately
        fetchNotifications();
        // Show toast notification
        toast.info('Neue Benachrichtigung erhalten');
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`
      }, (payload) => {
        console.log('Notification updated:', payload);
        fetchNotifications();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_details',
        filter: `user_id=eq.${profile.id}`
      }, (payload) => {
        console.log('New notification detail received:', payload);
        fetchNotifications();
        // Show toast notification
        toast.info('Neue Benachrichtigung erhalten');
      })
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });
    
    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [profile, fetchNotifications]);
  
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
