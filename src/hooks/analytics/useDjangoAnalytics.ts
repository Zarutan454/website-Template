import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  analyticsAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface UseDjangoAnalyticsProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
}

export interface AnalyticsState {
  platformMetrics: AnalyticsMetrics | null;
  userAnalytics: UserAnalytics[];
  postAnalytics: PostAnalytics[];
  miningAnalytics: MiningAnalytics | null;
  searchAnalytics: SearchAnalytics | null;
  timeSeriesData: Record<string, TimeSeriesData[]>;
  chartData: Record<string, ChartData>;
  realTimeData: {
    active_users_now: number;
    active_users_1h: number;
    posts_last_hour: number;
    likes_last_hour: number;
    comments_last_hour: number;
    mining_sessions_active: number;
    top_trending_hashtags: Array<{
      hashtag: string;
      posts_count: number;
      growth_rate: number;
    }>;
  } | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Django-basierter Analytics Hook - Ersetzt Supabase Analytics
 * 
 * ALT (Supabase):
 * const { data } = await supabase.from('analytics').select('*').eq('metric', 'users');
 * 
 * NEU (Django):
 * const { getPlatformMetrics, platformMetrics } = useDjangoAnalytics();
 */
export const useDjangoAnalytics = ({
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  enableRealTime = false
}: UseDjangoAnalyticsProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<AnalyticsState>({
    platformMetrics: null,
    userAnalytics: [],
    postAnalytics: [],
    miningAnalytics: null,
    searchAnalytics: null,
    timeSeriesData: {},
    chartData: {},
    realTimeData: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  // Get platform metrics
  const getPlatformMetrics = useCallback(async (dateRange?: {
    start: string;
    end: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getPlatformMetrics(dateRange);
      setState(prev => ({
        ...prev,
        platformMetrics: response.data,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching platform metrics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Plattform-Metriken'
      }));
    }
  }, []);

  // Get user analytics
  const getUserAnalytics = useCallback(async (filters?: {
    user_id?: string;
    min_followers?: number;
    min_posts?: number;
    is_verified?: boolean;
  }, page?: number, limit?: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getUserAnalytics(filters, page, limit);
      setState(prev => ({
        ...prev,
        userAnalytics: response.data.results,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching user analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Benutzer-Analytik'
      }));
    }
  }, []);

  // Get post analytics
  const getPostAnalytics = useCallback(async (filters?: {
    author_id?: string;
    min_likes?: number;
    min_comments?: number;
    has_media?: boolean;
    date_range?: {
      start: string;
      end: string;
    };
  }, page?: number, limit?: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getPostAnalytics(filters, page, limit);
      setState(prev => ({
        ...prev,
        postAnalytics: response.data.results,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching post analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Post-Analytik'
      }));
    }
  }, []);

  // Get mining analytics
  const getMiningAnalytics = useCallback(async (dateRange?: {
    start: string;
    end: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getMiningAnalytics(dateRange);
      setState(prev => ({
        ...prev,
        miningAnalytics: response.data,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching mining analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Mining-Analytik'
      }));
    }
  }, []);

  // Get search analytics
  const getSearchAnalytics = useCallback(async (dateRange?: {
    start: string;
    end: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getSearchAnalytics(dateRange);
      setState(prev => ({
        ...prev,
        searchAnalytics: response.data,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching search analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Such-Analytik'
      }));
    }
  }, []);

  // Get time series data
  const getTimeSeriesData = useCallback(async (
    metric: string, 
    period: 'hour' | 'day' | 'week' | 'month' = 'day',
    dateRange?: {
      start: string;
      end: string;
    }
  ) => {
    try {
      const response = await analyticsAPI.getTimeSeriesData(metric, period, dateRange);
      setState(prev => ({
        ...prev,
        timeSeriesData: {
          ...prev.timeSeriesData,
          [metric]: response.data
        }
      }));

    } catch (error: unknown) {
      console.error(`Error fetching time series data for ${metric}:`, error);
    }
  }, []);

  // Get chart data
  const getChartData = useCallback(async (chartType: string, filters?: Record<string, unknown>) => {
    try {
      const response = await analyticsAPI.getChartData(chartType, filters);
      setState(prev => ({
        ...prev,
        chartData: {
          ...prev.chartData,
          [chartType]: response.data
        }
      }));

    } catch (error: unknown) {
      console.error(`Error fetching chart data for ${chartType}:`, error);
    }
  }, []);

  // Get user growth analytics
  const getUserGrowthAnalytics = useCallback(async (period: 'day' | 'week' | 'month' = 'day', days: number = 30) => {
    try {
      const response = await analyticsAPI.getUserGrowthAnalytics(period, days);
      setState(prev => ({
        ...prev,
        timeSeriesData: {
          ...prev.timeSeriesData,
          user_growth: response.data
        }
      }));

    } catch (error: unknown) {
      console.error('Error fetching user growth analytics:', error);
    }
  }, []);

  // Get engagement analytics
  const getEngagementAnalytics = useCallback(async (period: 'day' | 'week' | 'month' = 'day', days: number = 30) => {
    try {
      const response = await analyticsAPI.getEngagementAnalytics(period, days);
      setState(prev => ({
        ...prev,
        timeSeriesData: {
          ...prev.timeSeriesData,
          likes: response.data.likes,
          comments: response.data.comments,
          shares: response.data.shares,
          posts: response.data.posts
        }
      }));

    } catch (error: unknown) {
      console.error('Error fetching engagement analytics:', error);
    }
  }, []);

  // Get content performance analytics
  const getContentPerformanceAnalytics = useCallback(async (filters?: {
    content_type?: 'posts' | 'stories' | 'reels';
    min_engagement?: number;
    date_range?: {
      start: string;
      end: string;
    };
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getContentPerformanceAnalytics(filters);
      setState(prev => ({
        ...prev,
        postAnalytics: response.data.top_posts,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching content performance analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Content-Performance-Analytik'
      }));
    }
  }, []);

  // Get real-time analytics
  const getRealTimeAnalytics = useCallback(async () => {
    if (!enableRealTime) return;

    try {
      const response = await analyticsAPI.getRealTimeAnalytics();
      setState(prev => ({
        ...prev,
        realTimeData: response.data
      }));

    } catch (error: unknown) {
      console.error('Error fetching real-time analytics:', error);
    }
  }, [enableRealTime]);

  // Get dashboard summary
  const getDashboardSummary = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await analyticsAPI.getDashboardSummary();
      setState(prev => ({
        ...prev,
        platformMetrics: response.data.platform_metrics,
        userAnalytics: response.data.top_users,
        postAnalytics: response.data.top_posts,
        miningAnalytics: response.data.mining_summary,
        searchAnalytics: response.data.search_summary,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error: unknown) {
      console.error('Error fetching dashboard summary:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden des Dashboard-Summary'
      }));
    }
  }, []);

  // Export analytics data
  const exportAnalyticsData = useCallback(async (
    exportType: 'users' | 'posts' | 'mining' | 'search',
    format: 'csv' | 'json' | 'xlsx',
    filters?: Record<string, unknown>
  ) => {
    try {
      const response = await analyticsAPI.exportAnalyticsData(exportType, format, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}_analytics.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Analytics-Daten als ${format.toUpperCase()} exportiert`);
      return true;

    } catch (error: unknown) {
      console.error('Error exporting analytics data:', error);
      toast.error('Fehler beim Exportieren der Analytics-Daten');
      return false;
    }
  }, []);

  // Refresh all analytics
  const refreshAllAnalytics = useCallback(async () => {
    await Promise.all([
      getPlatformMetrics(),
      getUserAnalytics(),
      getPostAnalytics(),
      getMiningAnalytics(),
      getSearchAnalytics(),
      getUserGrowthAnalytics(),
      getEngagementAnalytics()
    ]);
  }, [getPlatformMetrics, getUserAnalytics, getPostAnalytics, getMiningAnalytics, getSearchAnalytics, getUserGrowthAnalytics, getEngagementAnalytics]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAllAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAllAnalytics]);

  // Real-time analytics effect
  useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(() => {
      getRealTimeAnalytics();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [enableRealTime, getRealTimeAnalytics]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      getDashboardSummary();
    }
  }, [isAuthenticated, getDashboardSummary]);

  return {
    // State
    platformMetrics: state.platformMetrics,
    userAnalytics: state.userAnalytics,
    postAnalytics: state.postAnalytics,
    miningAnalytics: state.miningAnalytics,
    searchAnalytics: state.searchAnalytics,
    timeSeriesData: state.timeSeriesData,
    chartData: state.chartData,
    realTimeData: state.realTimeData,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    getPlatformMetrics,
    getUserAnalytics,
    getPostAnalytics,
    getMiningAnalytics,
    getSearchAnalytics,
    getTimeSeriesData,
    getChartData,
    getUserGrowthAnalytics,
    getEngagementAnalytics,
    getContentPerformanceAnalytics,
    getRealTimeAnalytics,
    getDashboardSummary,
    exportAnalyticsData,
    refreshAllAnalytics
  };
}; 
