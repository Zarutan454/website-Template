import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { searchAPI, type SearchResult, type SearchFilters, type SearchSuggestion } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface UseDjangoSearchProps {
  enableSuggestions?: boolean;
  enableHistory?: boolean;
  debounceMs?: number;
  pageSize?: number;
}

export interface SearchState {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  history: Array<{
    query: string;
    timestamp: string;
    result_count: number;
  }>;
  trending: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalResults: number;
}

/**
 * Django-basierter Search Hook - Migriert von Supabase Search
 * 
 * ALT (Supabase):
 * const { data } = await supabase.from('user_search').select('*').ilike('username', `%${query}%`);
 * 
 * NEU (Django):
 * const { search, results, suggestions } = useDjangoSearch();
 */
export const useDjangoSearch = ({
  enableSuggestions = true,
  enableHistory = true,
  debounceMs = 300,
  pageSize = 20
}: UseDjangoSearchProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<SearchState>({
    results: [],
    suggestions: [],
    history: [],
    trending: [],
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    totalResults: 0
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>('');

  // Global search
  const search = useCallback(async (query: string, filters?: SearchFilters, page: number = 1, append: boolean = false) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], isLoading: false, error: null }));
      return;
    }

    if (page === 1) {
      lastQueryRef.current = query;
    }

    try {
      setState(prev => ({
        ...prev,
        isLoading: !append,
        error: null
      }));

      const response = await searchAPI.search(query, filters, page, pageSize);
      const newResults = response.data.results;
      const hasNext = !!response.data.next;

      setState(prev => ({
        ...prev,
        results: append ? [...prev.results, ...newResults] : newResults,
        isLoading: false,
        hasMore: hasNext,
        currentPage: page,
        totalResults: response.data.count,
        error: null
      }));

      // Save to history if it's a new search
      if (page === 1 && enableHistory && isAuthenticated) {
        await searchAPI.saveSearchQuery(query);
      }

    } catch (error: unknown) {
      console.error('Error searching:', error);
      
      let errorMessage = 'Fehler bei der Suche';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string } } };
        errorMessage = apiError.response?.data?.detail || errorMessage;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [pageSize, enableHistory, isAuthenticated]);

  // Search users
  const searchUsers = useCallback(async (query: string, filters?: {
    is_verified?: boolean;
    min_followers?: number;
    max_followers?: number;
  }, page: number = 1) => {
    if (!query.trim()) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await searchAPI.searchUsers(query, filters, page, pageSize);
      const users = response.data.results;

      setState(prev => ({
        ...prev,
        results: users.map(user => ({
          id: user.id,
          type: 'user' as const,
          title: user.display_name || user.username,
          description: user.bio || `@${user.username}`,
          image_url: user.avatar_url,
          metadata: {
            username: user.username,
            followers_count: user.followers_count,
            following_count: user.following_count,
            posts_count: user.posts_count,
            is_verified: user.is_verified,
            is_following: user.is_following
          },
          score: 1.0,
          created_at: user.created_at
        })),
        isLoading: false,
        hasMore: !!response.data.next,
        currentPage: page,
        totalResults: response.data.count
      }));

    } catch (error: unknown) {
      console.error('Error searching users:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler bei der Benutzersuche'
      }));
    }
  }, [pageSize]);

  // Search posts
  const searchPosts = useCallback(async (query: string, filters?: {
    user_id?: string;
    has_media?: boolean;
    min_likes?: number;
    date_range?: {
      start: string;
      end: string;
    };
  }, page: number = 1) => {
    if (!query.trim()) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await searchAPI.searchPosts(query, filters, page, pageSize);
      const posts = response.data.results;

      setState(prev => ({
        ...prev,
        results: posts.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          description: `Von ${post.author_display_name} • ${post.likes_count} Likes`,
          image_url: post.media_urls?.[0],
          metadata: {
            author_id: post.author_id,
            author_username: post.author_username,
            author_display_name: post.author_display_name,
            author_avatar_url: post.author_avatar_url,
            likes_count: post.likes_count,
            comments_count: post.comments_count,
            shares_count: post.shares_count,
            hashtags: post.hashtags,
            is_liked: post.is_liked
          },
          score: 1.0,
          created_at: post.created_at
        })),
        isLoading: false,
        hasMore: !!response.data.next,
        currentPage: page,
        totalResults: response.data.count
      }));

    } catch (error: unknown) {
      console.error('Error searching posts:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler bei der Postsuche'
      }));
    }
  }, [pageSize]);

  // Search groups
  const searchGroups = useCallback(async (query: string, filters?: {
    is_private?: boolean;
    min_members?: number;
    created_by?: string;
  }, page: number = 1) => {
    if (!query.trim()) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await searchAPI.searchGroups(query, filters, page, pageSize);
      const groups = response.data.results;

      setState(prev => ({
        ...prev,
        results: groups.map(group => ({
          id: group.id,
          type: 'group' as const,
          title: group.name,
          description: group.description || `${group.member_count} Mitglieder`,
          image_url: group.avatar_url,
          metadata: {
            member_count: group.member_count,
            posts_count: group.posts_count,
            is_private: group.is_private,
            created_by: group.created_by,
            is_member: group.is_member
          },
          score: 1.0,
          created_at: group.created_at
        })),
        isLoading: false,
        hasMore: !!response.data.next,
        currentPage: page,
        totalResults: response.data.count
      }));

    } catch (error: unknown) {
      console.error('Error searching groups:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler bei der Gruppensuche'
      }));
    }
  }, [pageSize]);

  // Search hashtags
  const searchHashtags = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await searchAPI.searchHashtags(query, page, pageSize);
      const hashtags = response.data.results;

      setState(prev => ({
        ...prev,
        results: hashtags.map(hashtag => ({
          id: hashtag.name,
          type: 'hashtag' as const,
          title: `#${hashtag.name}`,
          description: `${hashtag.posts_count} Posts`,
          metadata: {
            posts_count: hashtag.posts_count,
            trending_score: hashtag.trending_score
          },
          score: hashtag.trending_score,
          created_at: hashtag.created_at
        })),
        isLoading: false,
        hasMore: !!response.data.next,
        currentPage: page,
        totalResults: response.data.count
      }));

    } catch (error: unknown) {
      console.error('Error searching hashtags:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler bei der Hashtag-Suche'
      }));
    }
  }, [pageSize]);

  // Get suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || !enableSuggestions) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      const response = await searchAPI.getSuggestions(query, 10);
      setState(prev => ({ ...prev, suggestions: response.data }));
    } catch (error: unknown) {
      console.error('Error getting suggestions:', error);
    }
  }, [enableSuggestions]);

  // Get trending searches
  const getTrendingSearches = useCallback(async () => {
    try {
      const response = await searchAPI.getTrendingSearches(10);
      setState(prev => ({ ...prev, trending: response.data }));
    } catch (error: unknown) {
      console.error('Error getting trending searches:', error);
    }
  }, []);

  // Get search history
  const getSearchHistory = useCallback(async () => {
    if (!enableHistory || !isAuthenticated) return;

    try {
      const response = await searchAPI.getSearchHistory(20);
      setState(prev => ({ ...prev, history: response.data }));
    } catch (error: unknown) {
      console.error('Error getting search history:', error);
    }
  }, [enableHistory, isAuthenticated]);

  // Clear search history
  const clearSearchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    try {
      await searchAPI.clearSearchHistory();
      setState(prev => ({ ...prev, history: [] }));
      toast.success('Suchverlauf gelöscht');
      return true;
    } catch (error: unknown) {
      console.error('Error clearing search history:', error);
      toast.error('Fehler beim Löschen des Suchverlaufs');
      return false;
    }
  }, [isAuthenticated]);

  // Advanced search
  const advancedSearch = useCallback(async (params: {
    query: string;
    filters: SearchFilters;
    sort_by?: 'relevance' | 'date' | 'popularity';
    sort_order?: 'asc' | 'desc';
    page?: number;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await searchAPI.advancedSearch({
        ...params,
        limit: pageSize
      });

      setState(prev => ({
        ...prev,
        results: response.data.results,
        isLoading: false,
        hasMore: !!response.data.next,
        currentPage: params.page || 1,
        totalResults: response.data.count
      }));

    } catch (error: unknown) {
      console.error('Error in advanced search:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler bei der erweiterten Suche'
      }));
    }
  }, [pageSize]);

  // Load more results
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading && lastQueryRef.current) {
      search(lastQueryRef.current, undefined, state.currentPage + 1, true);
    }
  }, [state.hasMore, state.isLoading, state.currentPage, search]);

  // Debounced search
  const debouncedSearch = useCallback((query: string, filters?: SearchFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      search(query, filters);
    }, debounceMs);
  }, [search, debounceMs]);

  // Load initial data
  useEffect(() => {
    getTrendingSearches();
    if (enableHistory) {
      getSearchHistory();
    }
  }, [getTrendingSearches, getSearchHistory, enableHistory]);

  return {
    // State
    results: state.results,
    suggestions: state.suggestions,
    history: state.history,
    trending: state.trending,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    totalResults: state.totalResults,

    // Actions
    search,
    searchUsers,
    searchPosts,
    searchGroups,
    searchHashtags,
    getSuggestions,
    getTrendingSearches,
    getSearchHistory,
    clearSearchHistory,
    advancedSearch,
    loadMore,
    debouncedSearch
  };
}; 
