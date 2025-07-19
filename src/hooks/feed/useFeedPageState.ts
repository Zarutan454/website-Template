
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext.utils';
import { useTheme } from '@/components/ThemeProvider.utils';
import { usePosts } from '@/hooks/usePosts';
import { FeedType } from './useFeedData';

/**
 * Hook zum Verwalten des Feed-Seiten-Zustands mit erweiterten Funktionen
 */
export const useFeedPageState = (initialFeedType: FeedType = 'recent') => {
  const { user, isAuthenticated, isLoading: profileLoading } = useAuth();
  const { posts, adaptedPosts, isLoading, error, fetchPosts } = usePosts();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Feed-Tabs und Filterung
  const [activeTab, setActiveTab] = useState<FeedType>(initialFeedType);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");
  
  // Post-Erstellung
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingPostData, setPendingPostData] = useState<Record<string, unknown> | null>(null);
  
  // Laden der Daten beim ersten Rendern
  useEffect(() => {
    if (user && !isLoading) {
      fetchPosts(activeTab);
    }
  }, [user, activeTab, fetchPosts, isLoading]);
  
  const handleTabChange = (tab: FeedType) => {
    setActiveTab(tab);
    if (user) {
      fetchPosts(tab);
    }
  };
  
  const handleOpenCreateModal = (initialData?: any) => {
    setPendingPostData(initialData || null);
    setShowCreateModal(true);
  };
  
  const handlePostCreated = async () => {
    setShowCreateModal(false);
    setPendingPostData(null);
    if (user) {
      await fetchPosts(activeTab);
    }
  };
  
  const handleRetry = () => {
    if (user) {
      fetchPosts(activeTab);
    }
  };
  
  const handleLoginRedirect = () => {
    // Navigation zur Login-Seite (wird in Feed.tsx implementiert)
  };
  
  return {
    // Profil und Authentifizierung
    user,
    isAuthenticated,
    profileLoading,
    isDarkMode,
    
    // Posts und Lade-Status
    posts,
    adaptedPosts,
    isLoading,
    error,
    fetchPosts,
    
    // Feed-Filterung und Tabs
    showFilterMenu,
    selectedFilter,
    activeTab,
    
    // Erstellen von Posts
    showCreateModal,
    setShowCreateModal,
    pendingPostData,
    
    // Event-Handler
    handleTabChange,
    handleOpenCreateModal,
    handlePostCreated,
    handleRetry,
    handleLoginRedirect
  };
};
