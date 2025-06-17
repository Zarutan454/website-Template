import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { ChevronLeft, Users, Settings, Bell, BellOff, Calendar, Plus, MessageSquare, Share2, Heart, MoreHorizontal, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/ThemeProvider';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  member_count: number;
  posts_count: number;
  created_at: string;
  created_by: string;
  is_private: boolean;
  updated_at: string;
}

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

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
    display_name: string | null;
  };
}

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [newPostContent, setNewPostContent] = useState('');

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Group;
    },
    enabled: !!id,
  });

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['group-posts', id],
    queryFn: async () => {
      const { data: groupPostsData, error: groupPostsError } = await supabase
        .from('group_posts')
        .select('post_id')
        .eq('group_id', id);
      
      if (groupPostsError) {
        throw groupPostsError;
      }
      
      if (!groupPostsData || groupPostsData.length === 0) {
        return [] as GroupPost[];
      }
      
      const postIds = groupPostsData.map(item => item.post_id);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(username, avatar_url)
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching group posts:', error);
        throw error;
      }
      
      const formattedPosts = data.map(post => ({
        ...post,
        group_id: id,
        profile: post.profiles
      }));
      
      return formattedPosts as GroupPost[];
    },
    enabled: !!id,
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['group-members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profile:profiles(username, avatar_url, display_name)
        `)
        .eq('group_id', id);
      
      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!id && activeTab === 'members',
  });

  const { data: userMembership } = useQuery({
    queryKey: ['user-membership', id, profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', profile.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!profile,
  });

  const isMember = !!userMembership;
  const isAdmin = userMembership?.role === 'admin';
  const isModerator = userMembership?.role === 'moderator' || isAdmin;

  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Nicht angemeldet');
      
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: id,
          user_id: profile.id,
          role: 'member'
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-membership', id, profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      toast.success('Du bist der Gruppe beigetreten');
    },
    onError: (error) => {
      console.error('Join group error:', error);
      toast.error('Beitritt fehlgeschlagen. Bitte versuche es später erneut.');
    }
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !userMembership) throw new Error('Nicht Mitglied');
      
      const { data, error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', userMembership.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-membership', id, profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      toast.success('Du hast die Gruppe verlassen');
    },
    onError: (error) => {
      console.error('Leave group error:', error);
      toast.error('Fehler beim Verlassen der Gruppe. Bitte versuche es später erneut.');
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!profile) throw new Error('Nicht angemeldet');
      if (!content.trim()) throw new Error('Inhalt darf nicht leer sein');
      
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: profile.id,
          content: content.trim()
        })
        .select()
        .single();
      
      if (postError) throw postError;
      
      const { error: linkError } = await supabase
        .from('group_posts')
        .insert({
          group_id: id,
          post_id: postData.id
        });
      
      if (linkError) {
        await supabase.from('posts').delete().eq('id', postData.id);
        throw linkError;
      }
      
      return postData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', id] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setNewPostContent('');
      toast.success('Beitrag erstellt');
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast.error('Beitrag konnte nicht erstellt werden. Bitte versuche es später erneut.');
    }
  });

  const handleJoinGroup = () => {
    joinGroupMutation.mutate();
  };

  const handleLeaveGroup = () => {
    leaveGroupMutation.mutate();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate(newPostContent);
  };

  if (isLoadingGroup) {
    return (
      <FeedLayout>
        <div className="animate-pulse space-y-6">
          <div className={`h-40 rounded-xl ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-4">
            <div className={`h-16 w-16 rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
            <div className="space-y-2">
              <div className={`h-6 w-40 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-24 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        </div>
      </FeedLayout>
    );
  }

  if (!group) {
    return (
      <FeedLayout>
        <div className="text-center p-8">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Gruppe nicht gefunden
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Die angeforderte Gruppe existiert nicht oder wurde gelöscht.
          </p>
          <Button className="mt-4" onClick={() => navigate('/community/groups')}>
            Zurück zur Gruppenliste
          </Button>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`mb-4 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => navigate('/community/groups')}
          >
            <ChevronLeft size={16} className="mr-1" /> Alle Gruppen
          </Button>
          
          <div 
            className="h-40 w-full rounded-xl bg-cover bg-center relative overflow-hidden" 
            style={{ 
              backgroundImage: group.banner_url 
                ? `url(${group.banner_url})` 
                : `linear-gradient(to right, ${theme === 'dark' ? '#374151, #1f2937' : '#e5e7eb, #d1d5db'})` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white">
                  {group.avatar_url ? (
                    <AvatarImage src={group.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700 text-xl">
                      {group.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-white text-xl font-bold">{group.name}</h1>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Users size={14} />
                    <span>{group.member_count} {group.member_count === 1 ? 'Mitglied' : 'Mitglieder'}</span>
                    {group.is_private && (
                      <span className="bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">Privat</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isMember ? (
                  <>
                    <Button size="sm" variant="secondary" className="gap-1">
                      {isMember && !isAdmin ? <BellOff size={14} /> : <Bell size={14} />}
                      <span>{isMember && !isAdmin ? 'Stumm' : 'Benachrichtigungen'}</span>
                    </Button>
                    {isAdmin && (
                      <Button size="sm" variant="outline" className="gap-1">
                        <Settings size={14} />
                        <span>Verwalten</span>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="px-2">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="gap-2" onClick={handleLeaveGroup}>
                          <UserMinus size={14} className="text-red-500" />
                          <span className="text-red-500">Gruppe verlassen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button size="sm" onClick={handleJoinGroup} className="gap-1">
                    <UserPlus size={14} />
                    <span>Beitreten</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {group.description && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
            <p className="text-sm">{group.description}</p>
          </div>
        )}

        <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="posts">Beiträge</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Mitglieder</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {isMember && (
              <form onSubmit={handleCreatePost} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <textarea
                  className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-dark-200 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} border`}
                  placeholder="Teile etwas mit der Gruppe..."
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
                <div className="flex justify-between mt-3">
                  <div className="flex gap-2">
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newPostContent.trim() || createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? 'Wird gepostet...' : 'Posten'}
                  </Button>
                </div>
              </form>
            )}

            {isLoadingPosts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} animate-pulse`}>
                    <div className="flex gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                      <div className="space-y-2">
                        <div className={`h-4 w-24 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                        <div className={`h-3 w-16 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`h-4 w-full rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                      <div className={`h-4 w-3/4 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        {post.profile?.avatar_url ? (
                          <AvatarImage src={post.profile.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700">
                            {post.profile?.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {post.profile?.username || 'Unbekannter Benutzer'}
                        </h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(post.created_at).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {post.content}
                    </p>
                    {post.media_url && (
                      <img 
                        src={post.media_url} 
                        alt="Post media" 
                        className="w-full h-auto rounded-lg mb-4 object-cover"
                      />
                    )}
                    <div className="flex justify-between text-sm">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Heart size={14} />
                        <span>Gefällt mir</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <MessageSquare size={14} />
                        <span>Kommentieren</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Share2 size={14} />
                        <span>Teilen</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Keine Beiträge</h3>
                <p className="text-sm mb-4">
                  In dieser Gruppe wurden noch keine Beiträge erstellt.
                  {isMember && ' Sei der Erste, der etwas postet!'}
                </p>
                {!isMember && (
                  <Button onClick={handleJoinGroup}>
                    Gruppe beitreten
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <Calendar size={40} className="mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Keine Events</h3>
              <p className="text-sm mb-4">
                In dieser Gruppe wurden noch keine Events erstellt.
                {isMember && isModerator && ' Erstelle das erste Event für die Gruppe!'}
              </p>
              {isMember && isModerator && (
                <Button>
                  <Plus size={14} className="mr-1" />
                  Event erstellen
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingMembers ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} animate-pulse flex items-center gap-3`}>
                    <div className={`h-12 w-12 rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-24 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                      <div className={`h-3 w-16 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                ))
              ) : members && members.length > 0 ? (
                members.map((member) => (
                  <div 
                    key={member.id} 
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100 hover:bg-dark-200' : 'bg-white hover:bg-gray-50'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex items-center gap-3 transition-colors duration-200 cursor-pointer`}
                  >
                    <Avatar className="h-12 w-12">
                      {member.profile?.avatar_url ? (
                        <AvatarImage src={member.profile.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700">
                          {member.profile?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {member.profile?.display_name || member.profile?.username || 'Unbekannter Benutzer'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {member.role !== 'member' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            member.role === 'admin' 
                              ? 'bg-primary-500/20 text-primary-500' 
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {member.role === 'admin' ? 'Admin' : 'Moderator'}
                          </span>
                        )}
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Seit {new Date(member.joined_at).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {isAdmin && member.user_id !== profile?.id && (
                      <Button variant="ghost" size="sm" className="px-2">
                        <MoreHorizontal size={16} />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-8">
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Keine Mitglieder gefunden
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FeedLayout>
  );
};

export default GroupDetailPage;
