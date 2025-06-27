import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { ChevronLeft, Users, Settings, Bell, BellOff, Calendar, Plus, MessageSquare, Share2, Heart, MoreHorizontal, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/ThemeProvider';
import { useGroup } from '@/hooks/useGroups';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GroupPost {
  id: string;
  content: string;
  media_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  group_id: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
}

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <FeedLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Gruppe nicht gefunden</h2>
          <p className="text-muted-foreground">Die angeforderte Gruppen-ID fehlt in der URL.</p>
        </div>
      </FeedLayout>
    );
  }

  return <GroupDetailContent groupId={id} />;
};

interface GroupDetailContentProps {
  groupId: string;
}

const GroupDetailContent: React.FC<GroupDetailContentProps> = ({ groupId }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('posts');
  const [newPostContent, setNewPostContent] = useState('');

  const {
    group,
    members,
    isMember,
    isAdmin,
    isLoading,
    isJoining,
    isLeaving,
    joinGroup,
    leaveGroup,
    error
  } = useGroup(groupId);

  // TODO: Implement post fetching and creation logic
  const posts: GroupPost[] = [];
  const isLoadingPosts = false;
  const createPostMutation = { mutate: () => {}, isPending: false };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    // createPostMutation.mutate(newPostContent);
    setNewPostContent('');
  };

  if (isLoading) {
    return <GroupDetailSkeleton />;
  }

  if (error || !group) {
    return (
      <FeedLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Gruppe nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">
            Die angeforderte Gruppe konnte nicht geladen werden oder existiert nicht.
          </p>
          <Button onClick={() => navigate('/community')}>Zurück zur Übersicht</Button>
        </div>
      </FeedLayout>
    );
  }

  const actionInProgress = isJoining || isLeaving;

  return (
    <FeedLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="relative">
          <div 
            className="h-48 bg-cover bg-center rounded-lg" 
            style={{ 
              backgroundImage: group.banner_url 
                ? `url(${group.banner_url})` 
                : `linear-gradient(to right, ${theme === 'dark' ? '#1f2937, #111827' : '#e5e7eb'})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-background">
                  {group.avatar_url ? (
                  <AvatarImage src={group.avatar_url} alt={group.name} />
                  ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700 text-2xl">
                      {group.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                <h1 className="text-white text-2xl font-bold">{group.name}</h1>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Users size={14} />
                    <span>{group.member_count} {group.member_count === 1 ? 'Mitglied' : 'Mitglieder'}</span>
                  {group.privacy === 'private' && (
                      <span className="bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">Privat</span>
                    )}
                  </div>
                </div>
              </div>
              
            <div className="flex items-center gap-2">
                {isMember ? (
                  <>
                  <Button size="sm" variant="secondary" className="gap-1" disabled={actionInProgress}>
                    <Bell size={14} />
                    <span>Benachrichtigungen</span>
                    </Button>
                    {isAdmin && (
                    <Button size="sm" variant="outline" className="gap-1" disabled={actionInProgress}>
                        <Settings size={14} />
                        <span>Verwalten</span>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="px-2" disabled={actionInProgress}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                      <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10" onClick={() => leaveGroup()}>
                        {isLeaving ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                        <span>Gruppe verlassen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                <Button size="sm" onClick={() => joinGroup()} disabled={actionInProgress} className="gap-1">
                  {isJoining ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    <span>Beitreten</span>
                  </Button>
                )}
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
            <p className="text-sm">{group.description}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Beiträge</TabsTrigger>
            <TabsTrigger value="members">Mitglieder ({members.length})</TabsTrigger>
            <TabsTrigger value="about">Über</TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {isMember ? (
              <div className="p-4 rounded-lg bg-card border">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Teile etwas mit der Gruppe..."
                  className="w-full p-2 bg-transparent border rounded-md focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleCreatePost} disabled={createPostMutation.isPending || !newPostContent.trim()}>
                    {createPostMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Posten
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 rounded-lg bg-card border">
                <h3 className="font-semibold">Trete der Gruppe bei, um Beiträge zu sehen und zu erstellen.</h3>
              </div>
            )}
            
            {isMember && (
              isLoadingPosts ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {/* TODO: Render actual posts */}
                  <p>Post-Anzeige wird noch implementiert.</p>
                </div>
              ) : (
                <EmptyState
                  title="Noch keine Beiträge"
                  description="In dieser Gruppe wurden noch keine Beiträge geteilt. Sei der Erste!"
                  icon={<MessageSquare className="h-16 w-16 text-muted-foreground opacity-20" />}
                />
              )
            )}
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                        <Avatar>
                            <AvatarImage src={member.user.avatar_url || undefined} />
                            <AvatarFallback>{member.user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                        <div>
                            <p className="font-semibold">{member.user.username}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>
                ))}
                  </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="p-4 rounded-lg bg-card border space-y-2">
              <h3 className="font-semibold">Über diese Gruppe</h3>
              <p className="text-sm text-muted-foreground">{group.description || 'Keine Beschreibung vorhanden.'}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={14} className="mr-2"/>
                Erstellt am {format(new Date(group.created_at), 'dd. MMMM yyyy', { locale: de })} von {group.creator.username}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FeedLayout>
  );
};

const GroupDetailSkeleton: React.FC = () => (
  <FeedLayout>
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="relative">
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      
      {/* Description Skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Tabs Skeleton */}
      <div>
        <div className="flex space-x-4 border-b">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  </FeedLayout>
);

export default GroupDetailPage;
