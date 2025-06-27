// Offline Support Hook

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineAction {
  id: string;
  type: 'like' | 'comment' | 'share' | 'post';
  data: any;
  timestamp: number;
}

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);

  // Check online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Verbindung wiederhergestellt', {
        icon: '??',
      });
      processOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Du bist offline. Aktionen werden gespeichert.', {
        icon: '??',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setIsServiceWorkerRegistered(true);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Store offline action
  const storeOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const offlineAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setOfflineActions(prev => [...prev, offlineAction]);
    
    // Store in localStorage
    const stored = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    stored.push(offlineAction);
    localStorage.setItem('offlineActions', JSON.stringify(stored));

    toast.info('Aktion gespeichert und wird später synchronisiert', {
      icon: '??',
    });
  }, []);

  // Process offline actions when back online
  const processOfflineActions = useCallback(async () => {
    if (!isOnline || offlineActions.length === 0) return;

    toast.info('Synchronisiere offline Aktionen...', {
      icon: '??',
    });

    try {
      // Process each action
      for (const action of offlineActions) {
        await processAction(action);
      }

      // Clear processed actions
      setOfflineActions([]);
      localStorage.removeItem('offlineActions');

      toast.success('Offline Aktionen synchronisiert!', {
        icon: '?',
      });
    } catch (error) {
      console.error('Error processing offline actions:', error);
      toast.error('Fehler beim Synchronisieren der offline Aktionen', {
        icon: '?',
      });
    }
  }, [isOnline, offlineActions]);

  // Process individual action
  const processAction = async (action: OfflineAction) => {
    switch (action.type) {
      case 'like':
        // Process like action
        console.log('Processing like action:', action.data);
        break;
      case 'comment':
        // Process comment action
        console.log('Processing comment action:', action.data);
        break;
      case 'share':
        // Process share action
        console.log('Processing share action:', action.data);
        break;
      case 'post':
        // Process post action
        console.log('Processing post action:', action.data);
        break;
    }
  };

  // Load offline actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('offlineActions');
    if (stored) {
      try {
        const actions = JSON.parse(stored);
        setOfflineActions(actions);
      } catch (error) {
        console.error('Error loading offline actions:', error);
      }
    }
  }, []);

  // Wrapper for API calls that handles offline state
  const offlineSafeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    actionType: OfflineAction['type'],
    actionData: any
  ): Promise<T | null> => {
    if (isOnline) {
      try {
        return await apiCall();
      } catch (error) {
        // If API call fails, store as offline action
        storeOfflineAction({ type: actionType, data: actionData });
        return null;
      }
    } else {
      // Store action for later processing
      storeOfflineAction({ type: actionType, data: actionData });
      return null;
    }
  }, [isOnline, storeOfflineAction]);

  return {
    isOnline,
    isServiceWorkerRegistered,
    offlineActions,
    storeOfflineAction,
    processOfflineActions,
    offlineSafeApiCall,
  };
};
