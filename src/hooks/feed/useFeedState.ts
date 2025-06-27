import { useState, useCallback, useEffect, useRef } from 'react';
import { FeedType } from './useFeedData';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

/**
 * Einheitlicher Hook zum Verwalten des Feed-Status mit Echtzeit-Updates,
 * Filterung, Sortierung und automatischen Aktualisierungen
 */
export const useFeedState = (initialFeedType?: FeedType) => {
  // Feed-Typ und Basis-Zustandsverwaltung
  const [currentFeedType, setCurrentFeedType] = useState<FeedType>(initialFeedType || 'recent');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortType, setSortType] = useState<string>('newest');
  
  // Aktualisierungszustand
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Benutzerkontext
  const { user: profile } = useAuth();
  
  // Intervall für automatische Aktualisierungsprüfung
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkNewPostsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const AUTO_REFRESH_INTERVAL = 60000; // 1 Minute
  const CHECK_NEW_POSTS_INTERVAL = 30000; // 30 Sekunden
  
  // Cleanup für Auto-Refresh beim Unmount
  useEffect(() => {
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      if (checkNewPostsIntervalRef.current) {
        clearInterval(checkNewPostsIntervalRef.current);
      }
    };
  }, []);
  
  // Aktiviere Auto-Refresh-Prüfung
  const enableAutoRefresh = useCallback((enabled: boolean = true) => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
    
    if (enabled) {
      autoRefreshIntervalRef.current = setInterval(() => {
        refreshFeed();
      }, AUTO_REFRESH_INTERVAL);
    }
  }, []);
  
  // Aktiviere Prüfung auf neue Beiträge
  const enableNewPostsCheck = useCallback((enabled: boolean = true) => {
    if (checkNewPostsIntervalRef.current) {
      clearInterval(checkNewPostsIntervalRef.current);
      checkNewPostsIntervalRef.current = null;
    }
    
    if (enabled) {
      checkNewPostsIntervalRef.current = setInterval(() => {
        // Im Produktivbetrieb würde hier ein leichtgewichtiger API-Call erfolgen,
        // der nur prüft, ob neue Beiträge vorhanden sind
        const shouldShowNewPostsNotification = Math.random() > 0.6; // Simuliere zufällig neue Beiträge
        if (shouldShowNewPostsNotification) {
          setHasNewPosts(true);
        }
      }, CHECK_NEW_POSTS_INTERVAL);
    }
  }, []);
  
  // Toggle für Filter-Menü
  const toggleFilters = useCallback(() => {
    setShowFilterMenu(prev => !prev);
  }, []);
  
  // Filter-Auswahl Handler
  const handleFilterSelect = useCallback((filter: string | null) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);
  }, []);
  
  // Sortierungsänderung Handler
  const handleSortChange = useCallback((value: string) => {
    setSortType(value);
  }, []);
  
  // Feed-Typ-Änderung Handler
  const changeFeedType = useCallback((feedType: FeedType) => {
    setCurrentFeedType(feedType);
    setHasNewPosts(false);
    setLastRefresh(new Date());
  }, []);
  
  // Feed-Aktualisierung Handler mit verbesserter Logik
  const refreshFeed = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setHasNewPosts(false);
    setLastRefresh(new Date());
    
    // Simuliere asynchrone Aktualisierung
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Feed wurde aktualisiert");
    }, 800);
  }, []);
  
  // Prüft, ob der Feed personalisiert ist
  const isPersonalizedFeed = useCallback(() => {
    return currentFeedType === 'following' || currentFeedType === 'foryou';
  }, [currentFeedType]);
  
  // Prüft, ob der Feed spezialisiert ist
  const isSpecializedFeed = useCallback(() => {
    return currentFeedType === 'tokens' || currentFeedType === 'nfts';
  }, [currentFeedType]);
  
  // Handler für Feed-Abonnements 
  const subscribeFeed = useCallback(async () => {
    if (profile && currentFeedType) {
      // Implementierung einer Feed-Abonnement-Funktion
      toast.success(`Du erhältst jetzt Benachrichtigungen für den ${currentFeedType} Feed`);
      return true;
    }
    return false;
  }, [profile, currentFeedType]);
  
  // Initialisierung der Feature-Flags
  useEffect(() => {
    enableAutoRefresh(true);
    enableNewPostsCheck(true);
  }, [enableAutoRefresh, enableNewPostsCheck]);
  
  return {
    // Zustandsvariablen
    currentFeedType,
    showFilterMenu,
    selectedFilter,
    sortType,
    refreshKey,
    hasNewPosts,
    isRefreshing,
    lastRefresh,
    
    // Handler
    toggleFilters,
    handleFilterSelect,
    handleSortChange,
    changeFeedType,
    refreshFeed,
    setCurrentFeedType,
    enableAutoRefresh,
    enableNewPostsCheck,
    isPersonalizedFeed,
    isSpecializedFeed,
    subscribeFeed
  };
};
