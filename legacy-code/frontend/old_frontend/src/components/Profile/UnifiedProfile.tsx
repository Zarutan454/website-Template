import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { useProfileHighlights } from '@/hooks/useProfileHighlights';
import { Media } from '@/types/media';
import ProfileHeader from './ProfileHeader';
import ProfileStatsRow from './ProfileStatsRow';
import ProfileHighlights from './ProfileHighlights';
import FollowSuggestions from './FollowSuggestions';
import ProfileLoader from './ProfileLoader';
import ProfileTabContent from './ProfileTabContent';
import FollowersModal from './FollowersModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ImageIcon, Grid3X3, Bookmark, Heart } from 'lucide-react';
import { toast } from 'sonner';

const UnifiedProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, fetchProfileByUsername } = useProfile();
  const { 
    followUser, 
    unfollowUser, 
    isFollowing, 
    getFollowStats,
    isProcessing 
  } = useUserRelationships();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  
  const { media, isLoading: isLoadingMedia, refreshMedia } = useProfileMedia(
    profileData?.id, 
    activeTab as any, 
    isOwnProfile
  );
  
  const { 
    highlights, 
    isLoading: isLoadingHighlights, 
    createHighlight,
    deleteHighlight
  } = useProfileHighlights(profileData?.id);
  
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      
      try {
        const targetUsername = username || currentUserProfile?.username;
        
        if (!targetUsername) {
          setIsLoading(false);
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
        } else {
          toast.error('Profil nicht gefunden');
          navigate('/not-found');
        }
      } catch (error) {
        toast.error('Fehler beim Laden des Profils');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [username, currentUserProfile, fetchProfileByUsername, navigate, isFollowing, getFollowStats]);
  
  const handleFollowToggle = async () => {
    if (!profileData?.id || isProcessing) return;
    
    try {
      if (userIsFollowing) {
        const success = await unfollowUser(profileData.id);
        if (success) {
          setUserIsFollowing(false);
          setFollowStats(prev => ({
            ...prev,
            followers_count: Math.max(0, prev.followers_count - 1)
          }));
        }
      } else {
        const success = await followUser(profileData.id);
        if (success) {
          setUserIsFollowing(true);
          setFollowStats(prev => ({
            ...prev,
            followers_count: prev.followers_count + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  
  const handleMediaClick = (id: string) => {
    switch (activeTab) {
      case 'posts':
      case 'saved':
      case 'liked':
        navigate(`/post/${id}`);
        break;
      case 'collections':
        navigate(`/photos/album/${id}`);
        break;
    }
  };

  const handleFollowersClick = () => {
    setShowFollowersModal(true);
  };

  const handleFollowingClick = () => {
    setShowFollowingModal(true);
  };
  
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

  if (isLoading || !profileData) {
    return <ProfileLoader />;
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader 
        profile={profileData}
        isOwnProfile={isOwnProfile}
        isFollowing={userIsFollowing}
        isLoading={isLoading}
        followStats={followStats}
        onFollowToggle={handleFollowToggle}
        onEditProfile={() => navigate('/settings/profile')}
      />
      
      <ProfileStatsRow 
        followers={followStats.followers_count || 0}
        following={followStats.following_count || 0}
        posts={profileData.posts_count || 0}
        tokens={profileData.mined_tokens}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
      />
      
      <ProfileHighlights 
        highlights={highlights}
        isOwnProfile={isOwnProfile}
        isLoading={isLoadingHighlights}
        onAddHighlight={() => {
          const title = prompt('Titel des Highlights:');
          const coverUrl = prompt('URL des Cover-Bildes:');
          
          if (title && coverUrl) {
            createHighlight(title, coverUrl)
              .then(result => {
                if (result) {
                  toast.success('Highlight erstellt');
                } else {
                  toast.error('Fehler beim Erstellen des Highlights');
                }
              });
          }
        }}
        onViewHighlight={(id) => navigate(`/highlights/${id}`)}
      />
      
      {!isOwnProfile && !userIsFollowing && (
        <div className="py-4">
          <Button 
            className="w-full"
            onClick={handleFollowToggle}
            disabled={isProcessing}
          >
            Folgen
          </Button>
        </div>
      )}
      
      {isOwnProfile && <FollowSuggestions limit={5} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid3X3 size={16} />
            <span className="sr-only md:not-sr-only md:inline-block">Beiträge</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark size={16} />
            <span className="sr-only md:not-sr-only md:inline-block">Gespeichert</span>
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart size={16} />
            <span className="sr-only md:not-sr-only md:inline-block">Geliked</span>
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <ImageIcon size={16} />
            <span className="sr-only md:not-sr-only md:inline-block">Alben</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <ProfileTabContent
            activeTab="posts"
            media={convertMedia(media)}
            isLoadingMedia={isLoadingMedia}
            isOwnProfile={isOwnProfile}
            handleMediaClick={handleMediaClick}
          />
        </TabsContent>
        
        <TabsContent value="saved">
          <ProfileTabContent
            activeTab="saved"
            media={convertMedia(media)}
            isLoadingMedia={isLoadingMedia}
            isOwnProfile={isOwnProfile}
            handleMediaClick={handleMediaClick}
          />
        </TabsContent>
        
        <TabsContent value="liked">
          <ProfileTabContent
            activeTab="liked"
            media={convertMedia(media)}
            isLoadingMedia={isLoadingMedia}
            isOwnProfile={isOwnProfile}
            handleMediaClick={handleMediaClick}
          />
        </TabsContent>
        
        <TabsContent value="collections">
          <ProfileTabContent
            activeTab="collections"
            media={convertMedia(media)}
            isLoadingMedia={isLoadingMedia}
            isOwnProfile={isOwnProfile}
            handleMediaClick={handleMediaClick}
          />
        </TabsContent>
      </Tabs>

      {showFollowersModal && profileData && (
        <FollowersModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={profileData.id}
          type="followers"
        />
      )}

      {showFollowingModal && profileData && (
        <FollowersModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          userId={profileData.id}
          type="following"
        />
      )}
    </div>
  );
};

export default UnifiedProfile;
