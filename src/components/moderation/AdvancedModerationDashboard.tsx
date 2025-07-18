import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  FileText, 
  MessageSquare,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Ban,
  UserCheck,
  Settings,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface ModerationItem {
  id: string;
  type: 'post' | 'comment' | 'user';
  content: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reported_at: string;
  report_count: number;
  auto_detected: boolean;
}

interface ModerationStats {
  total_reports: number;
  pending_reviews: number;
  resolved_today: number;
  auto_detected: number;
  false_positives: number;
  average_response_time: number;
}

const AdvancedModerationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'reviewed' | 'settings' | 'analytics'>('queue');
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'comments' | 'users'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    total_reports: 0,
    pending_reviews: 0,
    resolved_today: 0,
    auto_detected: 0,
    false_positives: 0,
    average_response_time: 0
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Load moderation queue
    const loadModerationQueue = async () => {
      // TODO: Replace with actual API call
      const mockItems: ModerationItem[] = [
        {
          id: '1',
          type: 'post',
          content: 'This is a test post that needs moderation...',
          author: { id: '1', username: 'testuser' },
          reason: 'spam',
          severity: 'medium',
          status: 'pending',
          reported_at: new Date().toISOString(),
          report_count: 3,
          auto_detected: true
        }
      ];
      setModerationItems(mockItems);
    };

    // Load moderation stats
    const loadStats = async () => {
      // TODO: Replace with actual API call
      setStats({
        total_reports: 150,
        pending_reviews: 25,
        resolved_today: 45,
        auto_detected: 80,
        false_positives: 5,
        average_response_time: 2.5
      });
    };

    loadModerationQueue();
    loadStats();
  }, []);

  const handleApprove = async (itemId: string) => {
    try {
      // TODO: API call to approve item
      setModerationItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'resolved' as const }
            : item
        )
      );
      toast.success('Item approved');
    } catch (error) {
      toast.error('Error approving item');
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      // TODO: API call to reject item
      setModerationItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'resolved' as const }
            : item
        )
      );
      toast.success('Item rejected');
    } catch (error) {
      toast.error('Error rejecting item');
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      // TODO: API call to ban user
      toast.success('User banned');
    } catch (error) {
      toast.error('Error banning user');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = moderationItems.filter(item => {
    if (filterType !== 'all' && item.type !== filterType.slice(0, -1) as 'post' | 'comment' | 'user') return false;
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
    if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Manage reported content and maintain community standards
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_reports}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_reviews}</div>
            <p className="text-xs text-muted-foreground">
              Average response: {stats.average_response_time}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Detected</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.auto_detected}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.auto_detected / stats.total_reports) * 100).toFixed(1)}% accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved_today}</div>
            <p className="text-xs text-muted-foreground">
              +5% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                                 <div className="flex items-center space-x-2">
                   <Filter className="h-4 w-4" />
                   <select 
                     value={filterType} 
                     onChange={(e) => setFilterType(e.target.value as 'all' | 'posts' | 'comments' | 'users')}
                     className="border rounded px-2 py-1"
                     aria-label="Filter by content type"
                   >
                     <option value="all">All Types</option>
                     <option value="posts">Posts</option>
                     <option value="comments">Comments</option>
                     <option value="users">Users</option>
                   </select>
                 </div>

                 <div className="flex items-center space-x-2">
                   <AlertTriangle className="h-4 w-4" />
                   <select 
                     value={filterSeverity} 
                     onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'critical')}
                     className="border rounded px-2 py-1"
                     aria-label="Filter by severity level"
                   >
                     <option value="all">All Severities</option>
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="high">High</option>
                     <option value="critical">Critical</option>
                   </select>
                 </div>

                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.type === 'post' && <FileText className="h-4 w-4" />}
                      {item.type === 'comment' && <MessageSquare className="h-4 w-4" />}
                      {item.type === 'user' && <Users className="h-4 w-4" />}
                      <span className="font-medium">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} by {item.author.username}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(item.severity)}>
                        {item.severity}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      {item.auto_detected && (
                        <Badge variant="secondary">Auto</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Content:</p>
                      <p className="text-sm">{item.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Reason: {item.reason}</span>
                      <span>Reports: {item.report_count}</span>
                      <span>Reported: {new Date(item.reported_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(item.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBanUser(item.author.id)}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No items to moderate</p>
                    <p className="text-muted-foreground">All reported content has been reviewed</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Reviewed Items</p>
                <p className="text-muted-foreground">View history of moderated content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Moderation Analytics</p>
                <p className="text-muted-foreground">Detailed insights and metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Moderation Settings</p>
                <p className="text-muted-foreground">Configure auto-moderation rules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedModerationDashboard; 