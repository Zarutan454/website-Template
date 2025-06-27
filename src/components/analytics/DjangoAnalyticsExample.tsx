import React, { useState, useEffect } from 'react';
import { useDjangoAnalytics } from '@/hooks/analytics/useDjangoAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Users, 
  FileText, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  Download,
  RefreshCw,
  Activity,
  Target,
  Clock,
  Search,
  Hash,
  Star,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Beispiel-Komponente für die Verwendung des Django Analytics Systems
 * 
 * ALT (Supabase):
 * const { data } = await supabase.from('analytics').select('*').eq('metric', 'users');
 * 
 * NEU (Django):
 * const { getPlatformMetrics, platformMetrics } = useDjangoAnalytics();
 */
const DjangoAnalyticsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    platformMetrics,
    userAnalytics,
    postAnalytics,
    miningAnalytics,
    searchAnalytics,
    timeSeriesData,
    realTimeData,
    isLoading,
    error,
    lastUpdated,
    getPlatformMetrics,
    getUserAnalytics,
    getPostAnalytics,
    getMiningAnalytics,
    getSearchAnalytics,
    getUserGrowthAnalytics,
    getEngagementAnalytics,
    getRealTimeAnalytics,
    getDashboardSummary,
    exportAnalyticsData,
    refreshAllAnalytics
  } = useDjangoAnalytics({
    autoRefresh,
    refreshInterval: 30000,
    enableRealTime: true
  });

  // Load data based on time range
  useEffect(() => {
    const endDate = new Date().toISOString();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    const dateRange = {
      start: startDate.toISOString(),
      end: endDate
    };

    getPlatformMetrics(dateRange);
    getUserAnalytics(undefined, 1, 10);
    getPostAnalytics(undefined, 1, 10);
    getMiningAnalytics(dateRange);
    getSearchAnalytics(dateRange);
    getUserGrowthAnalytics('day', timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30);
    getEngagementAnalytics('day', timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30);
  }, [timeRange, getPlatformMetrics, getUserAnalytics, getPostAnalytics, getMiningAnalytics, getSearchAnalytics, getUserGrowthAnalytics, getEngagementAnalytics]);

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString('de-DE');
  };

  // Format percentage helper
  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle export
  const handleExport = async (type: 'users' | 'posts' | 'mining' | 'search', format: 'csv' | 'json' | 'xlsx') => {
    await exportAnalyticsData(type, format);
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshAllAnalytics();
    toast.success('Analytics-Daten aktualisiert');
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">Fehler: {error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            Auto-Refresh
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">Letzte 24h</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
          </select>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-sm text-gray-500">
          Zuletzt aktualisiert: {formatDate(lastUpdated)}
        </div>
      )}

      {/* Real-time Metrics */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Echtzeit-Metriken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {formatNumber(realTimeData.active_users_now)}
                </div>
                <div className="text-sm text-gray-500">Aktive Benutzer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {formatNumber(realTimeData.posts_last_hour)}
                </div>
                <div className="text-sm text-gray-500">Posts (1h)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {formatNumber(realTimeData.likes_last_hour)}
                </div>
                <div className="text-sm text-gray-500">Likes (1h)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {formatNumber(realTimeData.mining_sessions_active)}
                </div>
                <div className="text-sm text-gray-500">Aktive Mining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Metrics */}
      {platformMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Plattform-Metriken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.total_users)}</div>
                <div className="text-sm text-gray-500">Gesamt Benutzer</div>
                <div className="text-xs text-green-500">
                  +{formatNumber(platformMetrics.new_users_24h)} heute
                </div>
              </div>
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.total_posts)}</div>
                <div className="text-sm text-gray-500">Gesamt Posts</div>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.total_likes)}</div>
                <div className="text-sm text-gray-500">Gesamt Likes</div>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.total_mining_tokens)}</div>
                <div className="text-sm text-gray-500">Mining Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="mining">Mining</TabsTrigger>
          <TabsTrigger value="search">Suche</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Growth Chart */}
          {timeSeriesData.user_growth && (
            <Card>
              <CardHeader>
                <CardTitle>Benutzer-Wachstum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData.user_growth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Engagement Chart */}
          {timeSeriesData.likes && timeSeriesData.comments && (
            <Card>
              <CardHeader>
                <CardTitle>Engagement-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" data={timeSeriesData.likes} stroke="#ef4444" name="Likes" />
                      <Line type="monotone" dataKey="value" data={timeSeriesData.comments} stroke="#10b981" name="Comments" />
                      <Line type="monotone" dataKey="value" data={timeSeriesData.shares} stroke="#8b5cf6" name="Shares" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Top Benutzer</h3>
            <Button onClick={() => handleExport('users', 'csv')} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="grid gap-4">
            {userAnalytics.map((user) => (
              <Card key={user.user_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {user.avatar_url && (
                        <img 
                          src={user.avatar_url} 
                          alt={user.display_name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{user.display_name}</h4>
                          <span className="text-sm text-gray-500">@{user.username}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatNumber(user.total_followers)} Follower</span>
                          <span>{formatNumber(user.total_posts)} Posts</span>
                          <span>{formatPercentage(user.engagement_rate)} Engagement</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatNumber(user.total_likes_received)}</div>
                      <div className="text-sm text-gray-500">Likes erhalten</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Top Posts</h3>
            <Button onClick={() => handleExport('posts', 'csv')} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="grid gap-4">
            {postAnalytics.map((post) => (
              <Card key={post.post_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{post.author_display_name}</span>
                        <span className="text-sm text-gray-500">@{post.author_username}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {post.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{formatNumber(post.likes_count)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{formatNumber(post.comments_count)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>{formatNumber(post.shares_count)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(post.views_count)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPercentage(post.engagement_rate)}</div>
                      <div className="text-sm text-gray-500">Engagement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mining Tab */}
        <TabsContent value="mining" className="space-y-6">
          {miningAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold">{formatNumber(miningAnalytics.total_miners)}</div>
                      <div className="text-sm text-gray-500">Aktive Miner</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{formatNumber(miningAnalytics.total_tokens_mined)}</div>
                      <div className="text-sm text-gray-500">Tokens gemined</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{miningAnalytics.avg_mining_rate.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Ø Mining Rate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Miner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {miningAnalytics.top_miners.map((miner, index) => (
                      <div key={miner.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{miner.display_name}</div>
                            <div className="text-sm text-gray-500">@{miner.username}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatNumber(miner.tokens_mined)} BSN</div>
                          <div className="text-sm text-gray-500">
                            Effizienz: {miner.efficiency.toFixed(1)}x
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {searchAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Search className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{formatNumber(searchAnalytics.total_searches)}</div>
                      <div className="text-sm text-gray-500">Gesamt Suchen</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{formatNumber(searchAnalytics.unique_searchers)}</div>
                      <div className="text-sm text-gray-500">Eindeutige Sucher</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold">{formatPercentage(searchAnalytics.search_success_rate)}</div>
                      <div className="text-sm text-gray-500">Erfolgsrate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Beliebte Suchbegriffe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {searchAnalytics.popular_queries.map((query, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{query.type}</Badge>
                            <span className="font-medium">{query.query}</span>
                          </div>
                          <span className="text-sm text-gray-500">{query.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trendende Suchen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {searchAnalytics.trending_searches.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{trend.query}</span>
                            <Badge variant="outline">{trend.type}</Badge>
                          </div>
                          <span className="text-sm text-green-500">+{trend.growth_rate.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Lade Analytics-Daten...</span>
        </div>
      )}
    </div>
  );
};

export default DjangoAnalyticsExample; 
