import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  Database,
  Globe,
  Zap,
  RefreshCw,
  Download,
  Settings,
  Activity,
  BarChart3,
  AlertCircle,
  ShieldCheck,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityMetrics {
  // Authentication Metrics
  failedLoginAttempts: number;
  successfulLogins: number;
  activeSessions: number;
  suspiciousActivities: number;
  
  // Network Security
  blockedRequests: number;
  suspiciousIPs: number;
  ddosAttempts: number;
  sslCertificateStatus: 'valid' | 'expiring' | 'expired';
  
  // Data Security
  dataBreaches: number;
  encryptionStatus: 'enabled' | 'disabled';
  backupStatus: 'success' | 'failed' | 'pending';
  dataRetentionCompliance: boolean;
  
  // Application Security
  vulnerabilities: number;
  criticalVulnerabilities: number;
  securityPatches: number;
  codeScanResults: 'clean' | 'warnings' | 'critical';
  
  // User Security
  compromisedAccounts: number;
  passwordResets: number;
  twoFactorEnabled: number;
  accountLockouts: number;
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  category: 'authentication' | 'network' | 'data' | 'application' | 'user';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'authentication' | 'network' | 'data' | 'alerts'>('overview');
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    successfulLogins: 0,
    activeSessions: 0,
    suspiciousActivities: 0,
    blockedRequests: 0,
    suspiciousIPs: 0,
    ddosAttempts: 0,
    sslCertificateStatus: 'valid',
    dataBreaches: 0,
    encryptionStatus: 'enabled',
    backupStatus: 'success',
    dataRetentionCompliance: true,
    vulnerabilities: 0,
    criticalVulnerabilities: 0,
    securityPatches: 0,
    codeScanResults: 'clean',
    compromisedAccounts: 0,
    passwordResets: 0,
    twoFactorEnabled: 0,
    accountLockouts: 0
  });
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const loadSecurityMetrics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        failedLoginAttempts: Math.floor(Math.random() * 50),
        successfulLogins: Math.floor(Math.random() * 1000) + 500,
        activeSessions: Math.floor(Math.random() * 200) + 100,
        suspiciousActivities: Math.floor(Math.random() * 10),
        blockedRequests: Math.floor(Math.random() * 100),
        suspiciousIPs: Math.floor(Math.random() * 5),
        ddosAttempts: Math.floor(Math.random() * 3),
        sslCertificateStatus: 'valid' as const,
        dataBreaches: 0,
        encryptionStatus: 'enabled' as const,
        backupStatus: 'success' as const,
        dataRetentionCompliance: true,
        vulnerabilities: Math.floor(Math.random() * 5),
        criticalVulnerabilities: Math.floor(Math.random() * 2),
        securityPatches: Math.floor(Math.random() * 10) + 5,
        codeScanResults: 'clean' as const,
        compromisedAccounts: Math.floor(Math.random() * 3),
        passwordResets: Math.floor(Math.random() * 20),
        twoFactorEnabled: Math.floor(Math.random() * 100) + 50,
        accountLockouts: Math.floor(Math.random() * 5)
      });
      
      setIsLoading(false);
    };

    loadSecurityMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadSecurityMetrics, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSecurityStatus = (value: number, threshold: number, type: 'lower' | 'higher' = 'lower') => {
    if (type === 'lower') {
      return value <= threshold ? 'good' : value <= threshold * 2 ? 'warning' : 'critical';
    } else {
      return value >= threshold ? 'good' : value >= threshold * 0.5 ? 'warning' : 'critical';
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getAlertColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleRefresh = () => {
    toast.info('Refreshing security metrics...');
    // Trigger manual refresh
  };

  const handleExportReport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Security report exported');
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast.success('Alert marked as resolved');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive security monitoring and threat detection
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
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95/100</div>
            <Badge className="bg-green-100 text-green-800">
              Excellent
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivities}</div>
            <Badge className={getStatusColor(getSecurityStatus(metrics.suspiciousActivities, 5))}>
              {getSecurityStatus(metrics.suspiciousActivities, 5) === 'good' ? 'Low' : 'High'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vulnerabilities}</div>
            <Badge className={getStatusColor(getSecurityStatus(metrics.vulnerabilities, 3))}>
              {getSecurityStatus(metrics.vulnerabilities, 3) === 'good' ? 'Low' : 'High'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL Status</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.sslCertificateStatus}</div>
            <Badge className="bg-green-100 text-green-800">
              Secure
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Security Metrics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="data">Data Security</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Encryption</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Enabled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Status</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Success</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Code Scan</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Clean</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threat Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Blocked Requests</span>
                  <span className="font-medium">{metrics.blockedRequests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspicious IPs</span>
                  <span className="font-medium">{metrics.suspiciousIPs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DDoS Attempts</span>
                  <span className="font-medium">{metrics.ddosAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Breaches</span>
                  <span className="font-medium">{metrics.dataBreaches}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Successful Logins</span>
                  <span className="font-medium">{metrics.successfulLogins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed Attempts</span>
                  <span className="font-medium">{metrics.failedLoginAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Sessions</span>
                  <span className="font-medium">{metrics.activeSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Account Lockouts</span>
                  <span className="font-medium">{metrics.accountLockouts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2FA Enabled</span>
                  <span className="font-medium">{metrics.twoFactorEnabled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Password Resets</span>
                  <span className="font-medium">{metrics.passwordResets}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Rate limiting enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Brute force protection active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Session timeout configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Password complexity enforced</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>SSL Certificate</span>
                  <Badge className="bg-green-100 text-green-800">
                    Valid
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Firewall Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>DDoS Protection</span>
                  <Badge className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>WAF Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Threats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Blocked Requests</span>
                  <span className="font-medium">{metrics.blockedRequests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspicious IPs</span>
                  <span className="font-medium">{metrics.suspiciousIPs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DDoS Attempts</span>
                  <span className="font-medium">{metrics.ddosAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Port Scans</span>
                  <span className="font-medium">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Encryption Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Success
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Retention</span>
                  <Badge className="bg-green-100 text-green-800">
                    Compliant
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Breaches</span>
                  <span className="font-medium">{metrics.dataBreaches}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>GDPR Compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Data Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access Controls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Audit Logging</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No security alerts</p>
                  <p className="text-muted-foreground">All security systems are functioning normally</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center justify-between p-3 border rounded ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-center space-x-2">
                        {alert.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {alert.severity === 'high' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        {alert.severity === 'medium' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {alert.severity === 'low' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAlertColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {!alert.resolved && (
                          <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        )}
                      </div>
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

export default SecurityDashboard; 