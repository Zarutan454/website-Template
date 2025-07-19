import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Settings, Shield, UserPlus, UserMinus, Crown, Ban, FileText, BarChart3, AlertTriangle, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from '@/components/ThemeProvider.utils';
import { useGroup, useGroupMemberAdminActions } from '@/hooks/useGroups';
import { useGroupAnalytics, useGroupReports } from '@/hooks/useGroups';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext.utils';
import type { GroupMember, ContentReport } from '@/hooks/useGroups';
import { groupSettingsAPI, uploadMedia } from '@/lib/django-api-new';
import type { GroupSettingsUpdate } from '@/lib/django-api-new';
import type { Group } from '@/hooks/useGroups';

// Constants
const TABS = {
  MEMBERS: 'members',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  REPORTS: 'reports'
} as const;

const ACTIONS = {
  PROMOTE: 'promote',
  DEMOTE: 'demote',
  KICK: 'kick'
} as const;

const REPORT_ACTIONS = {
  DELETE: 'delete',
  DISMISS: 'dismiss'
} as const;

const FILE_LIMITS = {
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  BANNER_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const;

const UPLOAD_PROGRESS = {
  INTERVAL: 100,
  MAX_PROGRESS: 90
} as const;

// Interface für Report-Items
interface ReportItem {
  id: string | number;
  type: string;
  description: string;
  reported_by: string;
  reported_at: string;
  status: string;
}

// Layout für die Verwaltungsseite
const ManagementLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-100">
      <div className="flex flex-1">
        <main className="flex-1 pt-14">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const GroupManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('members');
  const [confirmAction, setConfirmAction] = React.useState<{ type: 'promote' | 'demote' | 'kick'; member: GroupMember } | null>(null);
  const [confirmReportAction, setConfirmReportAction] = React.useState<{ reportId: string; action: 'delete' | 'dismiss' } | null>(null);

  if (!id) {
    return (
      <ManagementLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Gruppe nicht gefunden</h2>
          <p className="text-muted-foreground">Die angeforderte Gruppen-ID fehlt in der URL.</p>
        </div>
      </ManagementLayout>
    );
  }

  return <GroupManagementContent groupId={id} />;
};

interface GroupManagementContentProps {
  groupId: string;
}

