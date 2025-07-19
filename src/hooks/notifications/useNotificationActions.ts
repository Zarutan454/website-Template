import React, { useCallback } from 'react';
import { Notification } from '@/types/notifications';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notifications/markNotifications';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext.utils';

export const useNotificationActions = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  refetchNotifications?: () => Promise<void>
) => {
  const { user: profile } = useAuth();
  
  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;
    
    try {
      // Check if already read
      let isAlreadyRead = false;
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        isAlreadyRead = notification?.read || false;
        return prev;
      });
      
      if (isAlreadyRead) return;
      
      // If it's a demo notification, just update state
      if (notificationId.startsWith('demo-')) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        return;
      }
      
      // Otherwise call the API
      const success = await markNotificationAsRead(notificationId);
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      } else {
        toast.error('Fehler beim Markieren als gelesen');
      }
    } catch (err) {
      toast.error('Fehler beim Markieren als gelesen');
    }
  }, [profile, setNotifications]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      // Check for unread notifications
      let hasUnread = false;
      
      setNotifications(prev => {
        hasUnread = prev.some(n => !n.read);
        return prev;
      });
      
      if (!hasUnread) return;
      
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        if (refetchNotifications) {
          // Refetch to get the updated state from the server
          await refetchNotifications();
        } else {
          // Update local state
          setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
          );
        }
        
        toast.success('Alle Benachrichtigungen als gelesen markiert');
      } else {
        toast.error('Fehler beim Markieren der Benachrichtigungen');
      }
    } catch (err) {
      toast.error('Fehler beim Markieren der Benachrichtigungen');
    }
  }, [profile, setNotifications, refetchNotifications]);
  
  return {
    markAsRead,
    markAllAsRead
  };
};

