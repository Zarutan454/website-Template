import React, { useState, useEffect, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useMining } from '@/hooks/useMining';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { interactionRepository } from '@/repositories/InteractionRepository';
import { postAPI, UserProfile, userAPI } from '@/lib/django-api-new';
import djangoApi from '@/lib/django-api-new';
import { toast } from 'sonner';
import ProfileHeader from './ProfileHeader';
import FollowersModal from './FollowersModal';
import { Button } from '@/components/ui/button';
import { Grid3X3, Clock, Zap, Coins } from 'lucide-react';
import ProfileLoader from './ProfileLoader';
import ProfileError from './ProfileError';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import UnifiedPostCard from '@/components/Feed/UnifiedPostCard';
import CreatePostBox from '@/components/Feed/CreatePostBox';
import ProfileTabNavigation, { ProfileTab } from './ProfileTabNavigation';
import { socialAPI } from '@/lib/django-api-new';

// Lazy load sidebar components for better performance
const LazyProfileAboutSection = lazy(() => import('./ProfileAboutSection'));
const LazyProfileMediaSection = lazy(() => import('./ProfileMediaSection'));
const LazyProfileFriendsSection = lazy(() => import('./ProfileFriendsSection'));
const LazyProfileActivitySection = lazy(() => import('./ProfileActivitySection'));
const LazyProfileMiningSection = lazy(() => import('./ProfileMiningSection'));

interface TimelineEvent {
  id: string;
  type: 'post' | 'achievement' | 'token' | 'comment' | 'follow';
  timestamp: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
}

interface PostData {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url: string;
    display_name: string;
  };
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

// Memoized components for performance
const MemoizedProfileHeader = memo(ProfileHeader);
const MemoizedProfileTabNavigation = memo(ProfileTabNavigation);
const MemoizedCreatePostBox = memo(CreatePostBox);
const MemoizedUnifiedPostCard = memo(UnifiedPostCard);
const MemoizedFollowersModal = memo(FollowersModal);

// Loading component for lazy-loaded sections
const SectionLoader: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-dark-300/30 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

const EnhancedProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUserProfile } = useAuth();
  const { followUser, unfollowUser, isFollowing, getFollowStats } = useUserRelationships();
  const { miningStats } = useMining();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const { achievements, stats, isLoading: isAchievementsLoading } = useUserAchievements(profileData?.id);

  const { media: postsMedia, isLoading: isPostsLoading, refreshMedia } = useProfileMedia(
    profileData?.id,
    'posts',
    isOwnProfile
  );

  // Listen for post updates and refresh posts
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newPostCreated' && e.newValue) {
        const postData = JSON.parse(e.newValue);
        // If this is the current user's profile, refresh posts
        if (profileData?.id && postData.authorId === profileData.id.toString()) {
          refreshMedia();
        }
        // Clear the flag
        localStorage.removeItem('newPostCreated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [profileData?.id, refreshMedia]);
  
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

  // Memoized handlers to prevent unnecessary re-renders
  const handleFollowToggle = useCallback(async () => {
    if (!profileData) return;
    
    try {
      if (userIsFollowing) {
        await unfollowUser(profileData.id);
        setUserIsFollowing(false);
        toast.success('Benutzer nicht mehr gefolgt');
      } else {
        await followUser(profileData.id);
        setUserIsFollowing(true);
        toast.success('Benutzer gefolgt');
      }
      
      // Refresh follow stats
      const stats = await getFollowStats(profileData.id);
      setFollowStats(stats);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Fehler beim Folgen/Entfolgen');
    }
  }, [profileData, userIsFollowing, followUser, unfollowUser, getFollowStats]);

  const handleLikePost = useCallback(async (postId: number): Promise<boolean> => {
    try {
      const success = await djangoApi.togglePostLike(postId);
      if (success) {
        // Optimistische UI-Updates ohne die Posts neu zu laden
        // Das verhindert das Problem mit der is_liked_by_user Information
        toast.success('Beitrag geliked!');
        return true;
      } else {
        toast.error('Fehler beim Liken des Beitrags');
        return false;
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Fehler beim Liken des Beitrags');
      return false;
    }
  }, []);

  const handleCommentPost = useCallback(async (postId: number, content: string) => {
    try {
      const result = await socialAPI.createComment(postId, { content });
      if (result) {
        toast.success('Kommentar erfolgreich erstellt!');
        refreshMedia();
        return result;
      } else {
        toast.error('Fehler beim Erstellen des Kommentars');
        return null;
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
      toast.error('Fehler beim Kommentieren');
      return null;
    }
  }, [refreshMedia]);

  const handleSharePost = useCallback(async (postId: number): Promise<boolean> => {
    try {
      await interactionRepository.sharePost(postId.toString());
      toast.success('Beitrag geteilt!');
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Fehler beim Teilen');
      return false;
    }
  }, []);

  const handleDeletePost = useCallback(async (postId: number): Promise<boolean> => {
    try {
      const response = await postAPI.deletePost(postId);
      if (response) {
        toast.success('Beitrag erfolgreich gelöscht');
        refreshMedia();
      }
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Fehler beim Löschen des Posts');
      return false;
    }
  }, [refreshMedia]);

  const handleGetComments = useCallback(async (postId: number) => {
    try {
      const comments = await socialAPI.getComments(postId);
      return comments || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }, []);

  const handleReportPost = useCallback(async (postId: number) => {
    try {
      // Implement report functionality
      toast.success('Beitrag gemeldet');
      return true;
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Fehler beim Melden');
      return false;
    }
  }, []);

  // Memoized data conversion
  const convertedPosts = useMemo(() => {
    if (!profileData || !postsMedia) return [];

    const getAvatarUrl = () => {
      if (!profileData?.avatar_url) return '';
      
      if (profileData.avatar_url.startsWith('http')) {
        return profileData.avatar_url;
      }
      
      return profileData.avatar_url.startsWith('/') 
        ? `http://localhost:8000${profileData.avatar_url}`
        : `http://localhost:8000/${profileData.avatar_url}`;
    };

    return postsMedia.map(item => ({
      id: parseInt(item.id.toString()),
      content: item.description || '',
      media_url: item.url || '',
      media_type: item.type || 'image',
      created_at: item.createdAt || new Date().toISOString(),
      author: {
        id: parseInt(profileData?.id?.toString() || '0'),
        username: profileData?.username || '',
        email: profileData?.email || '',
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        display_name: profileData?.display_name || profileData?.username || '',
        avatar_url: getAvatarUrl(),
        is_email_verified: profileData?.is_email_verified || false,
        is_active: profileData?.is_active || true,
        date_joined: profileData?.date_joined || '',
        last_login: profileData?.last_login || '',
        profile: {
          display_name: profileData?.display_name || profileData?.username || '',
          bio: profileData?.profile?.bio || '',
          avatar_url: getAvatarUrl(),
          location: '',
          website: '',
          twitter_handle: '',
          github_handle: '',
          linkedin_handle: '',
          created_at: profileData?.date_joined || '',
          updated_at: profileData?.last_login || ''
        }
      },
      // Use real interaction data from Media interface
      likes_count: item.like_count || 0,
      comments_count: item.comment_count || 0,
      shares_count: 0,
      is_liked: item.is_liked_by_user || item.is_liked || false,
      is_liked_by_user: item.is_liked_by_user || item.is_liked || false,
      is_bookmarked: item.is_bookmarked_by_user || item.is_bookmarked || false,
      updated_at: item.createdAt || new Date().toISOString()
    }));
  }, [profileData, postsMedia]);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      const completedAchievements = achievements
        .filter(achievement => achievement.is_completed && achievement.unlocked_at)
        .map(achievement => ({
          id: `achievement-${achievement.id}`,
          type: 'achievement' as const,
          timestamp: achievement.unlocked_at?.toString() || new Date().toISOString(),
          title: `Achievement unlocked: ${achievement.name}`,
          description: `Unlocked "${achievement.name}"`,
          targetId: achievement.id.toString(),
          targetType: 'achievement'
        }));
      
      setTimelineEvents(completedAchievements);
    }
  }, [achievements]);

  // Load profile data
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
        
        const profile = await userAPI.getProfileByUsername(targetUsername);
        
        if (profile) {
          setProfileData(profile);
          setIsOwnProfile(currentUserProfile?.id === profile.id);
          
          if (currentUserProfile?.id && profile.id !== currentUserProfile.id) {
            const following = await isFollowing(profile.id);
            setUserIsFollowing(following);
          }
          
          const stats = await getFollowStats(profile.id);
          setFollowStats(stats);
        } else {
          setError(new Error('Profil nicht gefunden'));
          toast.error('Profil konnte nicht gefunden werden');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast.error('Fehler beim Laden des Profils');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [username, currentUserProfile, isFollowing, getFollowStats]);
  
  if (isLoading) {
    return <ProfileLoader />;
  }

  if (error) {
    return <ProfileError error={error} onRetry={() => window.location.reload()} />;
  }

  if (!profileData) {
    return <ProfileError error={new Error('Profil nicht gefunden')} onRetry={() => window.location.reload()} />;
  }

  return (
    <FeedLayout hideRightSidebar={true}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <div className="bg-dark-200/60 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          <MemoizedProfileHeader 
            profile={{
              id: profileData.id.toString(),
              username: profileData.username,
              display_name: profileData.display_name || profileData.username,
              avatar_url: profileData.avatar_url,
              cover_url: profileData.cover_url || '',
              bio: profileData.profile?.bio || '',
              role_name: 'user',
              email: profileData.email,
              is_verified: profileData.is_email_verified,
              created_at: profileData.date_joined,
              updated_at: profileData.last_login
            }}
            isOwnProfile={isOwnProfile}
            isFollowing={userIsFollowing}
            followStats={followStats}
            onFollowToggle={handleFollowToggle}
            onEditProfile={() => navigate('/settings/profile')}
          />
        </div>

        {/* Tab Navigation - Enhanced Mobile Experience */}
        <div className="bg-dark-200/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-gray-700/50 shadow-lg sticky top-16 z-10">
          <MemoizedProfileTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Unified Content Area - Responsive Design */}
        <div className="space-y-4 sm:space-y-6">
          {/* Create Post Box (Own Profile Only) - Mobile Touch Optimized */}
          {isOwnProfile && activeTab === 'posts' && (
            <div className="bg-dark-200/60 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50">
              <MemoizedCreatePostBox 
                onCreatePost={async (postData) => {
                  try {
                    const result = await postAPI.createPost({
                      content: postData.content,
                      media_urls: postData.media_url ? [postData.media_url] : []
                    });
                    if (result) {
                      toast.success('Beitrag erfolgreich erstellt!');
                      refreshMedia();
                    }
                    return result;
                  } catch (error) {
                    console.error('Error creating post:', error);
                    toast.error('Fehler beim Erstellen des Beitrags');
                    return null;
                  }
                }}
                data-testid="create-post-box"
              />
            </div>
          )}

          {/* Posts Content - Mobile Touch Optimized */}
          {activeTab === 'posts' && (
            <div className="bg-dark-200/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <div className="p-4 sm:p-6">
                {isPostsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-dark-300/30 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-600 rounded"></div>
                          <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : convertedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {convertedPosts.map((post) => (
                      <div key={post.id} className="bg-dark-300/30 rounded-lg">
                        <MemoizedUnifiedPostCard
                          post={{
                            id: post.id,
                            content: post.content,
                            media_url: post.media_url,
                            media_type: post.media_type,
                            created_at: post.created_at,
                            author: post.author,
                            likes_count: post.likes_count,
                            comments_count: post.comments_count,
                            shares_count: post.shares_count,
                            is_liked: post.is_liked,
                            is_bookmarked: post.is_bookmarked,
                            updated_at: post.updated_at
                          }}
                          onLike={handleLikePost}
                          onComment={handleCommentPost}
                          onShare={handleSharePost}
                          onDelete={isOwnProfile ? handleDeletePost : undefined}
                          onGetComments={handleGetComments}
                          onReport={handleReportPost}
                          currentUser={currentUserProfile}
                          currentUserId={currentUserProfile?.id}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Grid3X3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">Keine Beiträge</h3>
                    <p className="text-gray-500 text-sm">
                      {isOwnProfile 
                        ? 'Erstelle deinen ersten Beitrag!' 
                        : 'Dieser Benutzer hat noch keine Beiträge erstellt.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Section - Unified for Mobile & Desktop */}
          {activeTab === 'about' && profileData && (
            <div className="bg-dark-200/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <Suspense fallback={<SectionLoader />}>
                <LazyProfileAboutSection profile={{
                  id: profileData.id,
                  username: profileData.username,
                  bio: profileData.profile?.bio || profileData.bio || '',
                  occupation: profileData.profile?.occupation || profileData.occupation || '',
                  company: profileData.profile?.company || profileData.company || '',
                  interests: profileData.profile?.interests || profileData.interests || [],
                  skills: profileData.profile?.skills || profileData.skills || [],
                  social_media_links: profileData.profile?.social_media_links || profileData.social_media_links || {},
                }} isLoading={isLoading} />
              </Suspense>
            </div>
          )}

          {/* Mining Section - Unified for Mobile & Desktop */}
          {activeTab === 'mining' && (
            <div className="bg-dark-200/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <Suspense fallback={<SectionLoader />}>
                <LazyProfileMiningSection 
                  userId={profileData.id.toString()} 
                  isOwnProfile={isOwnProfile} 
                />
              </Suspense>
            </div>
          )}

          {/* Token Section - Unified for Mobile & Desktop */}
          {activeTab === 'token' && (
            <div className="bg-dark-200/60 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50">
              <div className="text-center py-6 sm:py-8">
                <Coins className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Token Portfolio</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Token-Management wird bald verfügbar sein</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="bg-dark-300/50 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{stats?.earned_tokens || 0}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Total Tokens</div>
                  </div>
                  <div className="bg-dark-300/50 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{stats?.earned_points || 0}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Total Points</div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-dark-300/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Token Status</h4>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-400">Token-Simulation aktiv</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Friends Section - Unified for Mobile & Desktop */}
          {activeTab === 'friends' && profileData && (
            <div className="bg-dark-200/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <Suspense fallback={<SectionLoader />}>
                <LazyProfileFriendsSection 
                  userId={profileData.id.toString()} 
                  isOwnProfile={isOwnProfile} 
                />
              </Suspense>
            </div>
          )}

          {/* Media Section - Unified for Mobile & Desktop */}
          {activeTab === 'media' && profileData && (
            <div className="bg-dark-200/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <Suspense fallback={<SectionLoader />}>
                <LazyProfileMediaSection 
                  userId={profileData.id.toString()} 
                  isOwnProfile={isOwnProfile} 
                />
              </Suspense>
            </div>
          )}

          {/* Activity Section - Unified for Mobile & Desktop */}
          {activeTab === 'activity' && profileData && (
            <div className="bg-dark-200/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <Suspense fallback={<SectionLoader />}>
                <LazyProfileActivitySection 
                  userId={profileData.id.toString()} 
                  isOwnProfile={isOwnProfile} 
                />
              </Suspense>
            </div>
          )}
        </div>

        {/* Modals */}
        <MemoizedFollowersModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={profileData?.id?.toString() || ''}
          type="followers"
        />
        <MemoizedFollowersModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          userId={profileData?.id?.toString() || ''}
          type="following"
        />
      </div>
    </FeedLayout>
  );
};

export default EnhancedProfilePage;
