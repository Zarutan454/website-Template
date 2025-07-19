import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users, Calendar, FileText, Settings, Image, MessageCircle, Loader2, AlertCircle, Plus, Menu, X, Bell
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { groupAPI } from '@/lib/django-api-new';
import { postAPI } from '@/lib/django-api-new';
import CreatePostBoxFacebook from '@/components/Feed/CreatePostBoxFacebook';
import { type CreatePostData, Post } from '@/types/posts';
import { type UserProfile, type UserProfileWithRole } from '@/lib/django-api-new';
import LeftSidebar from '@/components/Feed/LeftSidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { groupEventsAPI, groupMediaAPI, groupFilesAPI, groupAnalyticsAPI, groupMemberAdminAPI, groupReportsAPI } from '@/lib/django-api-new';
import GroupRightSidebar from './GroupRightSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import GroupMemberCard from './GroupMemberCard';
import GroupEventCard from './GroupEventCard';
import GroupMediaCard from './GroupMediaCard';
import GroupFileCard from './GroupFileCard';
import { Input } from '@/components/ui/input';

// TABS initial filtern, damit niemals ein leerer value vorkommt
const TABS_RAW = [
  { value: 'posts', label: 'Beiträge', icon: MessageCircle },
  { value: 'info', label: 'Info', icon: FileText },
  { value: 'members', label: 'Mitglieder', icon: Users },
  { value: 'events', label: 'Events', icon: Calendar },
  { value: 'media', label: 'Medien', icon: Image },
  { value: 'analytics', label: 'Analytics', icon: Settings },
  { value: 'admin', label: 'Admin-Tools', icon: Settings },
];
// Filtere Tabs mit leerem oder doppeltem value
const tabValueSet = new Set<string>();
const VALID_TABS = TABS_RAW.filter((tab, idx) => {
  if (!tab.value || tab.value.trim() === '') {
    console.error('[Tabs] Tab mit leerem value gefunden und entfernt:', tab, 'Index:', idx);
    return false;
  }
  if (tabValueSet.has(tab.value)) {
    console.error('[Tabs] Doppelter Tab value gefunden und entfernt:', tab.value, 'Index:', idx);
    return false;
  }
  tabValueSet.add(tab.value);
  return true;
});
// Logging für Tabs
console.log('VALID_TABS:', VALID_TABS.map(tab => tab.value));
const tabValuesSet = new Set();
VALID_TABS.forEach(tab => {
  if (!tab.value || tab.value.trim() === '') {
    console.error('Tab mit leerem value gefunden:', tab);
  }
  if (tabValuesSet.has(tab.value)) {
    console.error('Doppelter Tab value gefunden:', tab.value);
  }
  tabValuesSet.add(tab.value);
});

type Group = {
  id: string;
  name: string;
  description?: string;
  banner_url?: string;
  avatar_url?: string;
  members_count?: number;
  posts_count?: number;
  created_at: string;
  is_member: boolean;
  is_admin: boolean;
  privacy: 'public' | 'private';
  guidelines?: string;
};

// Typen für Events, Media, Files, Analytics, Reports
interface GroupEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
}
interface GroupMedia {
  id: string;
  url: string;
  type: string; // 'image' | 'video' | ...
}
interface GroupFile {
  id: string;
  file_name: string;
  file_size: number;
  sender: { id: string; username: string; avatar_url?: string };
  created_at: string;
  download_url: string;
}
interface GroupAnalytics {
  [key: string]: unknown;
}
interface GroupReport {
  id: string;
  type: string;
  description: string;
  created_at: string;
  // ... weitere Felder je nach Backend
}

