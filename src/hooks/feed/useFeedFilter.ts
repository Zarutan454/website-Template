
import { useState, useEffect, useCallback } from 'react';

/**
 * Definiert die möglichen Filtertypen für den Feed.
 * Diese sollten mit den FeedType-Definitionen aus useFeedData.ts abgestimmt sein.
 */
export type FilterType = 'all' | 'latest' | 'popular' | 'following' | 'tokens' | 'nfts';

/**
 * Definiert die möglichen Sortiertypen für den Feed.
 */
export type SortType = 'newest' | 'popular' | 'trending';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
    followers?: string[];
  };
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_followed_by_user?: boolean;
  token_data?: Record<string, unknown>;
  nft_data?: Record<string, unknown>;
  media_url?: string;
}

interface UseFeedFilterOptions {
  posts: Post[];
  currentUserId: string;
  initialFilter?: FilterType;
  initialSort?: SortType;
}

interface FilteredPostsResult {
  filterType: FilterType;
  sortType: SortType;
  filteredPosts: any[];
  setFilterType: (type: FilterType) => void;
  setSortType: (type: SortType) => void;
  showFilterMenu: boolean;
  selectedFilter: string | null;
  toggleFilters: () => void;
  handleFilterSelect: (filter: string | null) => void;
}

// Hilfsfunktion für Filterbezeichnungen, um sicherzustellen, dass sie vor dem ersten Aufruf definiert ist
const getFilterLabelHelper = (filter: FilterType): string => {
  switch (filter) {
    case 'all': return 'Alle';
    case 'latest': return 'Neueste';
    case 'popular': return 'Beliebt';
    case 'following': return 'Meine Follows';
    case 'tokens': return 'Tokens';
    case 'nfts': return 'NFTs';
    default: return 'Alle';
  }
};

/**
 * Hook für die Filterung und Sortierung von Feed-Beiträgen
 * mit optimierter Leistung und besserer Typsicherheit
 */
export const useFeedFilter = ({
  posts,
  currentUserId,
  initialFilter = 'all',
  initialSort = 'newest'
}: UseFeedFilterOptions): FilteredPostsResult => {
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);
  const [sortType, setSortType] = useState<SortType>(initialSort);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(getFilterLabelHelper(initialFilter));

  // Memoized-Funktion für Filterbezeichnungen, um unnötige Re-Renders zu vermeiden
  const getFilterLabel = useCallback((filter: FilterType): string => {
    return getFilterLabelHelper(filter);
  }, []);

  // Performanceoptimierte Filterung mit useEffect
  useEffect(() => {
    if (!posts || posts.length === 0) {
      setFilteredPosts([]);
      return;
    }

    // Wir vermeiden unnötige Array-Kopien, wenn keine Filterung erforderlich ist
    let filtered: any[];
    
    // Filter anwenden - Null-Checks für Typsicherheit
    if (filterType === 'all') {
      filtered = posts; // Keine Filterung notwendig
    } else if (filterType === 'latest') {
      filtered = [...posts]; // Kopie für Sortierung
    } else if (filterType === 'popular') {
      filtered = posts.filter(post => (post.likes_count || 0) > 0);
    } else if (filterType === 'following' && currentUserId) {
      filtered = posts.filter(post => 
        (post.author?.followers?.includes(currentUserId) || post.is_followed_by_user) === true
      );
    } else if (filterType === 'tokens') {
      filtered = posts.filter(post => 
        post.token_data || (post.content && post.content.includes('#token'))
      );
    } else if (filterType === 'nfts') {
      filtered = posts.filter(post => 
        post.nft_data || (post.content && post.content.includes('#nft'))
      );
    } else {
      filtered = [...posts]; // Fallback
    }

    // Sortierung anwenden mit Null-Checks
    if (sortType === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortType === 'popular') {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (sortType === 'trending') {
      filtered.sort((a, b) => {
        const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2 + (a.shares_count || 0) * 3;
        const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2 + (b.shares_count || 0) * 3;
        return scoreB - scoreA;
      });
    }

    setFilteredPosts(filtered);
  }, [posts, filterType, sortType, currentUserId]);

  // UI-Steuerungsfunktionen
  const toggleFilters = useCallback(() => {
    setShowFilterMenu(prev => !prev);
  }, []);
  
  const handleFilterSelect = useCallback((filter: string | null) => {
    setSelectedFilter(filter);
    
    // Filtertyp basierend auf ausgewähltem Label setzen
    if (filter === 'Alle') setFilterType('all');
    else if (filter === 'Neueste') setFilterType('latest');
    else if (filter === 'Beliebt') setFilterType('popular');
    else if (filter === 'Meine Follows') setFilterType('following');
    else if (filter === 'Tokens') setFilterType('tokens');
    else if (filter === 'NFTs') setFilterType('nfts');
    
    setShowFilterMenu(false);
  }, []);

  return {
    filterType,
    setFilterType,
    sortType,
    setSortType,
    filteredPosts,
    showFilterMenu,
    selectedFilter,
    toggleFilters,
    handleFilterSelect
  };
};

/**
 * Deprecated: Bitte useFilterControl aus './useFilterControl.ts' verwenden.
 * Diese Implementierung bleibt für die Abwärtskompatibilität bestehen.
 */
export const useFilterControl = () => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");

  const toggleFilters = useCallback(() => {
    setShowFilterMenu(prev => !prev);
  }, []);
  
  const handleFilterSelect = useCallback((filter: string | null) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);
  }, []);

  return {
    showFilterMenu,
    selectedFilter,
    toggleFilters,
    handleFilterSelect
  };
};
