import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DjangoAnalyticsExample from '@/components/analytics/DjangoAnalyticsExample';
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

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('DjangoAnalyticsExample Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render analytics dashboard with loading state', () => {
    renderWithProviders(<DjangoAnalyticsExample />);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Auto-Refresh')).toBeInTheDocument();
    expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
  });

  it('should display platform metrics when data is loaded', async () => {
    const mockPlatformMetrics = {
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
      data: mockPlatformMetrics
    });

    renderWithProviders(<DjangoAnalyticsExample />);

    await waitFor(() => {
      expect(screen.getByText('1.000')).toBeInTheDocument(); // total_users
      expect(screen.getByText('5.000')).toBeInTheDocument(); // total_posts
      expect(screen.getByText('25.000')).toBeInTheDocument(); // total_likes
      expect(screen.getByText('100.000')).toBeInTheDocument(); // total_mining_tokens
    });
  });

  it('should display user analytics in users tab', async () => {
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

    renderWithProviders(<DjangoAnalyticsExample />);

    // Click on users tab
    const usersTab = screen.getByText('Benutzer');
    fireEvent.click(usersTab);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('@user1')).toBeInTheDocument();
      expect(screen.getByText('500 Follower')).toBeInTheDocument();
      expect(screen.getByText('100 Posts')).toBeInTheDocument();
    });
  });

  it('should display post analytics in posts tab', async () => {
    const mockPostAnalytics = [
      {
        post_id: 'post1',
        content: 'Test post content that is longer than 100 characters to test truncation functionality',
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

    renderWithProviders(<DjangoAnalyticsExample />);

    // Click on posts tab
    const postsTab = screen.getByText('Posts');
    fireEvent.click(postsTab);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('@user1')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // likes
      expect(screen.getByText('50')).toBeInTheDocument(); // comments
      expect(screen.getByText('25')).toBeInTheDocument(); // shares
      expect(screen.getByText('1.000')).toBeInTheDocument(); // views
    });
  });

  it('should display mining analytics in mining tab', async () => {
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

    renderWithProviders(<DjangoAnalyticsExample />);

    // Click on mining tab
    const miningTab = screen.getByText('Mining');
    fireEvent.click(miningTab);

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument(); // total_miners
      expect(screen.getByText('50.000')).toBeInTheDocument(); // total_tokens_mined
      expect(screen.getByText('0.10')).toBeInTheDocument(); // avg_mining_rate
      expect(screen.getByText('User One')).toBeInTheDocument(); // top miner
    });
  });

  it('should display search analytics in search tab', async () => {
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

    renderWithProviders(<DjangoAnalyticsExample />);

    // Click on search tab
    const searchTab = screen.getByText('Suche');
    fireEvent.click(searchTab);

    await waitFor(() => {
      expect(screen.getByText('10.000')).toBeInTheDocument(); // total_searches
      expect(screen.getByText('2.000')).toBeInTheDocument(); // unique_searchers
      expect(screen.getByText('85,0%')).toBeInTheDocument(); // search_success_rate
    });
  });

  it('should handle time range changes', async () => {
    const mockTimeSeriesData = [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 150 },
      { date: '2024-01-03', value: 200 }
    ];

    (analyticsAPI.getUserGrowthAnalytics as jest.Mock).mockResolvedValue({
      data: mockTimeSeriesData
    });

    renderWithProviders(<DjangoAnalyticsExample />);

    // Change time range to 30 days
    const timeRangeSelect = screen.getByRole('combobox');
    fireEvent.change(timeRangeSelect, { target: { value: '30d' } });

    await waitFor(() => {
      expect(analyticsAPI.getUserGrowthAnalytics).toHaveBeenCalledWith('day', 30);
    });
  });

  it('should handle refresh button click', async () => {
    const mockPlatformMetrics = {
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
      data: mockPlatformMetrics
    });

    renderWithProviders(<DjangoAnalyticsExample />);

    // Click refresh button
    const refreshButton = screen.getByText('Aktualisieren');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(analyticsAPI.getPlatformMetrics).toHaveBeenCalled();
    });
  });

  it('should handle auto-refresh toggle', async () => {
    renderWithProviders(<DjangoAnalyticsExample />);

    // Toggle auto-refresh
    const autoRefreshButton = screen.getByText('Auto-Refresh');
    fireEvent.click(autoRefreshButton);

    expect(autoRefreshButton).toHaveClass('bg-primary');
  });

  it('should display real-time data when available', async () => {
    const mockRealTimeData = {
      active_users_now: 150,
      active_users_1h: 500,
      posts_last_hour: 25,
      likes_last_hour: 100,
      comments_last_hour: 50,
      mining_sessions_active: 75,
      top_trending_hashtags: [
        {
          hashtag: 'trending',
          posts_count: 100,
          growth_rate: 25.5
        }
      ]
    };

    (analyticsAPI.getRealTimeAnalytics as jest.Mock).mockResolvedValue({
      data: mockRealTimeData
    });

    renderWithProviders(<DjangoAnalyticsExample />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // active_users_now
      expect(screen.getByText('25')).toBeInTheDocument(); // posts_last_hour
      expect(screen.getByText('100')).toBeInTheDocument(); // likes_last_hour
      expect(screen.getByText('75')).toBeInTheDocument(); // mining_sessions_active
    });
  });

  it('should handle export functionality', async () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' });
    (analyticsAPI.exportAnalyticsData as jest.Mock).mockResolvedValue({
      data: mockBlob
    });

    // Mock URL.createObjectURL and document methods
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
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
      value: jest.fn()
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: jest.fn()
    });

    renderWithProviders(<DjangoAnalyticsExample />);

    // Click on users tab and export button
    const usersTab = screen.getByText('Benutzer');
    fireEvent.click(usersTab);

    await waitFor(() => {
      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      expect(analyticsAPI.exportAnalyticsData).toHaveBeenCalledWith('users', 'csv');
    });
  });

  it('should display error state when API fails', async () => {
    (analyticsAPI.getPlatformMetrics as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithProviders(<DjangoAnalyticsExample />);

    await waitFor(() => {
      expect(screen.getByText(/Fehler:/)).toBeInTheDocument();
      expect(screen.getByText('Erneut versuchen')).toBeInTheDocument();
    });
  });

  it('should display loading state', async () => {
    // Mock a slow API response
    (analyticsAPI.getPlatformMetrics as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<DjangoAnalyticsExample />);

    expect(screen.getByText('Lade Analytics-Daten...')).toBeInTheDocument();
  });
}); 
