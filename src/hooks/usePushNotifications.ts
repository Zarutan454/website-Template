// Push Notifications Hook

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false,
  });
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check if notifications are supported
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission({
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
        default: Notification.permission === 'default',
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push-Benachrichtigungen werden nicht unterstützt');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      
      setPermission({
        granted,
        denied: result === 'denied',
        default: result === 'default',
      });

      if (granted) {
        toast.success('Push-Benachrichtigungen aktiviert!');
        await subscribeToPushNotifications();
      } else {
        toast.warning('Push-Benachrichtigungen wurden abgelehnt');
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Fehler beim Aktivieren der Push-Benachrichtigungen');
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !permission.granted) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return true;
      }

      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      });

      setSubscription(newSubscription);

      // Send subscription to server
      await sendSubscriptionToServer(newSubscription);

      toast.success('Push-Benachrichtigungen abonniert!');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Fehler beim Abonnieren der Push-Benachrichtigungen');
      return false;
    }
  }, [isSupported, permission.granted]);

  // Send subscription to server
  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription);

      toast.success('Push-Benachrichtigungen deaktiviert');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Fehler beim Deaktivieren der Push-Benachrichtigungen');
      return false;
    }
  }, [subscription]);

  // Remove subscription from server
  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  };

  // Show local notification
  const showNotification = useCallback((notification: Omit<PushNotification, 'id'>) => {
    if (!isSupported || !permission.granted) return;

    const id = Math.random().toString(36).substr(2, 9);
    const fullNotification: PushNotification = { ...notification, id };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge,
          tag: notification.tag,
          data: notification.data,
          actions: notification.actions,
          requireInteraction: false,
          silent: false,
        });
      });
    } else {
      // Fallback to browser notifications
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge,
        tag: notification.tag,
        data: notification.data,
        requireInteraction: false,
        silent: false,
      });
    }
  }, [isSupported, permission.granted]);

  // Handle notification click
  const handleNotificationClick = useCallback((event: NotificationEvent) => {
    event.notification.close();

    // Handle different notification types
    const data = event.notification.data;
    if (data?.type === 'like') {
      // Navigate to post
      window.open(`/post/${data.postId}`, '_blank');
    } else if (data?.type === 'comment') {
      // Navigate to post with comments
      window.open(`/post/${data.postId}#comments`, '_blank');
    } else if (data?.type === 'follow') {
      // Navigate to profile
      window.open(`/profile/${data.username}`, '_blank');
    }
  }, []);

  // Set up notification click handler
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          handleNotificationClick(event.data);
        }
      });
    }
  }, [handleNotificationClick]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showNotification,
  };
};