const GroupManagementContent: React.FC<GroupManagementContentProps> = ({ groupId }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('members');
  const [confirmAction, setConfirmAction] = React.useState<{ type: 'promote' | 'demote' | 'kick'; member: GroupMember } | null>(null);
  const [confirmReportAction, setConfirmReportAction] = React.useState<{ reportId: string; action: 'delete' | 'dismiss' } | null>(null);

  // Group data
  const {
    group,
    members,
    isMember,
    isAdmin,
    isLoading,
    error
  } = useGroup(groupId);

  // Admin actions
  const { promote, demote, kick } = useGroupMemberAdminActions(groupId);

  // Analytics and reports
  const { data: analytics } = useGroupAnalytics(groupId);
  const { data: reports } = useGroupReports(groupId);

  // Settings form state
  const [editMode, setEditMode] = React.useState(false);
  const [settingsForm, setSettingsForm] = React.useState<GroupSettingsUpdate>({});
  const [settingsLoading, setSettingsLoading] = React.useState(false);
  const [settingsError, setSettingsError] = React.useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = React.useState(false);
  
  // File upload progress states
  const [avatarUploadProgress, setAvatarUploadProgress] = React.useState(0);
  const [bannerUploadProgress, setBannerUploadProgress] = React.useState(0);
  const [avatarUploadError, setAvatarUploadError] = React.useState<string | null>(null);
  const [bannerUploadError, setBannerUploadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (group && isAdmin) {
      setSettingsForm({
        name: group.name,
        description: group.description || '',
        privacy: group.privacy,
        guidelines: group.guidelines || '',
        type: group.type || '',
        tags: group.tags || [],
        avatar_url: group.avatar_url || '',
        banner_url: group.banner_url || '',
      });
    }
  }, [group, isAdmin]);

  // Check if user has admin rights
  if (!isAdmin) {
    return (
      <ManagementLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Zugriff verweigert</h2>
          <p className="text-muted-foreground mb-4">
            Du benötigst Administrator-Rechte, um diese Seite zu sehen.
          </p>
          <Button onClick={() => navigate(`/groups/${groupId}`)}>
            Zurück zur Gruppe
          </Button>
        </div>
      </ManagementLayout>
    );
  }

  const handleSettingsInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettingsForm(f => ({ ...f, [name]: value }));
  };

  const handleSettingsTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // File validation
    const maxSize = FILE_LIMITS.AVATAR_MAX_SIZE;
    const allowedTypes = FILE_LIMITS.ALLOWED_TYPES;
    
    if (file.size > maxSize) {
      setAvatarUploadError('Datei zu groß (max. 5MB)');
      e.target.value = '';
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setAvatarUploadError('Nur JPG, PNG und WebP erlaubt');
      e.target.value = '';
      return;
    }
    
    setSettingsLoading(true);
    setAvatarUploadError(null);
    setAvatarUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setAvatarUploadProgress(prev => {
          if (prev >= UPLOAD_PROGRESS.MAX_PROGRESS) {
            clearInterval(progressInterval);
            return UPLOAD_PROGRESS.MAX_PROGRESS;
          }
          return prev + UPLOAD_PROGRESS.INTERVAL;
        });
      }, UPLOAD_PROGRESS.INTERVAL);
      
      const res = await uploadMedia(file, 'group_avatar');
      
      clearInterval(progressInterval);
      setAvatarUploadProgress(100);
      
      setSettingsForm(f => ({ ...f, avatar_url: res.url }));
      toast.success('Avatar erfolgreich hochgeladen');
      
      // Reset progress after success
      setTimeout(() => setAvatarUploadProgress(0), 1000);
      
    } catch (error) {
      setAvatarUploadError('Fehler beim Hochladen des Avatars');
      toast.error('Fehler beim Hochladen des Avatars');
    } finally {
      setSettingsLoading(false);
      e.target.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // File validation
    const maxSize = FILE_LIMITS.BANNER_MAX_SIZE;
    const allowedTypes = FILE_LIMITS.ALLOWED_TYPES;
    
    if (file.size > maxSize) {
      setBannerUploadError('Datei zu groß (max. 10MB)');
      e.target.value = '';
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setBannerUploadError('Nur JPG, PNG und WebP erlaubt');
      e.target.value = '';
      return;
    }
    
    setSettingsLoading(true);
    setBannerUploadError(null);
    setBannerUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setBannerUploadProgress(prev => {
          if (prev >= UPLOAD_PROGRESS.MAX_PROGRESS) {
            clearInterval(progressInterval);
            return UPLOAD_PROGRESS.MAX_PROGRESS;
          }
          return prev + UPLOAD_PROGRESS.INTERVAL;
        });
      }, UPLOAD_PROGRESS.INTERVAL);
      
      const res = await uploadMedia(file, 'group_banner');
      
      clearInterval(progressInterval);
      setBannerUploadProgress(100);
      
      setSettingsForm(f => ({ ...f, banner_url: res.url }));
      toast.success('Banner erfolgreich hochgeladen');
      
      // Reset progress after success
      setTimeout(() => setBannerUploadProgress(0), 1000);
      
    } catch (error) {
      setBannerUploadError('Fehler beim Hochladen des Banners');
      toast.error('Fehler beim Hochladen des Banners');
    } finally {
      setSettingsLoading(false);
      e.target.value = '';
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(false);
    // Pflichtfelder prüfen
    if (!settingsForm.name || !settingsForm.privacy) {
      setSettingsError('Bitte fülle alle Pflichtfelder aus (Name, Privatsphäre).');
      setSettingsLoading(false);
      return;
    }
    try {
      await groupSettingsAPI.update(groupId, settingsForm);
      setSettingsSuccess(true);
      setEditMode(false);
      toast.success('Gruppeneinstellungen gespeichert');
      // Gruppe neu laden
      window.location.reload();
    } catch (err: unknown) {
      let msg = 'Fehler beim Speichern der Einstellungen';
      if (typeof err === 'object' && err && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } } };
        if (errorObj.response?.data?.error) {
          msg = errorObj.response.data.error;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setSettingsError(msg);
      toast.error(msg);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Admin actions als async Funktionen deklarieren und .mutateAsync verwenden:
  const handleMemberAction = async (action: 'promote' | 'demote' | 'kick', member: GroupMember) => {
    try {
      if (action === ACTIONS.PROMOTE) {
        await promote.mutateAsync(member.user.id);
        toast.success(`${member.user.username} wurde zum Moderator befördert`);
      } else if (action === ACTIONS.DEMOTE) {
        await demote.mutateAsync(member.user.id);
        toast.success(`${member.user.username} wurde zum Mitglied herabgestuft`);
      } else if (action === ACTIONS.KICK) {
        await kick.mutateAsync(member.user.id);
        toast.success(`${member.user.username} wurde aus der Gruppe entfernt`);
      }
      setConfirmAction(null);
    } catch (error) {
      toast.error('Fehler bei der Aktion');
    }
  };

  if (isLoading) {
    return (
      <ManagementLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </ManagementLayout>
    );
  }

  if (error || !group) {
    return (
      <ManagementLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Gruppe nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">
            Die angeforderte Gruppe konnte nicht geladen werden.
          </p>
          <Button onClick={() => navigate('/groups')}>Zurück zur Übersicht</Button>
        </div>
      </ManagementLayout>
    );
  }

  return (
    <ManagementLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/groups/${groupId}`)}>
              <ChevronLeft size={16} />
              Zurück
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gruppenverwaltung</h1>
              <p className="text-muted-foreground">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value={TABS.MEMBERS}>Mitglieder</TabsTrigger>
            <TabsTrigger value={TABS.SETTINGS}>Einstellungen</TabsTrigger>
            <TabsTrigger value={TABS.ANALYTICS}>Analytics</TabsTrigger>
            <TabsTrigger value={TABS.REPORTS}>Reports</TabsTrigger>
          </TabsList>

          {/* Mitglieder Tab */}
          <TabsContent value={TABS.MEMBERS} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Mitglieder verwalten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members?.forEach((member, index) => {
                    if (!member.id) {
                      console.error('Mitglied ohne id gefunden, index:', index, member);
                    }
                  })}
                  {members?.map((member, index) => (
                    <div key={member.id || `member-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {member.user.avatar_url ? (
                            <AvatarImage src={member.user.avatar_url} alt={member.user.username} />
                          ) : (
                            <AvatarFallback>{member.user.username.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.user.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.role === 'admin' && <Badge variant="default" className="gap-1"><Crown size={12} /> Admin</Badge>}
                            {member.role === 'moderator' && <Badge variant="secondary" className="gap-1"><Shield size={12} /> Moderator</Badge>}
                            {member.role === 'member' && <Badge variant="outline">Mitglied</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === 'member' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmAction({ type: ACTIONS.PROMOTE, member })}
                          >
                            <UserPlus size={14} />
                            Befördern
                          </Button>
                        )}
                        {member.role === 'moderator' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmAction({ type: ACTIONS.DEMOTE, member })}
                          >
                            <UserMinus size={14} />
                            Herabstufen
                          </Button>
                        )}
                        {member.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmAction({ type: ACTIONS.KICK, member })}
                          >
                            <Ban size={14} />
                            Entfernen
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Einstellungen Tab */}
          <TabsContent value={TABS.SETTINGS} className="space-y-4">
            <GroupSettingsForm
              group={group}
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              editMode={editMode}
              settingsLoading={settingsLoading}
              settingsError={settingsError}
              avatarUploadProgress={avatarUploadProgress}
              bannerUploadProgress={bannerUploadProgress}
              avatarUploadError={avatarUploadError}
              bannerUploadError={bannerUploadError}
              onSettingsInput={handleSettingsInput}
              onSettingsTags={handleSettingsTags}
              onAvatarUpload={handleAvatarUpload}
              onBannerUpload={handleBannerUpload}
              onSettingsSave={handleSettingsSave}
              onEditToggle={() => setEditMode(true)}
              onCancelEdit={() => setEditMode(false)}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value={TABS.ANALYTICS} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.total_members || 0}</div>
                      <div className="text-sm text-muted-foreground">Mitglieder</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.total_posts || 0}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.engagement_rate?.toFixed(1) || 0}%</div>
                      <div className="text-sm text-muted-foreground">Engagement</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Analytics-Daten verfügbar
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value={TABS.REPORTS} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(reports) && reports.length > 0 && reports.forEach((r, index) => {
                  if (!r.id) {
                    console.error('Report ohne id gefunden, index:', index, r);
                  }
                })}
                {Array.isArray(reports) && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((r, index) => (
                      <div key={r.id || `report-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{r.report_type || 'Unbekannt'}</div>
                          <div className="text-sm text-muted-foreground">{r.reason || 'Keine Beschreibung'}</div>
                          <div className="text-xs text-muted-foreground">
                            Von {r.reporter?.username || 'Unbekannt'} • {new Date(r.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={r.status === 'pending' ? 'default' : 'secondary'}>
                            {r.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmReportAction({ reportId: String(r.id), action: REPORT_ACTIONS.DELETE })}
                          >
                            Löschen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmReportAction({ reportId: String(r.id), action: REPORT_ACTIONS.DISMISS })}
                          >
                            Ignorieren
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Reports vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialogs */}
        {confirmAction && (
          <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmAction.type === ACTIONS.PROMOTE && 'Moderator befördern'}
                  {confirmAction.type === ACTIONS.DEMOTE && 'Mitglied herabstufen'}
                  {confirmAction.type === ACTIONS.KICK && 'Mitglied entfernen'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {confirmAction.type === ACTIONS.PROMOTE && `Möchtest du ${confirmAction.member.user.username} zum Moderator befördern? Diese Aktion kann nicht rückgängig gemacht werden.`}
                  {confirmAction.type === ACTIONS.DEMOTE && `Möchtest du ${confirmAction.member.user.username} zum Mitglied herabstufen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                  {confirmAction.type === ACTIONS.KICK && `Möchtest du ${confirmAction.member.user.username} aus der Gruppe entfernen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmAction(null)}>
                    Abbrechen
                  </Button>
                  <Button
                    variant={confirmAction.type === ACTIONS.KICK ? 'destructive' : 'default'}
                    onClick={() => handleMemberAction(confirmAction.type, confirmAction.member)}
                  >
                    {confirmAction.type === ACTIONS.PROMOTE && 'Befördern'}
                    {confirmAction.type === ACTIONS.DEMOTE && 'Herabstufen'}
                    {confirmAction.type === ACTIONS.KICK && 'Entfernen'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Report Action Confirmation Dialog */}
        {confirmReportAction && (
          <Dialog open={!!confirmReportAction} onOpenChange={() => setConfirmReportAction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmReportAction.action === REPORT_ACTIONS.DELETE && 'Report löschen'}
                  {confirmReportAction.action === REPORT_ACTIONS.DISMISS && 'Report ignorieren'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {confirmReportAction.action === REPORT_ACTIONS.DELETE && 'Möchtest du diesen Report wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'}
                  {confirmReportAction.action === REPORT_ACTIONS.DISMISS && 'Möchtest du diesen Report als erledigt markieren? Der Report wird aus der Liste entfernt.'}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmReportAction(null)}>
                    Abbrechen
                  </Button>
                  <Button
                    variant={confirmReportAction.action === REPORT_ACTIONS.DELETE ? 'destructive' : 'default'}
                    onClick={() => {
                      // TODO: Implement report action handling
                      toast.success('Report-Aktion ausgeführt');
                      setConfirmReportAction(null);
                    }}
                  >
                    {confirmReportAction.action === REPORT_ACTIONS.DELETE && 'Löschen'}
                    {confirmReportAction.action === REPORT_ACTIONS.DISMISS && 'Ignorieren'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ManagementLayout>
  );
};

// Extracted Settings Form Component
interface GroupSettingsFormProps {
  group: Group;
  settingsForm: GroupSettingsUpdate;
  setSettingsForm: (form: GroupSettingsUpdate) => void;
  editMode: boolean;
  settingsLoading: boolean;
  settingsError: string | null;
  avatarUploadProgress: number;
  bannerUploadProgress: number;
  avatarUploadError: string | null;
  bannerUploadError: string | null;
  onSettingsInput: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSettingsTags: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSettingsSave: (e: React.FormEvent) => void;
  onEditToggle: () => void;
  onCancelEdit: () => void;
}

const GroupSettingsForm: React.FC<GroupSettingsFormProps> = ({
  group,
  settingsForm,
  setSettingsForm,
  editMode,
  settingsLoading,
  settingsError,
  avatarUploadProgress,
  bannerUploadProgress,
  avatarUploadError,
  bannerUploadError,
  onSettingsInput,
  onSettingsTags,
  onAvatarUpload,
  onBannerUpload,
  onSettingsSave,
  onEditToggle,
  onCancelEdit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings size={20} />
          Gruppeneinstellungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSettingsSave} className="space-y-4" aria-label="Gruppeneinstellungen Formular" role="form">
          <fieldset disabled={!editMode} aria-disabled={String(!editMode)}>
            <legend className="sr-only">Gruppeneinstellungen</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Gruppenname <span className="sr-only">(Pflichtfeld)</span></Label>
              <Input
                id="name"
                name="name"
                value={settingsForm.name || ''}
                onChange={onSettingsInput}
                disabled={!editMode}
                aria-required="true"
                aria-label="Gruppenname"
              />
            </div>
            <div>
              <Label htmlFor="privacy">Privatsphäre <span className="sr-only">(Pflichtfeld)</span></Label>
              <select
                id="privacy"
                name="privacy"
                aria-label="Privatsphäre"
                value={settingsForm.privacy || 'public'}
                onChange={onSettingsInput}
                disabled={!editMode}
                className="w-full p-2 border rounded-md"
                aria-required="true"
              >
                <option value="public">Öffentlich</option>
                <option value="private">Privat</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              value={settingsForm.description || ''}
              onChange={onSettingsInput}
              disabled={!editMode}
              rows={3}
              aria-label="Gruppenbeschreibung"
            />
          </div>

          <div>
            <Label htmlFor="guidelines">Richtlinien</Label>
            <Textarea
              id="guidelines"
              name="guidelines"
              value={settingsForm.guidelines || ''}
              onChange={onSettingsInput}
              disabled={!editMode}
              rows={4}
              aria-label="Gruppenrichtlinien"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (kommagetrennt)</Label>
            <Input
              id="tags"
              name="tags"
              value={settingsForm.tags?.join(', ') || ''}
              onChange={onSettingsTags}
              disabled={!editMode}
              placeholder="tag1, tag2, tag3"
              aria-label="Gruppen-Tags"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              {/* @ts-expect-error accept expects a single value, but multiple are needed for UX */}
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onAvatarUpload}
                disabled={!editMode}
                aria-label="Gruppen-Avatar hochladen"
              />
              {avatarUploadProgress > 0 && avatarUploadProgress < 100 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Hochladen: {avatarUploadProgress}%
                </div>
              )}
              {avatarUploadError && (
                <div className="mt-2 text-red-500 text-sm">{avatarUploadError}</div>
              )}
            </div>
            <div>
              <Label htmlFor="banner">Banner</Label>
              {/* @ts-expect-error accept expects a single value, but multiple are needed for UX */}
              <Input
                id="banner"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onBannerUpload}
                disabled={!editMode}
                aria-label="Gruppen-Banner hochladen"
              />
              {bannerUploadProgress > 0 && bannerUploadProgress < 100 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Hochladen: {bannerUploadProgress}%
                </div>
              )}
              {bannerUploadError && (
                <div className="mt-2 text-red-500 text-sm">{bannerUploadError}</div>
              )}
            </div>
          </div>
        </fieldset>
        </form>

        {/* Buttons außerhalb des Formulars */}
        <div className="flex items-center gap-2">
          {!editMode ? (
            <Button 
              type="button" 
              onClick={onEditToggle}
            >
              Bearbeiten
            </Button>
          ) : (
            <>
              <Button 
                type="button" 
                onClick={onSettingsSave}
                disabled={settingsLoading}
              >
                {settingsLoading ? 'Speichern...' : 'Speichern'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancelEdit}
              >
                Abbrechen
              </Button>
            </>
          )}
        </div>

        {settingsError && (
          <div className="text-red-500 text-sm mt-2">{settingsError}</div>
        )}
      </CardContent>
    </Card>
  );
};

function safeChildren(children: React.ReactNode): React.ReactNode {
  if (Array.isArray(children)) {
    const filtered = children.filter(React.isValidElement);
    if (filtered.length === 0) {
      console.error('[safeChildren] Leeres Array als Child!');
      return <></>;
    }
    if (filtered.length !== children.length) {
      console.error('[safeChildren] Ungültige Children gefunden:', children);
    }
    return filtered;
  }
  if (children == null) {
    console.error('[safeChildren] null/undefined als Child!');
    return <></>;
  }
  if (!React.isValidElement(children)) {
    console.error('[safeChildren] Ungültiges Child:', children);
    return <></>;
  }
  return children;
}

export default GroupManagementPage; 

