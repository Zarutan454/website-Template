import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useMining } from '@/hooks/useMining';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { interactionRepository } from '@/repositories/InteractionRepository';
import { userAPI, socialAPI, UserProfile as UserProfileType } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { Media } from '@/types/media';
import ProfileHeader from './ProfileHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Image, 
  Activity, 
  BarChart3, 
  Share2, 
  Settings,
  Loader2,
  UserPlus,
  UserMinus,
  MessageSquare,
  Heart,
  Trophy,
  Zap
} from 'lucide-react';

// Import neue Komponenten
import ProfilePhotos from './ProfilePhotos';
import ProfileActivity from './ProfileActivity';
import ProfileAnalytics from './ProfileAnalytics';
import ProfileSocialLinks from './ProfileSocialLinks';
import PhotoAlbumGrid from './Photos/PhotoAlbumGrid';
import { Post } from '@/types/posts';

interface ProfilePageProps {
  username?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username }) => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const targetUsername = username || urlUsername;
  
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followers, setFollowers] = useState<UserProfileType[]>([]);
  const [following, setFollowing] = useState<UserProfileType[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');

  const isOwnProfile = currentUser?.username === targetUsername;

  const fetchProfile = useCallback(async () => {
    if (!targetUsername) return;
    try {
      setLoading(true);
      setError(null);
      const profileData = await userAPI.getProfileByUsername(targetUsername);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Profil konnte nicht geladen werden');
      toast.error('Profil konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [targetUsername]);

  const fetchPosts = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setPostsLoading(true);
      // FIXED: Use correct parameters instead of object
      const postsData = await socialAPI.getPosts(1, 20);
      // Filter posts by author if needed
      const userPosts = postsData.results?.filter((post: Post) => post.author?.id === profile.id) || [];
      setPosts(userPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      toast.error('Beiträge konnten nicht geladen werden');
      setPosts([]); // Set empty array on error
    } finally {
      setPostsLoading(false);
    }
  }, [profile?.id]);

  const fetchFollowers = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      const followersData = await interactionRepository.getFollowers(profile.id);
      setFollowers(followersData);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  }, [profile?.id]);

  const fetchFollowing = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      const followingData = await interactionRepository.getFollowing(profile.id);
      setFollowing(followingData);
    } catch (err) {
      console.error('Error fetching following:', err);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchPosts();
      fetchFollowers();
      fetchFollowing();
    }
  }, [profile, fetchPosts, fetchFollowers, fetchFollowing]);

  const handleFollow = async () => {
    if (!isAuthenticated || !profile) return;
    
    try {
      await interactionRepository.followUser(profile.id);
      toast.success('Benutzer erfolgreich gefolgt');
      fetchFollowers(); // Refresh data
    } catch (err) {
      console.error('Error following user:', err);
      toast.error('Fehler beim Folgen des Benutzers');
    }
  };

  const handleUnfollow = async () => {
    if (!isAuthenticated || !profile) return;
    
    try {
      await interactionRepository.unfollowUser(profile.id);
      toast.success('Benutzer erfolgreich entfolgt');
      fetchFollowers(); // Refresh data
    } catch (err) {
      console.error('Error unfollowing user:', err);
      toast.error('Fehler beim Entfolgen des Benutzers');
    }
  };

  const openFollowersModal = () => {
    setModalType('followers');
    setShowFollowersModal(true);
  };

  const openFollowingModal = () => {
    setModalType('following');
    setShowFollowingModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Lade Profil...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error || 'Profil nicht gefunden'}</p>
            <Button onClick={fetchProfile} variant="outline">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        followersCount={followers.length}
        followingCount={following.length}
        onFollowersClick={openFollowersModal}
        onFollowingClick={openFollowingModal}
      />

      {/* Profile Content */}
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Beiträge
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Aktivitäten
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Freunde
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Beiträge ({posts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Lade Beiträge...</span>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {isOwnProfile ? 'Du hast noch keine Beiträge erstellt' : 'Keine Beiträge vorhanden'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Image className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{profile.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{post.content}</p>
                            {post.media_url && (
                              <img 
                                src={post.media_url} 
                                alt="Post media" 
                                className="mt-2 rounded-lg max-w-xs"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="mt-6">
            {/* Facebook-style sub-tabs for photos */}
            <Tabs defaultValue="your-photos" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="tagged">Fotos von dir</TabsTrigger>
                <TabsTrigger value="your-photos">Deine Fotos</TabsTrigger>
                <TabsTrigger value="albums">Alben</TabsTrigger>
              </TabsList>
              <TabsContent value="tagged">
                {/* TODO: Implement tagged photos view */}
                <div className="text-center py-8 text-muted-foreground">Feature in Arbeit: Fotos, in denen du markiert bist.</div>
              </TabsContent>
              <TabsContent value="your-photos">
                <ProfilePhotos userId={profile.id} isOwnProfile={isOwnProfile} />
              </TabsContent>
              <TabsContent value="albums">
                <PhotoAlbumGrid isOwnProfile={isOwnProfile} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <ProfileActivity userId={profile.id} isOwnProfile={isOwnProfile} />
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Freunde & Follower
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Followers */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Follower ({followers.length})</h3>
                      <Button variant="outline" size="sm" onClick={openFollowersModal}>
                        Alle anzeigen
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {followers.slice(0, 5).map((follower) => (
                        <div key={follower.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{follower.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Following */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Following ({following.length})</h3>
                      <Button variant="outline" size="sm" onClick={openFollowingModal}>
                        Alle anzeigen
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {following.slice(0, 5).map((followed) => (
                        <div key={followed.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{followed.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <ProfileAnalytics userId={profile.id} isOwnProfile={isOwnProfile} />
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="mt-6">
            <ProfileSocialLinks userId={profile.id} isOwnProfile={isOwnProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
