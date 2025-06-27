import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useMiningService } from '@/hooks/mining/useMiningService';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { toast } from 'sonner';
import { Media } from '@/types/media';
import ProfileHeader from './ProfileHeader';
import ProfileAchievements from './ProfileAchievements';
import ProfileTimeline from './ProfileTimeline';
import EnhancedMediaGallery from './EnhancedMediaGallery';
import ProfileCalendar from './ProfileCalendar';
import FollowersModal from './FollowersModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3, Clock, Trophy, BarChart3, Calendar, Users, UserPlus, Bookmark } from 'lucide-react';
import ProfileLoader from './ProfileLoader';
import ProfileError from './ProfileError';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import UnifiedPostCard from '@/components/Feed/UnifiedPostCard';
import djangoApi from '@/lib/django-api-new';
import { useUserPhotos } from '@/hooks/useUserPhotos';
import { useUserVideos } from '@/hooks/useUserVideos';
import { useUserAlbums } from '@/hooks/useUserAlbums';
import { Post } from '@/types/post';
import { UserProfile } from '@/types/user';

interface TimelineEvent {
  id: string;
  type: 'post' | 'achievement' | 'token' | 'comment' | 'follow';
  timestamp: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
}

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

const UnifiedProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, fetchProfileByUsername } = useProfile();
  const { followUser, unfollowUser, isFollowing, getFollowStats } = useUserRelationships();
  const { isMining } = useMiningService();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });
  const [activeTab, setActiveTab] = useState('media');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  const { achievements, isLoading: isAchievementsLoading } = useUserAchievements(profileData?.id);

  const { media: postsMedia, isLoading: isPostsLoading } = useProfileMedia(
    profileData?.id,
    'posts',
    isOwnProfile
  );
  
  const { media: savedMedia, isLoading: isSavedLoading } = useProfileMedia(
    profileData?.id,
    'saved',
    isOwnProfile
  );
  
  const { media: likedMedia, isLoading: isLikedLoading } = useProfileMedia(
    profileData?.id,
    'liked',
    isOwnProfile
  );
  
  const { media: collectionsMedia, isLoading: isCollectionsLoading } = useProfileMedia(
    profileData?.id,
    'collections',
    isOwnProfile
  );

  const convertMedia = (media: any[]): Media[] => {
    return media.map(item => ({
      id: item.id,
      url: item.url || '',
      type: item.type || 'image',
      title: item.title,
      description: item.description,
      createdAt: item.createdAt || item.created_at,
      authorId: item.authorId
    }));
  };

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      const completedAchievements = achievements
        .filter(achievement => achievement.completed && achievement.completedAt)
        .map(achievement => ({
          id: `achievement-${achievement.id}`,
          type: 'achievement' as const,
          timestamp: achievement.completedAt?.toString() || new Date().toISOString(),
          title: `Achievement freigeschaltet: ${achievement.title || achievement.achievement?.title || 'Erfolg'}`,
          description: `Hat das Achievement "${achievement.title || achievement.achievement?.title || 'Erfolg'}" freigeschaltet`,
          targetId: achievement.id,
          targetType: 'achievement'
        }));
      
      const tokenEvents = [
        {
          id: '3',
          type: 'token' as const,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          title: '50 Token gemined',
          description: 'Hat 50 Token durch Mining verdient',
          targetId: '789',
          targetType: 'token'
        }
      ];
      
      setTimelineEvents([...completedAchievements, ...tokenEvents]);
    }
  }, [achievements]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const targetUsername = username || currentUserProfile?.username;
        
        if (!targetUsername) {
          setIsLoading(false);
          setError(new Error('Kein Benutzername angegeben'));
          return;
        }
        
        const profile = await fetchProfileByUsername(targetUsername);
        
        if (profile) {
          setProfileData(profile);
          setIsOwnProfile(currentUserProfile?.id === profile.id);
          
          if (currentUserProfile?.id && profile.id !== currentUserProfile.id) {
            const following = await isFollowing(profile.id);
            setUserIsFollowing(following);
          }
          
          const stats = await getFollowStats(profile.id);
          setFollowStats(stats);
          
          // Load bookmarks if it's own profile or if user has permission
          if (currentUserProfile?.id === profile.id) {
            await loadBookmarks(profile.id);
          }
          
          // TODO: Load user posts when Django API is ready
          // const posts = await fetchUserPosts(profile.id);
          // setUserPosts(posts);
        } else {
          setError(new Error('Profil nicht gefunden'));
          toast.error('Profil konnte nicht gefunden werden');
        }
      } catch (err: unknown) {
        console.error("Failed to fetch profile:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [username, currentUserProfile, fetchProfileByUsername, isFollowing, getFollowStats]);
  
  const handleFollowToggle = async () => {
    if (!profileData?.id) return;
    
    try {
      if (userIsFollowing) {
        const success = await unfollowUser(profileData.id);
        if (success) {
          setUserIsFollowing(false);
          setFollowStats(prev => ({
            ...prev,
            followers_count: Math.max(0, prev.followers_count - 1)
          }));
          toast.success(`Du folgst ${profileData.username} nicht mehr`);
        }
      } else {
        const success = await followUser(profileData.id);
        if (success) {
          setUserIsFollowing(true);
          setFollowStats(prev => ({
            ...prev,
            followers_count: prev.followers_count + 1
          }));
          toast.success(`Du folgst jetzt ${profileData.username}`);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to toggle follow:', err);
      toast.error('Aktion fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
  };
  
  const handleMediaClick = (id: string, type: 'post' | 'saved' | 'liked' | 'collection') => {
    console.log(`Clicked ${type} media with ID: ${id}`);
    switch (type) {
      case 'post':
        navigate(`/post/${id}`);
        break;
      case 'collection':
        navigate(`/collection/${id}`);
        break;
      default:
        // Handle other media types
        break;
    }
  };

  const loadBookmarks = async (userId: string) => {
    setIsLoadingBookmarks(true);
    try {
      const response = await djangoApi.getUserBookmarks(userId);
      if (response && response.data) {
        setBookmarkedPosts(response.data);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast.error('Fehler beim Laden der gespeicherten Beiträge');
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  if (isLoading) {
    return (
      <FeedLayout>
        <ProfileLoader />
      </FeedLayout>
    );
  }

  if (error) {
    return (
      <FeedLayout>
        <ProfileError error={error} />
      </FeedLayout>
    );
  }

  if (!profileData) {
    return (
      <FeedLayout>
        <div className="text-center p-8">
          <h2 className="text-xl font-bold">Benutzer nicht gefunden</h2>
          <p className="mt-2 text-gray-500">
            Der angeforderte Benutzer existiert nicht oder wurde gelöscht.
          </p>
          <Button className="mt-4" onClick={() => navigate('/feed')}>
            Zurück zum Feed
          </Button>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="space-y-6">
        <ProfileHeader
          profile={profileData}
          isOwnProfile={isOwnProfile}
          isFollowing={userIsFollowing}
          followStats={followStats}
          onFollowToggle={handleFollowToggle}
          onFollowersClick={() => setShowFollowersModal(true)}
          onFollowingClick={() => setShowFollowingModal(true)}
          isMining={isMining}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Medien
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Beiträge
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Gespeichert
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Erfolge
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Kalender
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Follower
            </TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4">
            <EnhancedMediaGallery
              postsMedia={convertMedia(postsMedia)}
              savedMedia={convertMedia(savedMedia)}
              likedMedia={convertMedia(likedMedia)}
              collectionsMedia={convertMedia(collectionsMedia)}
              onMediaClick={handleMediaClick}
              isLoading={isPostsLoading || isSavedLoading || isLikedLoading || isCollectionsLoading}
            />
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <UnifiedPostCard
                    key={post.id}
                    post={post}
                    onLike={async () => true}
                    onDelete={async () => true}
                    onComment={async () => null}
                    onGetComments={async () => []}
                    onShare={async () => true}
                    currentUserId={currentUserProfile?.id}
                    currentUser={currentUserProfile}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Noch keine Beiträge vorhanden</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {isLoadingBookmarks ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Lade gespeicherte Beiträge...</p>
              </Card>
            ) : bookmarkedPosts.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedPosts.map((post) => (
                  <UnifiedPostCard
                    key={post.id}
                    post={post}
                    onLike={async () => true}
                    onDelete={async () => true}
                    onComment={async () => null}
                    onGetComments={async () => []}
                    onShare={async () => true}
                    currentUserId={currentUserProfile?.id}
                    currentUser={currentUserProfile}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine gespeicherten Beiträge</h3>
                <p className="text-gray-500">
                  {isOwnProfile 
                    ? 'Du hast noch keine Beiträge gespeichert. Klicke auf das Lesezeichen-Symbol bei einem Beitrag, um ihn zu speichern.'
                    : 'Dieser Benutzer hat noch keine Beiträge gespeichert.'
                  }
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <ProfileAchievements
              achievements={achievements}
              isLoading={isAchievementsLoading}
              isOwnProfile={isOwnProfile}
            />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <ProfileTimeline events={timelineEvents} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <ProfileCalendar profileId={profileData.id} />
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Follower</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFollowersModal(true)}
                  >
                    Alle anzeigen
                  </Button>
                </div>
                <p className="text-2xl font-bold">{followStats.followers_count}</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Folgt</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFollowingModal(true)}
                  >
                    Alle anzeigen
                  </Button>
                </div>
                <p className="text-2xl font-bold">{followStats.following_count}</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {showFollowersModal && (
          <FollowersModal
            profileId={profileData.id}
            type="followers"
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
          />
        )}

        {showFollowingModal && (
          <FollowersModal
            profileId={profileData.id}
            type="following"
            isOpen={showFollowingModal}
            onClose={() => setShowFollowingModal(false)}
          />
        )}
      </div>
    </FeedLayout>
  );
};

export default UnifiedProfilePage; 
