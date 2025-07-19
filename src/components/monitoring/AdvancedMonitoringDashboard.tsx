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
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Memory,
  Network,
  Server,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    swap: {
      total: number;
      used: number;
    };
  };
  disk: {
    total: number;
    used: number;
    available: number;
    io: {
      read: number;
      write: number;
    };
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connections: number;
  };
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
    cacheHitRate: number;
  };
  application: {
    requests: number;
    responseTime: number;
    errors: number;
    activeUsers: number;
    uptime: number;
  };
  blockchain: {
    transactions: number;
    gasPrice: number;
    pendingTransactions: number;
    networkLoad: number;
  };
}

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  category: string;
}

interface PerformanceData {
  timestamp: Date;
  value: number;
  label: string;
}

const AdvancedMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    fetchMetrics();
    fetchAlerts();
    fetchPerformanceData();

    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/monitoring/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/monitoring/performance');
      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
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
          <h1 className="text-3xl font-bold">Advanced Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system monitoring and performance tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshInterval(5000)}
            className={refreshInterval === 5000 ? 'bg-primary text-primary-foreground' : ''}
          >
            5s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshInterval(10000)}
            className={refreshInterval === 10000 ? 'bg-primary text-primary-foreground' : ''}
          >
            10s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshInterval(30000)}
            className={refreshInterval === 30000 ? 'bg-primary text-primary-foreground' : ''}
          >
            30s
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Alerts
          </h2>
          <div className="grid gap-2">
            {alerts
              .filter(alert => !alert.resolved)
              .slice(0, 5)
              .map(alert => (
                <Alert key={alert.id} className="border-l-4 border-l-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    {alert.title}
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Health */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.application.activeUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.application.responseTime || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  API response time
                </p>
              </CardContent>
            </Card>

            {/* Uptime */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatUptime(metrics?.application.uptime || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  System uptime
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{metrics?.cpu.usage || 0}%</span>
                  </div>
                  <Progress value={metrics?.cpu.usage || 0} />
                  <div className="text-xs text-muted-foreground">
                    Temperature: {metrics?.cpu.temperature || 0}°C
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Memory className="h-4 w-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span>{formatBytes(metrics?.memory.used || 0)}</span>
                  </div>
                  <Progress 
                    value={((metrics?.memory.used || 0) / (metrics?.memory.total || 1)) * 100} 
                  />
                  <div className="text-xs text-muted-foreground">
                    Total: {formatBytes(metrics?.memory.total || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span>{formatBytes(metrics?.disk.used || 0)}</span>
                  </div>
                  <Progress 
                    value={((metrics?.disk.used || 0) / (metrics?.disk.total || 1)) * 100} 
                  />
                  <div className="text-xs text-muted-foreground">
                    Available: {formatBytes(metrics?.disk.available || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Request Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics?.application.requests || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Requests per minute
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span>{metrics?.database.cacheHitRate || 0}%</span>
                  </div>
                  <Progress value={metrics?.database.cacheHitRate || 0} />
                  <div className="text-xs text-muted-foreground">
                    Slow Queries: {metrics?.database.slowQueries || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Network Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Incoming</span>
                      <span>{formatBytes(metrics?.network.bytesIn || 0)}/s</span>
                    </div>
                    <Progress value={50} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Outgoing</span>
                      <span>{formatBytes(metrics?.network.bytesOut || 0)}/s</span>
                    </div>
                    <Progress value={30} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active Connections: {metrics?.network.connections || 0}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  System Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Load Average</span>
                    <span>2.5</span>
                  </div>
                  <Progress value={25} />
                  <div className="text-xs text-muted-foreground">
                    CPU Cores: {metrics?.cpu.cores || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Application Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span>{metrics?.application.errors || 0}%</span>
                    </div>
                    <Progress value={metrics?.application.errors || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Database Connections</span>
                      <span>{metrics?.database.connections || 0}</span>
                    </div>
                    <Progress value={((metrics?.database.connections || 0) / 100) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {metrics?.application.responseTime || 0}ms
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average response time
                  </p>
                  <div className="text-xs text-green-500">
                    ↓ 12% from last hour
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Blockchain Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Transactions</span>
                      <span>{metrics?.blockchain.transactions || 0}</span>
                    </div>
                    <Progress value={50} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Gas Price</span>
                      <span>{metrics?.blockchain.gasPrice || 0} Gwei</span>
                    </div>
                    <Progress value={30} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pending: {metrics?.blockchain.pendingTransactions || 0}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Network Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Load</span>
                    <span>{metrics?.blockchain.networkLoad || 0}%</span>
                  </div>
                  <Progress value={metrics?.blockchain.networkLoad || 0} />
                  <div className="text-xs text-muted-foreground">
                    Blockchain network performance
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

export default AdvancedMonitoringDashboard; 