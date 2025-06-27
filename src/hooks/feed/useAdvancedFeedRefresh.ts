
import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedType } from './useFeedData';
import { toast } from 'sonner';

interface UseAdvancedFeedRefreshOptions {
  fetchPosts: (feedType?: string) => Promise<void>;
  feedType: FeedType;
  isAuthenticated: boolean;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  refreshThrottle?: number;
  offlineRetryInterval?: number;
  showToasts?: boolean;
}

/**
 * Erweiterter Hook für intelligente Feed-Aktualisierungen mit 
 * Netzwerkstatus-Erkennung, Drosselung und optimierten Benachrichtigungen
 */
export const useAdvancedFeedRefresh = ({
  fetchPosts,
  feedType,
  isAuthenticated,
  enableAutoRefresh = true,
  refreshInterval = 120000, // 2 Minuten Standardintervall
  refreshThrottle = 5000, // 5 Sekunden minimaler Abstand zwischen Aktualisierungen
  offlineRetryInterval = 30000, // 30 Sekunden Wartezeit bei Offline-Status
  showToasts = true
}: UseAdvancedFeedRefreshOptions) => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Verwenden von Refs für Werte, die nicht neu rendern sollen
  const refreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef<Date>(new Date());
  const lastCheckTimeRef = useRef<Date>(new Date());
  const offlineRetryTimerRef = useRef<number | null>(null);
  
  // Netzwerkstatus überwachen
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Automatische Aktualisierung bei Wiederverbindung
      if (isAuthenticated && enableAutoRefresh) {
        toast.info('Netzwerkverbindung wiederhergestellt. Feed wird aktualisiert...');
        handleRefresh(true);
      }
    };
    
    const handleOffline = () => {
      console.log('[Feed Refresh] Netzwerkverbindung verloren');
      setIsOnline(false);
      
      if (showToasts) {
        toast.error('Keine Internetverbindung. Feed-Aktualisierungen sind vorübergehend deaktiviert.');
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Timer bereinigen
      if (offlineRetryTimerRef.current) {
        clearTimeout(offlineRetryTimerRef.current);
      }
    };
  }, [isAuthenticated, enableAutoRefresh, showToasts]);
  
  // Intelligente Aktualisierungsfunktion mit Drosselung und Fehlerbehebung
  const handleRefresh = useCallback(async (bypassThrottle = false) => {
    if (!isAuthenticated || refreshingRef.current) return false;
    
    // Drosselung verhindern, wenn nicht explizit umgangen
    if (!bypassThrottle) {
      const now = new Date();
      const timeSinceLastRefresh = now.getTime() - lastRefreshTimeRef.current.getTime();
      
      if (timeSinceLastRefresh < refreshThrottle) {
        console.log(`[Feed Refresh] Aktualisierung gedrosselt. Bitte warten Sie ${Math.ceil((refreshThrottle - timeSinceLastRefresh) / 1000)} Sekunden.`);
        if (showToasts) {
          toast.info('Zu viele Aktualisierungen. Bitte warten Sie einen Moment.');
        }
        return false;
      }
    }
    
    // Offline-Status überprüfen
    if (!navigator.onLine) {
      console.log('[Feed Refresh] Offline-Status erkannt. Aktualisierung fehlgeschlagen.');
      
      if (showToasts) {
        toast.error('Keine Internetverbindung. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.');
      }
      
      // Aktualisierung automatisch wiederholen, wenn wieder online
      if (offlineRetryTimerRef.current) {
        clearTimeout(offlineRetryTimerRef.current);
      }
      
      offlineRetryTimerRef.current = window.setTimeout(() => {
        if (navigator.onLine) {
          console.log('[Feed Refresh] Automatischer Wiederholungsversuch nach Offline-Status');
          handleRefresh(true);
        }
      }, offlineRetryInterval) as unknown as number;
      
      return false;
    }
    
    console.log(`[Feed Refresh] Manuelles Aktualisieren des ${feedType}-Feeds`);
    refreshingRef.current = true;
    setIsRefreshing(true);
    
    try {
      await fetchPosts(feedType);
      setHasNewPosts(false);
      setLastRefresh(new Date());
      lastRefreshTimeRef.current = new Date();
      return true;
    } catch (error) {
      console.error(`[Feed Refresh] Fehler beim Aktualisieren des ${feedType}-Feeds:`, error);
      
      if (showToasts) {
        toast.error('Feed konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.');
      }
      
      return false;
    } finally {
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
  }, [fetchPosts, feedType, isAuthenticated, refreshThrottle, showToasts, offlineRetryInterval]);
  
  // Prüfen-Funktion zum Erkennen neuer Beiträge ohne vollständige Aktualisierung
  const checkForNewPosts = useCallback(async () => {
    if (!isAuthenticated || !isOnline || refreshingRef.current) return;
    
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - lastCheckTimeRef.current.getTime();
    
    // Überprüfung höchstens alle 30 Sekunden
    if (timeSinceLastCheck < 30000) return;
    
    lastCheckTimeRef.current = now;
    
    try {
      // Diese Funktion würde idealer Weise einen leichten API-Aufruf machen,
      // der nur prüft, ob neue Beiträge vorhanden sind
      console.log(`[Feed Refresh] Prüfen auf neue Beiträge für ${feedType}`);
      
      // Simulierte Implementierung für das Konzept
      const hasNew = Math.random() > 0.7; // 30% Chance für neue Beiträge
      
      if (hasNew) {
        setHasNewPosts(true);
        console.log('[Feed Refresh] Neue Beiträge erkannt');
      }
    } catch (error) {
      console.error('[Feed Refresh] Fehler beim Prüfen auf neue Beiträge:', error);
    }
  }, [isAuthenticated, isOnline, feedType]);
  
  // Automatische Überprüfung auf neue Beiträge
  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated || !isOnline) return;
    
    console.log(`[Feed Refresh] Automatische Aktualisierung aktiviert. Intervall: ${refreshInterval / 1000}s`);
    
    const intervalId = setInterval(() => {
      checkForNewPosts();
    }, refreshInterval / 2);
    
    // Bereinigung des Intervalls
    return () => {
      clearInterval(intervalId);
    };
  }, [enableAutoRefresh, refreshInterval, isAuthenticated, isOnline, checkForNewPosts]);
  
  // Zeit seit der letzten Aktualisierung formatieren
  const getTimeSinceLastRefresh = useCallback(() => {
    const seconds = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
    
    if (seconds < 5) return 'Gerade eben';
    if (seconds < 60) return `vor ${seconds} Sekunden`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    const days = Math.floor(seconds / 86400);
    return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
  }, [lastRefresh]);

  return {
    lastRefresh,
    hasNewPosts,
    setHasNewPosts,
    isRefreshing,
    isOnline,
    handleRefresh,
    checkForNewPosts,
    getTimeSinceLastRefresh
  };
};
