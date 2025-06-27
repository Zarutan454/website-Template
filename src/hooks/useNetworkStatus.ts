
import { useState, useEffect, useCallback } from 'react';

interface NetworkStatusHookResult {
  status: 'online' | 'offline' | 'reconnecting';
  isOnline: boolean;
  isOffline: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
  attemptReconnection: (callback?: () => Promise<unknown> | void) => Promise<boolean>;
}

/**
 * Hook zur Überwachung und Verwaltung des Netzwerkstatus
 * - Erkennt Online- und Offline-Zustände automatisch
 * - Bietet Hilfsfunktionen für Wiederverbindungsversuche
 * - Speichert Zeitstempel für Status-Änderungen
 */
export const useNetworkStatus = (): NetworkStatusHookResult => {
  const [status, setStatus] = useState<'online' | 'offline' | 'reconnecting'>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | null>(
    navigator.onLine ? null : new Date()
  );
  
  // Event-Handler für Online-Status
  const handleOnline = useCallback(() => {
    setStatus('online');
    setLastOnlineAt(new Date());
  }, []);
  
  // Event-Handler für Offline-Status
  const handleOffline = useCallback(() => {
    setStatus('offline');
    setLastOfflineAt(new Date());
  }, []);
  
  // Hooks für Browser-Online/Offline-Events
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);
  
  // Wiederverbindungsversuch mit optionalem Callback
  const attemptReconnection = useCallback(async (callback?: () => Promise<any> | void) => {
    if (status === 'reconnecting') return false;
    
    try {
      setStatus('reconnecting');
      
      // Prüfen, ob eine Internetverbindung verfügbar ist
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const isConnected = response.ok;
      
      if (isConnected) {
        setStatus('online');
        setLastOnlineAt(new Date());
        
        if (callback) {
          await callback();
        }
        
        return true;
      } else {
        setStatus('offline');
        return false;
      }
    } catch (error) {
      console.error('[useNetworkStatus] Reconnection attempt failed:', error);
      setStatus('offline');
      return false;
    }
  }, [status]);
  
  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    lastOnlineAt,
    lastOfflineAt,
    attemptReconnection
  };
};
