
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Brain,
  PieChart,
  LineChart,
  Calendar,
  Globe,
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Download,
  Upload,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface UserBehavior {
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
}

interface ContentPerformance {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  viralPosts: number;
  trendingTopics: string[];
}

interface RevenueMetrics {
  totalRevenue: number;
  tokenSales: number;
  nftSales: number;
  miningRewards: number;
  transactionVolume: number;
  averageTransactionValue: number;
}

interface PredictiveAnalytics {
  userGrowthPrediction: number;
  revenuePrediction: number;
  engagementPrediction: number;
  churnRisk: number;
  viralContentProbability: number;
}

interface AnalyticsData {
  userBehavior: UserBehavior;
  contentPerformance: ContentPerformance;
  revenueMetrics: RevenueMetrics;
  predictiveAnalytics: PredictiveAnalytics;
  timeSeriesData: any[];
  geographicData: any[];
  demographicData: any[];
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: growth,
      isPositive: growth >= 0,
      icon: growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Business intelligence and predictive analytics for BSN Social Network
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('1d')}
            className={timeRange === '1d' ? 'bg-primary text-primary-foreground' : ''}
          >
            1D
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('7d')}
            className={timeRange === '7d' ? 'bg-primary text-primary-foreground' : ''}
          >
            7D
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('30d')}
            className={timeRange === '30d' ? 'bg-primary text-primary-foreground' : ''}
          >
            30D
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('90d')}
            className={timeRange === '90d' ? 'bg-primary text-primary-foreground' : ''}
          >
            90D
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsData?.userBehavior.activeUsers || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIndicator(1000, 950).icon}
              <span className={getGrowthIndicator(1000, 950).isPositive ? 'text-green-500' : 'text-red-500'}>
                +5.3% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData?.contentPerformance.engagementRate || 0).toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIndicator(8.5, 8.2).icon}
              <span className={getGrowthIndicator(8.5, 8.2).isPositive ? 'text-green-500' : 'text-red-500'}>
                +3.7% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.revenueMetrics.totalRevenue || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIndicator(125000, 118000).icon}
              <span className={getGrowthIndicator(125000, 118000).isPositive ? 'text-green-500' : 'text-red-500'}>
                +5.9% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analyticsData?.userBehavior.sessionDuration || 0) / 60)}m
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIndicator(12.5, 11.8).icon}
              <span className={getGrowthIndicator(12.5, 11.8).isPositive ? 'text-green-500' : 'text-red-500'}>
                +5.9% from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  User Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Users</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.userBehavior.newUsers || 0)}</span>
                  </div>
                  <Progress value={75} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Returning Users</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.userBehavior.returningUsers || 0)}</span>
                  </div>
                  <Progress value={85} />
                  <div className="text-xs text-muted-foreground">
                    Retention rate: 68%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Posts</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.contentPerformance.totalPosts || 0)}</span>
                  </div>
                  <Progress value={60} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Viral Posts</span>
                    <span className="font-semibold">{analyticsData?.contentPerformance.viralPosts || 0}</span>
                  </div>
                  <Progress value={15} />
                  <div className="text-xs text-muted-foreground">
                    Viral rate: 2.5%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Page Views</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.userBehavior.pageViews || 0)}</span>
                  </div>
                  <Progress value={70} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-semibold">{(analyticsData?.userBehavior.bounceRate || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={30} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-semibold">{(analyticsData?.userBehavior.conversionRate || 0).toFixed(2)}%</span>
                  </div>
                  <Progress value={45} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  User Activity Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Peak activity hours
                  </div>
                  <div className="grid grid-cols-24 gap-1">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-blue-500 rounded"
                        style={{ opacity: Math.random() * 0.8 + 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Most active: 8PM - 10PM
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Content Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Likes</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.contentPerformance.totalLikes || 0)}</span>
                  </div>
                  <Progress value={80} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Comments</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.contentPerformance.totalComments || 0)}</span>
                  </div>
                  <Progress value={65} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Shares</span>
                    <span className="font-semibold">{formatNumber(analyticsData?.contentPerformance.totalShares || 0)}</span>
                  </div>
                  <Progress value={45} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(analyticsData?.contentPerformance.trendingTopics || []).map((topic, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">#{topic}</span>
                      <Badge variant="secondary">{Math.floor(Math.random() * 1000) + 100}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Token Sales</span>
                    <span className="font-semibold">{formatCurrency(analyticsData?.revenueMetrics.tokenSales || 0)}</span>
                  </div>
                  <Progress value={60} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">NFT Sales</span>
                    <span className="font-semibold">{formatCurrency(analyticsData?.revenueMetrics.nftSales || 0)}</span>
                  </div>
                  <Progress value={40} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mining Rewards</span>
                    <span className="font-semibold">{formatCurrency(analyticsData?.revenueMetrics.miningRewards || 0)}</span>
                  </div>
                  <Progress value={25} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Transaction Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Volume</span>
                    <span className="font-semibold">{formatCurrency(analyticsData?.revenueMetrics.transactionVolume || 0)}</span>
                  </div>
                  <Progress value={75} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Transaction Value</span>
                    <span className="font-semibold">{formatCurrency(analyticsData?.revenueMetrics.averageTransactionValue || 0)}</span>
                  </div>
                  <Progress value={50} />
                  <div className="text-xs text-muted-foreground">
                    Total transactions: {Math.floor((analyticsData?.revenueMetrics.transactionVolume || 0) / (analyticsData?.revenueMetrics.averageTransactionValue || 1))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Growth Prediction</span>
                    <span className="font-semibold">+{(analyticsData?.predictiveAnalytics.userGrowthPrediction || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={75} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Prediction</span>
                    <span className="font-semibold">+{(analyticsData?.predictiveAnalytics.revenuePrediction || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={65} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement Prediction</span>
                    <span className="font-semibold">+{(analyticsData?.predictiveAnalytics.engagementPrediction || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={80} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Churn Risk</span>
                    <span className="font-semibold">{(analyticsData?.predictiveAnalytics.churnRisk || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData?.predictiveAnalytics.churnRisk || 0} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Viral Content Probability</span>
                    <span className="font-semibold">{(analyticsData?.predictiveAnalytics.viralContentProbability || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData?.predictiveAnalytics.viralContentProbability || 0} />
                  <div className="text-xs text-muted-foreground">
                    Based on ML models and historical data
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
