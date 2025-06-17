import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { ChevronLeft, MapPin, Calendar, Link as LinkIcon, Edit, UserPlus, UserCheck, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/ThemeProvider';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import PostCard from '@/components/Feed/PostCard';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  website: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface UserPost {
  id: string;
  content: string;
  media_url: string | null;
  created_at: string;
  user_id: string;
}

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { profile: currentUserProfile } = useProfile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!username,
  });

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['user-posts', userProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserPost[];
    },
    enabled: !!userProfile?.id && activeTab === 'posts',
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['is-following', currentUserProfile?.id, userProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile || !userProfile) return false;
      
      const { data, error } = await supabase
        .from('user_followers')
        .select('*')
        .eq('follower_id', currentUserProfile.id)
        .eq('following_id', userProfile.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!currentUserProfile?.id && !!userProfile?.id,
  });

  const followUserMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserProfile || !userProfile) throw new Error('Profile not found');
      
      const { data, error } = await supabase
        .from('user_followers')
        .insert({
          follower_id: currentUserProfile.id,
          following_id: userProfile.id
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', currentUserProfile?.id, userProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', username] });
      toast.success(`Du folgst jetzt ${userProfile?.display_name || userProfile?.username || 'diesem Benutzer'}`);
    },
    onError: (error) => {
      toast.error('Fehler beim Folgen. Bitte versuche es später erneut.');
    }
  });

  const unfollowUserMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserProfile || !userProfile) throw new Error('Profile not found');
      
      const { data, error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', currentUserProfile.id)
        .eq('following_id', userProfile.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', currentUserProfile?.id, userProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', username] });
      toast.success(`Du folgst ${userProfile?.display_name || userProfile?.username || 'diesem Benutzer'} nicht mehr`);
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
      toast.error('Fehler beim Entfolgen. Bitte versuche es später erneut.');
    }
  });

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUserMutation.mutate();
    } else {
      followUserMutation.mutate();
    }
  };

  if (isLoadingProfile) {
    return (
      <FeedLayout>
        <div className="animate-pulse space-y-6">
          <div className={`h-40 rounded-xl ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-4">
            <div className={`h-20 w-20 rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
            <div className="space-y-2">
              <div className={`h-6 w-40 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-24 rounded ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        </div>
      </FeedLayout>
    );
  }

  if (!userProfile) {
    return (
      <FeedLayout>
        <div className="text-center p-8">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Benutzer nicht gefunden
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Der angeforderte Benutzer existiert nicht oder wurde gelöscht.
          </p>
          <Button className="mt-4" onClick={() => navigate('/feed')}>
            Zurück zum Feed
          </Button>
        </div>
      </FeedLayout>
    );
  }

  const isOwnProfile = currentUserProfile?.id === userProfile.id;

  return (
    <FeedLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`mb-4 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => navigate('/feed')}
          >
            <ChevronLeft size={16} className="mr-1" /> Zurück
          </Button>
          
          <div 
            className="h-48 w-full rounded-xl bg-cover bg-center relative overflow-hidden" 
            style={{ 
              backgroundImage: userProfile.cover_url 
                ? `url(${userProfile.cover_url})` 
                : `linear-gradient(to right, ${theme === 'dark' ? '#374151, #1f2937' : '#e5e7eb, #d1d5db'})` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              {userProfile.avatar_url ? (
                <AvatarImage src={userProfile.avatar_url} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700 text-2xl">
                  {userProfile.display_name?.charAt(0) || userProfile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="md:mb-2">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {userProfile.display_name || userProfile.username}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                @{userProfile.username}
              </p>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 gap-2">
            {isOwnProfile ? (
              <Button variant="outline" className="gap-1">
                <Edit size={14} />
                <span>Profil bearbeiten</span>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="gap-1">
                  <MessageSquare size={14} />
                  <span>Nachricht</span>
                </Button>
                <Button 
                  variant={isFollowing ? "secondary" : "default"}
                  className="gap-1"
                  onClick={handleFollowToggle}
                  disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                >
                  {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  <span>{isFollowing ? 'Folgst du' : 'Folgen'}</span>
                </Button>
                <Button variant="ghost" className="px-2">
                  <MoreHorizontal size={16} />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {userProfile.bio && (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {userProfile.bio}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm">
            {userProfile.location && (
              <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <MapPin size={14} />
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.website && (
              <a 
                href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 ${theme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
              >
                <LinkIcon size={14} />
                <span>{userProfile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar size={14} />
              <span>Beigetreten {new Date(userProfile.created_at).toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <Link 
              to={`/profile/${userProfile.username}/following`}
              className={`font-medium ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'}`}
            >
              <span className="font-bold">{userProfile.following_count || 0}</span> Folgt
            </Link>
            <Link 
              to={`/profile/${userProfile.username}/followers`}
              className={`font-medium ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'}`}
            >
              <span className="font-bold">{userProfile.followers_count || 0}</span> Follower
            </Link>
          </div>
        </div>

        <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="posts">Beiträge</TabsTrigger>
            <TabsTrigger value="media">Medien</TabsTrigger>
            <TabsTrigger value="likes">Gefällt mir</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
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
            ) : userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-dark-100' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        {userProfile.avatar_url ? (
                          <AvatarImage src={userProfile.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700">
                            {userProfile.display_name?.charAt(0) || userProfile.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {userProfile.display_name || userProfile.username}
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
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Keine Beiträge</h3>
                <p className="text-sm">
                  {isOwnProfile 
                    ? 'Du hast noch keine Beiträge erstellt.' 
                    : `${userProfile.display_name || userProfile.username} hat noch keine Beiträge erstellt.`}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="media">
            <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium mb-2">Keine Medien</h3>
              <p className="text-sm">
                {isOwnProfile 
                  ? 'Du hast noch keine Medien geteilt.' 
                  : `${userProfile.display_name || userProfile.username} hat noch keine Medien geteilt.`}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="likes">
            <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-dark-100 text-gray-300' : 'bg-gray-50 text-gray-700'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium mb-2">Keine Likes</h3>
              <p className="text-sm">
                {isOwnProfile 
                  ? 'Du hast noch keine Beiträge geliked.' 
                  : `${userProfile.display_name || userProfile.username} hat noch keine Beiträge geliked.`}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FeedLayout>
  );
};

export default UserProfilePage;
