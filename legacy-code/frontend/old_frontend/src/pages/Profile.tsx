
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import type { Profile } from '@/hooks/useProfile';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';

import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileTabs from '@/components/Profile/ProfileTabs';
import ProfileLoader from '@/components/Profile/ProfileLoader';
import ProfileError from '@/components/Profile/ProfileError';
import MiningProfileStats from '@/components/Profile/MiningProfileStats';
import { FeedLayout } from '@/components/Feed/FeedLayout';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, fetchProfileByUsername } = useProfile();
  const { followUser, unfollowUser, isFollowing, getFollowStats } = useUserRelationships();
  const { miningStats, syncMiningState } = useMining();
  
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If no username is provided in the URL, redirect to the current user's profile
        if (!username && currentUserProfile?.username) {
          navigate(`/profile/${currentUserProfile.username}`, { replace: true });
          return;
        }
        
        // If there's no username in the URL and no current user, show an error
        if (!username) {
          setIsLoading(false);
          setError(new Error('Kein Benutzername angegeben'));
          return;
        }
        
        const profile = await fetchProfileByUsername(username);
        
        if (profile) {
          setProfileData(profile);
          setIsOwnProfile(currentUserProfile?.id === profile.id);
          
          if (currentUserProfile?.id && profile.id !== currentUserProfile.id) {
            const following = await isFollowing(profile.id);
            setUserIsFollowing(following);
          }
          
          const stats = await getFollowStats(profile.id);
          setFollowStats(stats);
          
          // Nur für das eigene Profil, Mining-Daten synchronisieren
          if (currentUserProfile?.id === profile.id && syncMiningState) {
            await syncMiningState();
          }
        } else {
          setError(new Error('Profil nicht gefunden'));
          toast.error('Profil konnte nicht gefunden werden');
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        toast.error('Fehler beim Laden des Profils');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [username, currentUserProfile, fetchProfileByUsername, isFollowing, getFollowStats, syncMiningState, navigate]);
  
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
      toast.error('Fehler beim Ändern des Folgestatus');
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
        <ProfileHeader 
          profile={profileData}
          isOwnProfile={isOwnProfile}
          isFollowing={userIsFollowing}
          followStats={followStats}
          onFollowToggle={handleFollowToggle}
          onEditProfile={() => navigate('/settings/profile')}
        />
        
        {isOwnProfile && miningStats && (
          <MiningProfileStats miningStats={miningStats} />
        )}
        
        <ProfileTabs 
          profile={profileData}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </FeedLayout>
  );
};

export default Profile;
