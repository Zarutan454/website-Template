
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useMining } from '@/hooks/useMining';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { toast } from 'sonner';
import { Media } from '@/types/media';

import EnhancedProfileHeader from './EnhancedProfileHeader';
import ProfileAchievements from './ProfileAchievements';
import ProfileTimeline from './ProfileTimeline';
import EnhancedMediaGallery from './EnhancedMediaGallery';
import ProfileCalendar from './ProfileCalendar';
import FollowersModal from './FollowersModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3, Clock, Trophy, BarChart3, Calendar } from 'lucide-react';
import ProfileLoader from './ProfileLoader';
import ProfileError from './ProfileError';
import { FeedLayout } from '@/components/Feed/FeedLayout';

interface TimelineEvent {
  id: string;
  type: 'post' | 'achievement' | 'token' | 'comment' | 'follow';
  timestamp: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
}

const EnhancedProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, fetchProfileByUsername } = useProfile();
  const { followUser, unfollowUser, isFollowing, getFollowStats } = useUserRelationships();
  const { miningStats, syncMiningState } = useMining();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });
  const [activeTab, setActiveTab] = useState('media');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

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
          
          if (currentUserProfile?.id === profile.id && syncMiningState) {
            await syncMiningState();
          }
        } else {
          setError(new Error('Profil nicht gefunden'));
          toast.error('Profil konnte nicht gefunden werden');
        }
      } catch (err: any) {
        setError(err);
        toast.error('Fehler beim Laden des Profils');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [username, currentUserProfile, fetchProfileByUsername, isFollowing, getFollowStats, syncMiningState]);
  
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
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Fehler beim Ändern des Folgestatus');
    }
  };
  
  const handleMediaClick = (id: string, type: 'post' | 'saved' | 'liked' | 'collection') => {
    console.log(`Clicked ${type} media with ID: ${id}`);
    switch (type) {
      case 'post':
      case 'saved':
      case 'liked':
        navigate(`/post/${id}`);
        break;
      case 'collection':
        navigate(`/photos/album/${id}`);
        break;
    }
  };
  
  if (isLoading) {
    return (
      <FeedLayout hideRightSidebar={true}>
        <ProfileLoader />
      </FeedLayout>
    );
  }
  
  if (error || !profileData) {
    return (
      <FeedLayout hideRightSidebar={true}>
        <ProfileError error={error} onRetry={() => navigate(0)} />
      </FeedLayout>
    );
  }
  
  return (
    <FeedLayout hideRightSidebar={true}>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <EnhancedProfileHeader 
          profile={profileData}
          isOwnProfile={isOwnProfile}
          isFollowing={userIsFollowing}
          followStats={followStats}
          onFollowToggle={handleFollowToggle}
          onEditProfile={() => navigate('/settings/profile')}
          onMessage={() => toast.info('Nachrichtenfunktion kommt bald')}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Profil-URL in die Zwischenablage kopiert');
          }}
          onFollowersClick={() => setShowFollowersModal(true)}
          onFollowingClick={() => setShowFollowingModal(true)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ProfileAchievements 
              achievements={achievements}
              isLoading={isAchievementsLoading}
              maxItems={5}
              showCompleted={true}
              onViewAllClick={() => setActiveTab('timeline')}
            />
            
            {isOwnProfile && miningStats && (
              <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Mining-Statistiken
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token:</span>
                    <span className="font-medium">{miningStats.total_tokens_earned || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tägliche Rate:</span>
                    <span className="font-medium">{(miningStats.mining_rate || 0) * 60}/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Streak:</span>
                    <span className="font-medium">{miningStats.streak_days || 0} Tage</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Grid3X3 size={16} />
                  <span>Medien</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Aktivitäten</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Kalender</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="media" className="space-y-4">
                <EnhancedMediaGallery 
                  posts={convertMedia(postsMedia || [])}
                  saved={convertMedia(savedMedia || [])}
                  liked={convertMedia(likedMedia || [])}
                  collections={convertMedia(collectionsMedia || [])}
                  isLoading={isPostsLoading || isSavedLoading || isLikedLoading || isCollectionsLoading}
                  isOwnProfile={isOwnProfile}
                  onMediaClick={handleMediaClick}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="space-y-4">
                <ProfileTimeline 
                  userId={profileData.id}
                  events={timelineEvents}
                  achievements={achievements}
                  isLoading={isLoading || isAchievementsLoading}
                  isOwnProfile={isOwnProfile}
                  onEventClick={(event) => console.log('Event clicked', event)}
                />
              </TabsContent>
              
              <TabsContent value="calendar" className="space-y-4">
                <ProfileCalendar 
                  userId={profileData.id} 
                  isOwnProfile={isOwnProfile}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Follower/Following Modals */}
        {showFollowersModal && (
          <FollowersModal
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
            userId={profileData.id}
            type="followers"
          />
        )}
        
        {showFollowingModal && (
          <FollowersModal
            isOpen={showFollowingModal}
            onClose={() => setShowFollowingModal(false)}
            userId={profileData.id}
            type="following"
          />
        )}
      </div>
    </FeedLayout>
  );
};

export default EnhancedProfilePage;