// Lokaler Typ für Mitglieder mit optionalen Feldern
interface GroupMemberData {
  id: string | number;
  role?: string;
  is_online?: boolean;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  user?: {
    id: string | number;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [memberSearch, setMemberSearch] = useState('');
  const [membersPage, setMembersPage] = useState(1);
  const [hasMoreMembers, setHasMoreMembers] = useState(true);
  const [promoteLoading, setPromoteLoading] = useState<string | null>(null);
  const [kickLoading, setKickLoading] = useState<string | null>(null);

  // Redirect if ID is 'create' (invalid group ID)
  React.useEffect(() => {
    if (id === 'create') {
      navigate('/create-group', { replace: true });
      return;
    }
  }, [id, navigate]);

  // Group data - only load if id is valid
  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useQuery<Group>(['group', id], () => groupAPI.getGroupDetails(id!), { enabled: !!id && id !== 'create' });

  // --- Mitgliederliste zentral laden ---
  // Wir laden die vollständige Mitgliederliste (inkl. online/offline) einmal zentral
  const { data: membersListData, isLoading: membersLoading, error: membersError, refetch: refetchMembers } = useQuery<{ results: GroupMemberData[]; next?: string }>(
    ['group-members-list', id],
    () => groupAPI.getGroupMembers(id!),
    { enabled: !!id && id !== 'create' }
  );

  // Die zentrale Mitgliederliste ist jetzt:
  const allMembers: GroupMemberData[] = (membersListData?.results || []).map(m => ({ ...m, id: String(m.id) }));
  const membersCount = allMembers.length;

  // Gruppenposts laden
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery<{ results: Post[] }>(
    ['group-posts', id],
    () => postAPI.getPosts(1, 20, id!),
    { enabled: !!id && id !== 'create' && activeTab === 'posts' }
  );
  const posts = postsData?.results || [];

  // Gruppen-Events laden
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery<{ results: GroupEvent[] }>(
    ['group-events', id],
    () => groupEventsAPI.getGroupEvents(id!),
    { enabled: !!id && id !== 'create' && activeTab === 'events' }
  );
  const events = eventsData?.results || [];

  // Gruppen-Medien laden
  const {
    data: mediaData,
    isLoading: mediaLoading,
    error: mediaError,
  } = useQuery<{ results: GroupMedia[] }>(
    ['group-media', id],
    () => groupMediaAPI.getGroupMedia(id!),
    { enabled: !!id && id !== 'create' && activeTab === 'media' }
  );
  const media = mediaData?.results || [];

  // Gruppen-Dateien laden
  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery<{ results: GroupFile[] }>(
    ['group-files', id],
    () => groupFilesAPI.getGroupFiles(id!),
    { enabled: !!id && id !== 'create' && activeTab === 'files' }
  );
  const files = filesData?.results || [];

  // Gruppen-Analytics laden
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery<GroupAnalytics>(
    ['group-analytics', id],
    () => groupAnalyticsAPI.getGroupAnalytics(id!),
    { enabled: !!id && id !== 'create' && activeTab === 'analytics' }
  );

  // Gruppen-Reports laden
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
  } = useQuery<{ results: GroupReport[] }>(
    ['group-reports', id],
    () => groupReportsAPI.getGroupReports(id!),
    { enabled: !!id && id !== 'create' && activeTab === 'admin' }
  );
  const reports = reportsData?.results || [];

  // Mitgliederliste für Mitglieder-Tab (mit Pagination)
  const {
    data: membersData,
    isLoading: membersTabLoading,
    error: membersTabError,
  } = useQuery<{ results: GroupMemberData[]; next?: string }>(
    ['group-members', id, membersPage],
    () => groupAPI.getGroupMembers(id!, membersPage),
    { enabled: !!id && activeTab === 'members' }
  );

