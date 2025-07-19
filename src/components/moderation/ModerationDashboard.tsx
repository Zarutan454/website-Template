import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Flag, 
  Eye, 
  EyeOff, 
  UserX, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  Activity,
  Shield,
  Settings,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext.utils';

interface Report {
  id: number;
  content_type: 'post' | 'comment' | 'user' | 'story';
  content_id: number;
  report_type: string;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  reporter: {
    id: number;
    username: string;
  };
  assigned_moderator?: {
    id: number;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

interface ModerationStats {
  pending_reports: number;
  under_review_reports: number;
  reports_today: number;
  resolved_today: number;
  reported_posts: number;
  reported_comments: number;
  suspended_users: number;
}

interface ModerationAction {
  type: 'hide' | 'delete' | 'warn' | 'suspend' | 'dismiss';
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'secondary';
}

const ModerationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'reviewed' | 'analytics' | 'settings'>('queue');
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    pending_reports: 0,
    under_review_reports: 0,
    reports_today: 0,
    resolved_today: 0,
    reported_posts: 0,
    reported_comments: 0,
    suspended_users: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionNotes, setActionNotes] = useState('');

  const moderationActions: ModerationAction[] = [
    {
      type: 'hide',
      label: 'Verstecken',
      description: 'Content für andere Nutzer ausblenden',
      icon: <EyeOff className="h-4 w-4" />,
      variant: 'secondary'
    },
    {
      type: 'delete',
      label: 'Löschen',
      description: 'Content permanent entfernen',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'destructive'
    },
    {
      type: 'warn',
      label: 'Warnen',
      description: 'Benutzer verwarnen',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'secondary'
    },
    {
      type: 'suspend',
      label: 'Suspendieren',
      description: 'Benutzer temporär sperren',
      icon: <UserX className="h-4 w-4" />,
      variant: 'destructive'
    },
    {
      type: 'dismiss',
      label: 'Ablehnen',
      description: 'Report als unbegründet ablehnen',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'default'
    }
  ];

  // Load moderation dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/moderation/dashboard/', {
        headers: {
          'Authorization': `Bearer ${await user.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const data = await response.json();
      setStats(data.statistics);
      setReports(data.recent_reports || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignReport = async (reportId: number) => {
    try {
      const response = await fetch(`/api/moderation/assign-report/${reportId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to assign report');
      }

      toast.success('Report zugewiesen');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error assigning report:', error);
      toast.error('Fehler beim Zuweisen des Reports');
    }
  };

  const handleResolveReport = async (reportId: number, action: string, notes: string) => {
    try {
      const response = await fetch(`/api/moderation/resolve-report/${reportId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getAccessToken()}`,
        },
        body: JSON.stringify({
          action,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve report');
      }

      toast.success('Report erfolgreich bearbeitet');
      setActionDialogOpen(false);
      setSelectedReport(null);
      setSelectedAction('');
      setActionNotes('');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Fehler beim Bearbeiten des Reports');
    }
  };

  const handleHideContent = async (contentType: string, contentId: number, reason: string) => {
    try {
      const response = await fetch('/api/moderation/hide-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getAccessToken()}`,
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to hide content');
      }

      toast.success('Content erfolgreich versteckt');
      loadDashboardData();
    } catch (error) {
      console.error('Error hiding content:', error);
      toast.error('Fehler beim Verstecken des Contents');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Ausstehend', variant: 'secondary' as const },
      under_review: { label: 'In Bearbeitung', variant: 'default' as const },
      resolved: { label: 'Erledigt', variant: 'default' as const },
      dismissed: { label: 'Abgelehnt', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'story': return <Activity className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-muted-foreground">
            Verwaltung von Content-Reports und Moderationsaktionen
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehende Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_reports}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.reports_today} heute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.under_review_reports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resolved_today} heute erledigt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemeldete Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reported_posts}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.reported_comments} Kommentare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendierte User</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended_users}</div>
            <p className="text-xs text-muted-foreground">
              Aktuell gesperrt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">Report-Queue</TabsTrigger>
          <TabsTrigger value="reviewed">Bearbeitet</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ausstehende Reports</CardTitle>
              <CardDescription>
                Reports, die auf Bearbeitung warten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine ausstehenden Reports
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Grund</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="flex items-center gap-2">
                          {getContentTypeIcon(report.content_type)}
                          <span className="capitalize">{report.content_type}</span>
                          <Badge variant="outline">#{report.content_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={report.reason}>
                            {report.reason}
                          </div>
                        </TableCell>
                        <TableCell>{report.reporter.username}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleAssignReport(report.id)}
                              >
                                Zuweisen
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReport(report);
                                setActionDialogOpen(true);
                              }}
                            >
                              Bearbeiten
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bearbeitete Reports</CardTitle>
              <CardDescription>
                Reports, die bereits bearbeitet wurden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Bearbeitete Reports werden hier angezeigt
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Analytics</CardTitle>
              <CardDescription>
                Statistiken und Trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics-Dashboard wird hier angezeigt
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation-Einstellungen</CardTitle>
              <CardDescription>
                Konfiguration der Auto-Moderation und Regeln
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Einstellungen werden hier angezeigt
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogTitle>Report bearbeiten</DialogTitle>
          
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label>Aktion auswählen</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aktion auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {moderationActions.map((action) => (
                      <SelectItem key={action.type} value={action.type}>
                        <div className="flex items-center gap-2">
                          {action.icon}
                          <span>{action.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notizen (optional)</Label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Zusätzliche Notizen zur Aktion..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActionDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={() => {
                    if (selectedAction && selectedReport) {
                      handleResolveReport(selectedReport.id, selectedAction, actionNotes);
                    }
                  }}
                  disabled={!selectedAction}
                >
                  Aktion ausführen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerationDashboard; 
