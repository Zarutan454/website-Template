
import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';

/**
 * Hook zum Verwalten des Feed-Zustands, einschließlich Beiträgen, Filtern und Benutzerkontext
 */
export const useFeedState = (feedType: string = 'recent') => {
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === 'dark';
  const { 
    posts, 
    adaptedPosts, 
    isLoading, 
    error, 
    fetchPosts 
  } = usePosts();
  
  // Filter-Zustände
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");
  const [filteredPosts, setFilteredPosts] = useState<Array<{
    id: string;
    created_at: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
  }>>([]);
  
  // Initiales Laden der Daten
  useEffect(() => {
    if (profile && !isLoading && !error) {
      fetchPosts(feedType);
    }
  }, [profile, feedType, fetchPosts, isLoading, error]);
  
  // Anwenden von Filtern auf Beiträge
  useEffect(() => {
    setFilteredPosts(posts || []);
  }, [posts]);
  
  const toggleFilters = () => {
    setShowFilterMenu(!showFilterMenu);
  };
  
  const handleFilterSelect = (filter: string | null) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);
  };
  
  const handleRetry = () => {
    console.log('Versuche erneut, Beiträge zu laden...');
    fetchPosts(feedType);
  };
  
  const handleLoginRedirect = () => {
    navigate('/login');
  };
  
  return {
    profile,
    isAuthenticated,
    profileLoading,
    isDarkMode,
    posts,
    adaptedPosts,
    isLoading,
    error,
    fetchPosts,
    showFilterMenu,
    selectedFilter,
    filteredPosts,
    toggleFilters,
    handleFilterSelect,
    handleRetry,
    handleLoginRedirect
  };
};