  // Mutations
  const joinLeaveMutation = useMutation({
    mutationFn: (action: 'join' | 'leave') =>
      action === 'join' ? groupAPI.joinGroup(id!) : groupAPI.leaveGroup(id!),
    onSuccess: () => {
      queryClient.invalidateQueries(['group', id]);
      toast.success('Gruppe erfolgreich aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren der Gruppe');
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (postData: CreatePostData) => postAPI.createPost({ ...postData, group: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-posts', id]);
      toast.success('Post erfolgreich erstellt');
    },
    onError: () => {
      toast.error('Fehler beim Erstellen des Posts');
    },
  });

  // Don't render anything while redirecting
  if (id === 'create') {
    return null;
  }

  // --- Logging für Members ---
  if (Array.isArray(allMembers)) {
    const memberIds = new Set();
    allMembers.forEach((member, index) => {
      if (!member.id) {
        console.error('Member ohne id gefunden, index:', index, member);
        return;
      }
      if (memberIds.has(member.id)) {
        console.error('Doppelter Member-Key:', member.id);
        return;
      }
      memberIds.add(member.id);
      console.log('Member-Key:', member.id || `member-${index}`);
    });
    console.log('Members-Liste:', allMembers);
  }

  // --- Logging für Events ---
  if (Array.isArray(events)) {
    const eventIds = new Set();
    events.forEach((event, index) => {
      if (!event.id) {
        console.error('Event ohne id gefunden, index:', index, event);
        return;
      }
      if (eventIds.has(event.id)) {
        console.error('Doppelter Event-Key:', event.id);
        return;
      }
      eventIds.add(event.id);
      console.log('Event-Key:', event.id || `event-${index}`);
    });
    console.log('Events-Liste:', events);
  }

  // --- Logging für Media ---
  if (Array.isArray(media)) {
    const mediaIds = new Set();
    media.forEach((media, index) => {
      if (!media.id) {
        console.error('Media ohne id gefunden, index:', index, media);
        return;
      }
      if (mediaIds.has(media.id)) {
        console.error('Doppelter Media-Key:', media.id);
        return;
      }
      mediaIds.add(media.id);
      console.log('Media-Key:', media.id || `media-${index}`);
    });
    console.log('Media-Liste:', media);
  }

  // --- Logging für Files ---
  if (Array.isArray(files)) {
    const fileIds = new Set();
    files.forEach((file, index) => {
      if (!file.id) {
        console.error('Datei ohne id gefunden, index:', index, file);
        return;
      }
      if (fileIds.has(file.id)) {
        console.error('Doppelter File-Key:', file.id);
        return;
      }
      fileIds.add(file.id);
      console.log('File-Key:', file.id || `file-${index}`);
    });
    console.log('Files-Liste:', files);
  }

  // Hilfsfunktion für Mapping
  function toGroupMemberCardData(member: GroupMemberData, index: number): GroupMemberCardData {
    const id = member.id ? String(member.id) : `unknown-id-${index}`;
    
    // Debug-Logging für die Member-Datenstruktur
    console.log(`[toGroupMemberCardData] Member ${index}:`, member);
    
    // Prüfe, ob member.user existiert (GroupMembershipSerializer Struktur)
    if (member.user) {
      // Backend gibt { id, user: { id, username, display_name, avatar_url }, role, is_online }
      const userData = member.user;
      return {
        id: String(userData.id || id),
        user: {
          id: String(userData.id || id),
          username: userData.username || `user-${userData.id || id}`,
          display_name: userData.display_name || userData.username || `User ${userData.id || id}`,
          avatar_url: userData.avatar_url || undefined,
        },
        role: member.role || 'member',
        is_online: member.is_online || false,
      };
    } else {
      // Fallback für direkte User-Daten
      return {
        id: String(member.id || id),
        user: {
          id: String(member.id || id),
          username: member.username || `user-${member.id || id}`,
          display_name: member.display_name || member.username || `User ${member.id || id}`,
          avatar_url: member.avatar_url || undefined,
        },
        role: member.role || 'member',
        is_online: member.is_online || false,
      };
    }
  }

  // Mitglieder für Mitglieder-Tab
  const memberCardData = allMembers.map(toGroupMemberCardData);

  // Sichtbarkeit der CreatePostBox: Öffentlich+eingeloggt ODER Privat+Mitglied
  const canCreatePost =
    (group && group.privacy === 'public' && !!currentUser) ||
    (group && group.privacy === 'private' && group.is_member);

  if (!id) {
    return <div className="text-center py-10 text-white">Gruppe nicht gefunden</div>;
  }

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Gruppe nicht gefunden</h2>
        <p className="text-muted-foreground mb-4">
          Die angeforderte Gruppe konnte nicht geladen werden.
        </p>
        <Button onClick={() => navigate('/groups')}>Zurück zur Übersicht</Button>
      </div>
    );
  }

