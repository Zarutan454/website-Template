import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Globe, 
  Smartphone, 
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Cpu,
  Memory,
  HardDrive,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceMetrics {
  // Frontend Metrics
  pageLoadTime: number;
  bundleSize: number;
  lighthouseScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  
  // Backend Metrics
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  
  // Network Metrics
  networkLatency: number;
  bandwidthUsage: number;
  errorRate: number;
  
  // User Metrics
  activeUsers: number;
  concurrentUsers: number;
  sessionDuration: number;
  
  // Business Metrics
  transactionsPerSecond: number;
  miningEfficiency: number;
  userEngagement: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

const PerformanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'frontend' | 'backend' | 'network' | 'alerts'>('overview');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    bundleSize: 0,
    lighthouseScore: 0,
    coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
    apiResponseTime: 0,
    databaseQueryTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    bandwidthUsage: 0,
    errorRate: 0,
    activeUsers: 0,
    concurrentUsers: 0,
    sessionDuration: 0,
    transactionsPerSecond: 0,
    miningEfficiency: 0,
    userEngagement: 0
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        pageLoadTime: Math.random() * 3 + 0.5,
        bundleSize: Math.random() * 2 + 1,
        lighthouseScore: Math.random() * 20 + 80,
        coreWebVitals: {
          lcp: Math.random() * 2 + 1,
          fid: Math.random() * 100 + 50,
          cls: Math.random() * 0.1
        },
        apiResponseTime: Math.random() * 200 + 50,
        databaseQueryTime: Math.random() * 100 + 20,
        cacheHitRate: Math.random() * 30 + 70,
        memoryUsage: Math.random() * 40 + 60,
        cpuUsage: Math.random() * 30 + 40,
        networkLatency: Math.random() * 50 + 20,
        bandwidthUsage: Math.random() * 100 + 50,
        errorRate: Math.random() * 5,
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        concurrentUsers: Math.floor(Math.random() * 100) + 50,
        sessionDuration: Math.random() * 30 + 10,
        transactionsPerSecond: Math.random() * 10 + 5,
        miningEfficiency: Math.random() * 20 + 80,
        userEngagement: Math.random() * 30 + 70
      });
      
      setIsLoading(false);
    };

    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getPerformanceStatus = (value: number, threshold: number, type: 'lower' | 'higher' = 'lower') => {
    if (type === 'lower') {
      return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'warning' : 'error';
    } else {
      return value >= threshold ? 'good' : value >= threshold * 0.7 ? 'warning' : 'error';
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  const formatMetric = (value: number, unit: string) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ${unit}`;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  const handleRefresh = () => {
    toast.info('Refreshing performance metrics...');
    // Trigger manual refresh
  };

  const handleExportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Performance metrics exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system performance and user experience
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportMetrics}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageLoadTime.toFixed(2)}s</div>
            <Badge className={getStatusColor(getPerformanceStatus(metrics.pageLoadTime, 2))}>
              {getPerformanceStatus(metrics.pageLoadTime, 2) === 'good' ? 'Good' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiResponseTime.toFixed(0)}ms</div>
            <Badge className={getStatusColor(getPerformanceStatus(metrics.apiResponseTime, 200))}>
              {getPerformanceStatus(metrics.apiResponseTime, 200) === 'good' ? 'Fast' : 'Slow'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetric(metrics.activeUsers, 'users')}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
            <Badge className={getStatusColor(getPerformanceStatus(metrics.errorRate, 1, 'lower'))}>
              {getPerformanceStatus(metrics.errorRate, 1, 'lower') === 'good' ? 'Low' : 'High'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Largest Contentful Paint</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metrics.coreWebVitals.lcp.toFixed(2)}s</span>
                    <Badge className={getStatusColor(getPerformanceStatus(metrics.coreWebVitals.lcp, 2.5))}>
                      {getPerformanceStatus(metrics.coreWebVitals.lcp, 2.5) === 'good' ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>First Input Delay</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metrics.coreWebVitals.fid.toFixed(0)}ms</span>
                    <Badge className={getStatusColor(getPerformanceStatus(metrics.coreWebVitals.fid, 100))}>
                      {getPerformanceStatus(metrics.coreWebVitals.fid, 100) === 'good' ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cumulative Layout Shift</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metrics.coreWebVitals.cls.toFixed(3)}</span>
                    <Badge className={getStatusColor(getPerformanceStatus(metrics.coreWebVitals.cls, 0.1))}>
                      {getPerformanceStatus(metrics.coreWebVitals.cls, 0.1) === 'good' ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>CPU Usage</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metrics.cpuUsage.toFixed(1)}%</span>
                    <Badge className={getStatusColor(getPerformanceStatus(metrics.cpuUsage, 80, 'lower'))}>
                      {getPerformanceStatus(metrics.cpuUsage, 80, 'lower') === 'good' ? 'Normal' : 'High'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Memory Usage</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metrics.memoryUsage.toFixed(1)}%</span>
                    <Badge className={getStatusColor(getPerformanceStatus(metrics.memoryUsage, 85, 'lower'))}>
                      {getPerformanceStatus(metrics.memoryUsage, 85, 'lower') === 'good' ? 'Normal' : 'High'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Hit Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
                    <Badge className={getStatusColor(getPerformanceStatus(metrics.cacheHitRate, 80, 'higher'))}>
                      {getPerformanceStatus(metrics.cacheHitRate, 80, 'higher') === 'good' ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Frontend Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Bundle Size</span>
                  <span className="font-medium">{metrics.bundleSize.toFixed(1)}MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lighthouse Score</span>
                  <span className="font-medium">{metrics.lighthouseScore.toFixed(0)}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Page Load Time</span>
                  <span className="font-medium">{metrics.pageLoadTime.toFixed(2)}s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Users</span>
                  <span className="font-medium">{formatMetric(metrics.activeUsers, 'users')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Duration</span>
                  <span className="font-medium">{metrics.sessionDuration.toFixed(1)}min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Engagement</span>
                  <span className="font-medium">{metrics.userEngagement.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backend" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Backend Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>API Response Time</span>
                  <span className="font-medium">{metrics.apiResponseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Query Time</span>
                  <span className="font-medium">{metrics.databaseQueryTime.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Hit Rate</span>
                  <span className="font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transactions/sec</span>
                  <span className="font-medium">{metrics.transactionsPerSecond.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mining Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Mining Efficiency</span>
                  <span className="font-medium">{metrics.miningEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Concurrent Users</span>
                  <span className="font-medium">{metrics.concurrentUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>System Load</span>
                  <span className="font-medium">{metrics.cpuUsage.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Network Latency</span>
                  <span className="font-medium">{metrics.networkLatency.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bandwidth Usage</span>
                  <span className="font-medium">{formatMetric(metrics.bandwidthUsage, 'MB/s')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Error Rate</span>
                  <span className="font-medium">{metrics.errorRate.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>All services operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>CDN functioning normally</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SSL certificates valid</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No active alerts</p>
                  <p className="text-muted-foreground">All systems are performing well</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        <span>{alert.message}</span>
                      </div>
                      <Badge className={getStatusColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard; 