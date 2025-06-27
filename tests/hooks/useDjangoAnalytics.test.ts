import { renderHook, waitFor } from '@testing-library/react';
import { useDjangoAnalytics } from '@/hooks/analytics/useDjangoAnalytics';
import { analyticsAPI } from '@/lib/django-api-new';
import { AuthProvider } from '@/context/AuthContext';

// Mock the analytics API
jest.mock('@/lib/django-api', () => ({
  analyticsAPI: {
    getPlatformMetrics: jest.fn(),
    getUserAnalytics: jest.fn(),
    getPostAnalytics: jest.fn(),
    getMiningAnalytics: jest.fn(),
    getSearchAnalytics: jest.fn(),
    getTimeSeriesData: jest.fn(),
    getChartData: jest.fn(),
    getUserGrowthAnalytics: jest.fn(),
    getEngagementAnalytics: jest.fn(),
    getContentPerformanceAnalytics: jest.fn(),
    getRealTimeAnalytics: jest.fn(),
    getDashboardSummary: jest.fn(),
    exportAnalyticsData: jest.fn(),
  }
}));

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', username: 'testuser' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('useDjangoAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDjangoAnalytics());

    expect(result.current.platformMetrics).toBeNull();
    expect(result.current.userAnalytics).toEqual([]);
    expect(result.current.postAnalytics).toEqual([]);
    expect(result.current.miningAnalytics).toBeNull();
    expect(result.current.searchAnalytics).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch platform metrics successfully', async () => {
    const mockMetrics = {
      total_users: 1000,
      total_posts: 5000,
      total_likes: 25000,
      total_comments: 10000,
      total_shares: 5000,
      total_mining_tokens: 100000,
      active_users_24h: 500,
      active_users_7d: 800,
      active_users_30d: 950,
      new_users_24h: 50,
      new_users_7d: 200,
      new_users_30d: 800,
      engagement_rate: 15.5,
      avg_session_duration: 300,
      bounce_rate: 25.0
    };

    (analyticsAPI.getPlatformMetrics as jest.Mock).mockResolvedValue({
      data: mockMetrics
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getPlatformMetrics();

    await waitFor(() => {
      expect(result.current.platformMetrics).toEqual(mockMetrics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(analyticsAPI.getPlatformMetrics).toHaveBeenCalledWith(undefined);
  });

  it('should fetch user analytics successfully', async () => {
    const mockUserAnalytics = [
      {
        user_id: 'user1',
        username: 'user1',
        display_name: 'User One',
        avatar_url: 'https://example.com/avatar1.jpg',
        total_posts: 100,
        total_likes_received: 1000,
        total_comments_received: 500,
        total_shares_received: 200,
        total_followers: 500,
        total_following: 300,
        engagement_rate: 15.5,
        avg_likes_per_post: 10.0,
        avg_comments_per_post: 5.0,
        mining_tokens_earned: 1000,
        mining_efficiency: 1.2,
        last_active: '2024-01-01T12:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    (analyticsAPI.getUserAnalytics as jest.Mock).mockResolvedValue({
      data: {
        results: mockUserAnalytics,
        count: 1,
        next: null,
        previous: null
      }
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getUserAnalytics();

    await waitFor(() => {
      expect(result.current.userAnalytics).toEqual(mockUserAnalytics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should fetch post analytics successfully', async () => {
    const mockPostAnalytics = [
      {
        post_id: 'post1',
        content: 'Test post content',
        author_id: 'user1',
        author_username: 'user1',
        author_display_name: 'User One',
        likes_count: 100,
        comments_count: 50,
        shares_count: 25,
        views_count: 1000,
        engagement_rate: 17.5,
        reach_count: 2000,
        hashtags: ['test', 'example'],
        media_type: 'image',
        created_at: '2024-01-01T12:00:00Z'
      }
    ];

    (analyticsAPI.getPostAnalytics as jest.Mock).mockResolvedValue({
      data: {
        results: mockPostAnalytics,
        count: 1,
        next: null,
        previous: null
      }
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getPostAnalytics();

    await waitFor(() => {
      expect(result.current.postAnalytics).toEqual(mockPostAnalytics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should fetch mining analytics successfully', async () => {
    const mockMiningAnalytics = {
      total_miners: 500,
      total_tokens_mined: 50000,
      avg_mining_rate: 0.1,
      top_miners: [
        {
          user_id: 'user1',
          username: 'user1',
          display_name: 'User One',
          tokens_mined: 1000,
          efficiency: 1.5,
          streak: 7
        }
      ],
      mining_activity_24h: 100,
      mining_activity_7d: 500,
      mining_activity_30d: 2000,
      total_mining_sessions: 1000,
      avg_session_duration: 30
    };

    (analyticsAPI.getMiningAnalytics as jest.Mock).mockResolvedValue({
      data: mockMiningAnalytics
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getMiningAnalytics();

    await waitFor(() => {
      expect(result.current.miningAnalytics).toEqual(mockMiningAnalytics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should fetch search analytics successfully', async () => {
    const mockSearchAnalytics = {
      total_searches: 10000,
      unique_searchers: 2000,
      popular_queries: [
        {
          query: 'test',
          count: 500,
          type: 'user'
        }
      ],
      search_by_type: {
        user: 4000,
        post: 3000,
        group: 2000,
        hashtag: 1000
      },
      avg_search_results: 15.5,
      search_success_rate: 85.0,
      trending_searches: [
        {
          query: 'trending',
          growth_rate: 25.5,
          type: 'hashtag'
        }
      ]
    };

    (analyticsAPI.getSearchAnalytics as jest.Mock).mockResolvedValue({
      data: mockSearchAnalytics
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getSearchAnalytics();

    await waitFor(() => {
      expect(result.current.searchAnalytics).toEqual(mockSearchAnalytics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'API Error';
    (analyticsAPI.getPlatformMetrics as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getPlatformMetrics();

    await waitFor(() => {
      expect(result.current.error).toBe('Fehler beim Laden der Plattform-Metriken');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should fetch time series data successfully', async () => {
    const mockTimeSeriesData = [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 150 },
      { date: '2024-01-03', value: 200 }
    ];

    (analyticsAPI.getTimeSeriesData as jest.Mock).mockResolvedValue({
      data: mockTimeSeriesData
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getTimeSeriesData('user_growth', 'day');

    await waitFor(() => {
      expect(result.current.timeSeriesData.user_growth).toEqual(mockTimeSeriesData);
    });

    expect(analyticsAPI.getTimeSeriesData).toHaveBeenCalledWith('user_growth', 'day', undefined);
  });

  it('should fetch dashboard summary successfully', async () => {
    const mockDashboardSummary = {
      platform_metrics: {
        total_users: 1000,
        total_posts: 5000,
        total_likes: 25000,
        total_comments: 10000,
        total_shares: 5000,
        total_mining_tokens: 100000,
        active_users_24h: 500,
        active_users_7d: 800,
        active_users_30d: 950,
        new_users_24h: 50,
        new_users_7d: 200,
        new_users_30d: 800,
        engagement_rate: 15.5,
        avg_session_duration: 300,
        bounce_rate: 25.0
      },
      top_users: [],
      top_posts: [],
      mining_summary: {
        total_miners: 500,
        total_tokens_mined: 50000,
        avg_mining_rate: 0.1,
        top_miners: [],
        mining_activity_24h: 100,
        mining_activity_7d: 500,
        mining_activity_30d: 2000,
        total_mining_sessions: 1000,
        avg_session_duration: 30
      },
      search_summary: {
        total_searches: 10000,
        unique_searchers: 2000,
        popular_queries: [],
        search_by_type: {},
        avg_search_results: 15.5,
        search_success_rate: 85.0,
        trending_searches: []
      },
      recent_activity: []
    };

    (analyticsAPI.getDashboardSummary as jest.Mock).mockResolvedValue({
      data: mockDashboardSummary
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    await result.current.getDashboardSummary();

    await waitFor(() => {
      expect(result.current.platformMetrics).toEqual(mockDashboardSummary.platform_metrics);
      expect(result.current.userAnalytics).toEqual(mockDashboardSummary.top_users);
      expect(result.current.postAnalytics).toEqual(mockDashboardSummary.top_posts);
      expect(result.current.miningAnalytics).toEqual(mockDashboardSummary.mining_summary);
      expect(result.current.searchAnalytics).toEqual(mockDashboardSummary.search_summary);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should export analytics data successfully', async () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' });
    (analyticsAPI.exportAnalyticsData as jest.Mock).mockResolvedValue({
      data: mockBlob
    });

    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockClick = jest.fn();
    const mockSetAttribute = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    Object.defineProperty(document, 'createElement', {
      value: jest.fn(() => ({
        href: '',
        setAttribute: mockSetAttribute,
        click: mockClick
      }))
    });
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild
    });

    const { result } = renderHook(() => useDjangoAnalytics());

    const success = await result.current.exportAnalyticsData('users', 'csv');

    expect(success).toBe(true);
    expect(analyticsAPI.exportAnalyticsData).toHaveBeenCalledWith('users', 'csv', undefined);
  });

  it('should handle export errors gracefully', async () => {
    (analyticsAPI.exportAnalyticsData as jest.Mock).mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useDjangoAnalytics());

    const success = await result.current.exportAnalyticsData('users', 'csv');

    expect(success).toBe(false);
  });

  it('should refresh all analytics successfully', async () => {
    const { result } = renderHook(() => useDjangoAnalytics());

    // Mock all API calls
    (analyticsAPI.getPlatformMetrics as jest.Mock).mockResolvedValue({ data: {} });
    (analyticsAPI.getUserAnalytics as jest.Mock).mockResolvedValue({ data: { results: [] } });
    (analyticsAPI.getPostAnalytics as jest.Mock).mockResolvedValue({ data: { results: [] } });
    (analyticsAPI.getMiningAnalytics as jest.Mock).mockResolvedValue({ data: {} });
    (analyticsAPI.getSearchAnalytics as jest.Mock).mockResolvedValue({ data: {} });
    (analyticsAPI.getUserGrowthAnalytics as jest.Mock).mockResolvedValue({ data: [] });
    (analyticsAPI.getEngagementAnalytics as jest.Mock).mockResolvedValue({ data: {} });

    await result.current.refreshAllAnalytics();

    expect(analyticsAPI.getPlatformMetrics).toHaveBeenCalled();
    expect(analyticsAPI.getUserAnalytics).toHaveBeenCalled();
    expect(analyticsAPI.getPostAnalytics).toHaveBeenCalled();
    expect(analyticsAPI.getMiningAnalytics).toHaveBeenCalled();
    expect(analyticsAPI.getSearchAnalytics).toHaveBeenCalled();
    expect(analyticsAPI.getUserGrowthAnalytics).toHaveBeenCalled();
    expect(analyticsAPI.getEngagementAnalytics).toHaveBeenCalled();
  });
}); 