  const handleJoinLeave = () => {
    if (!currentUser) {
      setShowJoinDialog(true);
      return;
    }
    joinLeaveMutation.mutate(group.is_member ? 'leave' : 'join');
  };

  const handleCreatePost = async (postData: CreatePostData) => {
    return createPostMutation.mutateAsync(postData);
  };

  // Promote API-Call
  const handlePromote = async (userId: string) => {
    setPromoteLoading(userId);
    try {
      await groupMemberAdminAPI.promote(id!, userId);
      toast.success('Mitglied zum Admin befördert');
      refetchMembers();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || 'Fehler beim Befördern');
    } finally {
      setPromoteLoading(null);
    }
  };

  // Kick API-Call
  const handleKick = async (userId: string) => {
    setKickLoading(userId);
    try {
      await groupMemberAdminAPI.kick(id!, userId);
      toast.success('Mitglied entfernt');
      refetchMembers();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || 'Fehler beim Entfernen');
    } finally {
      setKickLoading(null);
    }
  };

  // Helper: Filter array for unique, non-empty keys
  function filterUniqueById<T extends { id?: string }>(arr: T[], type: string) {
    const seen = new Set();
    return arr.filter((item, idx) => {
      if (!item.id || item.id === '') {
        console.error(`[${type}] Item ohne id übersprungen:`, item, 'Index:', idx);
        return false;
      }
      if (seen.has(item.id)) {
        console.error(`[${type}] Doppelter Key übersprungen:`, item.id, 'Index:', idx);
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  // Helper: Filtert nur gültige React-Elemente
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

  // Helper: TabsContent nur mit gültigem value
  function renderTabContent(value: string, children: React.ReactNode) {
    if (!value || value.trim() === '') {
      console.error('TabsContent mit leerem value wird nicht gerendert! value:', value);
      return null;
    }
    const safe = safeChildren(children);
    return <TabsContent value={value} className="space-y-6">{safe}</TabsContent>;
  }

  // Helper: Collect all rendered tab contents (must be inside component to access variables)
  function getAllTabContents() {
    const contents = [];
    contents.push(renderTabContent('posts', (
      <>
        {canCreatePost && (
          <div className="bg-dark-200 rounded-lg p-4 border border-white/10">
            <CreatePostBoxFacebook
              onCreatePost={handleCreatePost}
              darkMode={true}
              hidePrivacySelector={true}
            />
          </div>
        )}
        <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
          {postsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : postsError ? (
            <div className="text-center text-red-400">Fehler beim Laden der Beiträge.</div>
          ) : filterUniqueById(posts, 'Post').length === 0 ? (
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Beiträge</h3>
              <p>Hier werden die Beiträge der Gruppe angezeigt.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filterUniqueById(posts, 'Post').map((post, index) => (
                <motion.div
                  key={post.id || `post-${index}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-dark-300 rounded-lg p-4 border border-white/10 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatar_url} alt={post.author.display_name || post.author.username} />
                      <AvatarFallback>{post.author.display_name?.charAt(0) || post.author.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{post.author.display_name || post.author.username}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(post.created_at).toLocaleString('de-DE')}</span>
                  </div>
                  <div className="text-white mb-2">{post.content}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </>
    )));
    contents.push(renderTabContent('info', (
      <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Gruppeninformationen</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Beschreibung</h4>
            <p className="text-gray-300">{group.description || 'Keine Beschreibung verfügbar.'}</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Privatsphäre</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${group.privacy === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {group.privacy === 'public' ? 'Öffentlich' : 'Privat'}
            </span>
          </div>
          {group.guidelines && (
            <div>
              <h4 className="font-medium text-white mb-2">Richtlinien</h4>
              <p className="text-gray-300">{group.guidelines}</p>
            </div>
          )}
        </div>
      </div>
    )));
    contents.push(renderTabContent('members', (
      <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Mitglieder</h3>
        <Input
          type="text"
          placeholder="Mitglieder suchen..."
          value={memberSearch}
          onChange={e => setMemberSearch(e.target.value)}
          className="mb-4 max-w-xs"
        />
        {membersTabLoading && membersPage === 1 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : membersTabError ? (
          <div className="text-center text-red-400">Fehler beim Laden der Mitglieder.</div>
        ) : filterUniqueById(memberCardData, 'Member').length === 0 ? (
          <div className="text-center text-muted-foreground">Keine Mitglieder gefunden.</div>
        ) : (
          <div className="space-y-3">
            {filterUniqueById(memberCardData, 'Member').map((memberCardData, index) => (
              <GroupMemberCard
                key={memberCardData.id || `member-${index}`}
                member={memberCardData}
                isAdmin={group.is_admin}
                onPromote={handlePromote}
                onKick={handleKick}
                loadingPromote={String(promoteLoading) === String(memberCardData.user.id)}
                loadingKick={String(kickLoading) === String(memberCardData.user.id)}
              />
            ))}
            {hasMoreMembers && (
              <button
                className="w-full mt-2 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
                onClick={() => setMembersPage(p => p + 1)}
                disabled={membersTabLoading}
              >
                Mehr laden
              </button>
            )}
          </div>
        )}
      </div>
    )));
    contents.push(renderTabContent('events', (
      <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Events</h3>
        {eventsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : eventsError ? (
          <div className="text-center text-red-400">Fehler beim Laden der Events.</div>
        ) : filterUniqueById(events, 'Event').length === 0 ? (
          <div className="text-center text-muted-foreground">Keine Events gefunden.</div>
        ) : (
          <div className="space-y-2">
            {filterUniqueById(events, 'Event').map((event, index) => (
              <GroupEventCard
                key={event.id || `event-${index}`}
                event={event}
                onRSVP={(eventId, status) => {/* TODO: API-Call RSVP */}}
              />
            ))}
          </div>
        )}
      </div>
    )));
    contents.push(renderTabContent('media', (
      <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Medien</h3>
        {mediaLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : mediaError ? (
          <div className="text-center text-red-400">Fehler beim Laden der Medien.</div>
        ) : filterUniqueById(media, 'Media').length === 0 ? (
          <div className="text-center text-muted-foreground">Keine Medien gefunden.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filterUniqueById(media, 'Media').map((media, index) => (
              <GroupMediaCard
                key={media.id || `media-${index}`}
                media={media}
                onOpenLightbox={() => {/* TODO: Lightbox öffnen */}}
              />
            ))}
          </div>
        )}
      </div>
    )));
    contents.push(renderTabContent('analytics', (
      <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Analytics</h3>
        {analyticsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : analyticsError ? (
          <div className="text-center text-red-400">Fehler beim Laden der Analytics.</div>
        ) : !analyticsData ? (
          <div className="text-center text-muted-foreground">Keine Analytics-Daten gefunden.</div>
        ) : (
          <pre className="text-xs text-gray-300 bg-dark-300 rounded p-2 overflow-x-auto">{JSON.stringify(analyticsData, null, 2)}</pre>
        )}
      </div>
    )));
    contents.push(group.is_admin && renderTabContent('admin', (
      <div className="bg-dark-200 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Admin-Tools</h3>
        <div className="mb-4">
          <Button onClick={() => navigate(`/groups/${id}/manage`)} variant="default" className="mr-2">
            <Settings className="h-4 w-4 mr-2" /> Gruppe bearbeiten
          </Button>
          <Button onClick={() => toast.info('Mitgliederverwaltung kommt bald!')} variant="outline">
            <Users className="h-4 w-4 mr-2" /> Mitglieder verwalten
          </Button>
        </div>
        <div className="mb-4 text-gray-300">Hier kannst du Gruppen-Einstellungen und Mitglieder verwalten. Weitere Admin-Funktionen folgen.</div>
        {reportsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reportsError ? (
          <div className="text-center text-red-400">Fehler beim Laden der Reports.</div>
        ) : !reports ? (
          <div className="text-center text-muted-foreground">Keine Reports gefunden.</div>
        ) : (
          <pre className="text-xs text-gray-300 bg-dark-300 rounded p-2 overflow-x-auto">{JSON.stringify(reports, null, 2)}</pre>
        )}
      </div>
    )));
    return contents.filter(Boolean);
  }

  // Bestmögliche Mitgliederliste für Sidebar
  // const sidebarMembers = allMembers.length > 0 ? allMembers : (membersData?.results || []);

  // Layout: Sidebar + Main Content
  return (
    <div className="flex min-h-screen bg-dark-100">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <div className="w-64 fixed top-0 left-0 bottom-0 z-20 bg-dark-200/95 backdrop-blur-sm border-r border-white/5 overflow-auto hide-scrollbar">
          <LeftSidebar />
        </div>
      )}
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 bg-dark-200 border border-white/10 text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setSidebarOpen(false)}>
              <div className="absolute top-0 left-0 w-64 h-full bg-dark-200 p-4">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="mb-4">
                  <X className="h-5 w-5" />
                </Button>
                <LeftSidebar />
              </div>
            </div>
          )}
        </>
      )}
      {/* Main Content */}
      <main className={`flex-1 ${!isMobile ? 'lg:ml-64 lg:mr-72' : ''} pt-8 px-2 flex justify-center`}> {/* Abstand für Sidebars */}
        <div className="w-full max-w-3xl">
          {/* Group Banner */}
          <div className="w-full h-40 md:h-56 rounded-t-xl overflow-hidden mb-[-2.5rem] relative">
            {group.banner_url ? (
              <img
                src={group.banner_url}
                alt="Gruppen-Banner"
                className="w-full h-full object-cover"
                style={{ minHeight: '100%', minWidth: '100%' }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-900 to-primary-700 opacity-80" />
            )}
          </div>
          {/* Sticky Group Header */}
          <motion.div layout className="sticky top-0 z-10 bg-dark-100/95 backdrop-blur-md shadow-lg rounded-b-xl mb-8 px-4 py-6 flex items-center gap-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative">
              <Avatar className={`h-20 w-20 border-4 border-white shadow-lg ${group.is_member ? 'ring-4 ring-green-400 animate-pulse' : ''}`}> {/* Avatar-Glow wenn online */}
                <AvatarImage src={group.avatar_url} alt={group.name} />
                <AvatarFallback className="text-2xl font-bold">{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-1 truncate">{group.name}</h1>
              {group.description && <p className="text-gray-300 mb-2 truncate">{group.description}</p>}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{membersCount} Mitglieder</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{group.posts_count || 0} Posts</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Erstellt {new Date(group.created_at).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={group.is_member ? 'outline' : 'default'}
                      onClick={handleJoinLeave}
                      disabled={joinLeaveMutation.isPending}
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      {joinLeaveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : group.is_member ? (
                        <>
                          <Users className="h-4 w-4 mr-2" />Mitglied
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />Beitreten
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gruppe beitreten/verlassen</TooltipContent>
                </Tooltip>
                {/* Benachrichtigungen-Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => toast.info('Benachrichtigungen-Button (noch nicht implementiert)')}
                      className="bg-white/90 hover:bg-white text-gray-900"
                      title="Benachrichtigungen für diese Gruppe"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Benachrichtigungen
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Benachrichtigungen</TooltipContent>
                </Tooltip>
                {/* Bearbeiten-Button */}
                {group.is_admin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/groups/${id}/manage`)}
                        className="bg-white/90 hover:bg-white text-gray-900"
                      >
                        <Settings className="h-4 w-4 mr-2" />Bearbeiten
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Gruppe bearbeiten</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </motion.div>
          {/* Tabs mit animiertem Indikator */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="relative flex w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-6">
              {(() => {
                const seen = new Set();
                const filteredTabs = VALID_TABS.filter(tab => {
                  if (!tab.value || tab.value.trim() === '') {
                    console.error('[TabsTrigger] Tab mit leerem value übersprungen:', tab);
                    return false;
                  }
                  if (seen.has(tab.value)) {
                    console.error('[TabsTrigger] Doppelter Tab value übersprungen:', tab.value);
                    return false;
                  }
                  seen.add(tab.value);
                  return true;
                });
                return filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center gap-2 relative px-4 py-2 font-medium text-sm transition-colors duration-200"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {activeTab === tab.value && (
                        <motion.div layoutId="tab-indicator" className="absolute left-0 right-0 -bottom-1 h-1 bg-primary rounded" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                      )}
                    </TabsTrigger>
                  );
                });
              })()}
            </TabsList>
            {(() => {
              // Only render the active tab content
              const tabExists = VALID_TABS.some(tab => tab.value === activeTab);
              if (!tabExists) {
                console.error('[TabsContent] activeTab not in VALID_TABS:', activeTab);
                return null;
              }
              return (
                <AnimatePresence mode="wait">
                  <TabsContent key={activeTab} value={activeTab} className="space-y-6">
                    {(() => {
                      switch (activeTab) {
                        case 'posts':
                          return getAllTabContents()[0]?.props.children;
                        case 'info':
                          return getAllTabContents()[1]?.props.children;
                        case 'members':
                          return getAllTabContents()[2]?.props.children;
                        case 'events':
                          return getAllTabContents()[3]?.props.children;
                        case 'media':
                          return getAllTabContents()[4]?.props.children;
                        case 'analytics':
                          return getAllTabContents()[5]?.props.children;
                        case 'admin':
                          return getAllTabContents()[6]?.props.children;
                        default:
                          return null;
                      }
                    })()}
                  </TabsContent>
                </AnimatePresence>
              );
            })()}
          </Tabs>
          {/* Join Dialog */}
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogContent className="bg-dark-200 border-white/10">
              <DialogTitle className="text-white">Anmeldung erforderlich</DialogTitle>
              <p className="text-gray-300 mb-4">
                Du musst angemeldet sein, um dieser Gruppe beizutreten.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/login')}>Anmelden</Button>
                <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                  Abbrechen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* FAB für Beitragserstellung (nur Mobile) */}
        {isMobile && canCreatePost && (
          <button
            className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none lg:hidden"
            onClick={() => setShowCreatePost(true)}
            aria-label="Beitrag erstellen"
          >
            <Plus className="h-7 w-7" />
          </button>
        )}
        {/* Bottom-Navigation für Tabs (nur Mobile) */}
        {isMobile && group && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-200 border-t border-white/10 flex justify-around py-2 lg:hidden">
            {(() => {
              const seen = new Set();
              const filteredTabs = VALID_TABS.filter(tab => {
                if (!tab.value || tab.value.trim() === '') {
                  console.error('[MobileTabs] Tab mit leerem value übersprungen:', tab);
                  return false;
                }
                if (seen.has(tab.value)) {
                  console.error('[MobileTabs] Doppelter Tab value übersprungen:', tab.value);
                  return false;
                }
                seen.add(tab.value);
                return true;
              });
              return filteredTabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={`tab-mobile-${tab.value || index}`}
                    className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${activeTab === tab.value ? 'text-primary' : 'text-gray-400'}`}
                    onClick={() => setActiveTab(tab.value)}
                    aria-label={tab.label}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              });
            })()}
          </nav>
        )}
      </main>
      {/* Rechte Gruppen-Sidebar (nur Desktop, Slide-In) */}
      {!isMobile && (
        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 30 }}>
          <GroupRightSidebar members={allMembers as UserProfileWithRole[]} />
        </motion.div>
      )}
    </div>
  );
};

export default GroupDetailPage; 