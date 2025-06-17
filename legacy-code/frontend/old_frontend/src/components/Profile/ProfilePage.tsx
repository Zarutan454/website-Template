
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileLoader from './ProfileLoader';
import ProfileError from './ProfileError';
import MiningProfileStats from './MiningProfileStats';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { Profile } from '@/types/profile';

interface FollowStats {
  followers_count: number;
  following_count: number;
}

const ProfilePage: React.FC = () => {
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
  const [followStats, setFollowStats] = useState<FollowStats>({ 
    followers_count: 0, 
    following_count: 0 
  });

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const targetUsername = username || currentUserProfile?.username;
      
      if (!targetUsername) {
        throw new Error('Kein Benutzername angegeben');
      }
      
      const profile = await fetchProfileByUsername(targetUsername);
      
      if (!profile) {
        throw new Error('Profil nicht gefunden');
      }

      setProfileData(profile);
      setIsOwnProfile(currentUserProfile?.id === profile.id);
      
      if (currentUserProfile?.id && profile.id !== currentUserProfile.id) {
        const following = await isFollowing(profile.id);
        setUserIsFollowing(following);
      }
      
      const stats = await getFollowStats(profile.id);
      setFollowStats(stats);
      
      // Synchronisiere Mining-Daten nur für das eigene Profil
      if (currentUserProfile?.id === profile.id && syncMiningState) {
        await syncMiningState();
      }
    } catch (err: any) {
      setError(err);
      toast.error(err.message || 'Fehler beim Laden des Profils');
    } finally {
      setIsLoading(false);
    }
  }, [
    username, 
    currentUserProfile, 
    fetchProfileByUsername, 
    isFollowing, 
    getFollowStats, 
    syncMiningState
  ]);
  
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleFollowToggle = async () => {
    if (!profileData?.id) return;
    
    try {
      const action = userIsFollowing ? unfollowUser : followUser;
      const success = await action(profileData.id);
      
      if (success) {
        setUserIsFollowing(!userIsFollowing);
        setFollowStats(prev => ({
          ...prev,
          followers_count: userIsFollowing 
            ? Math.max(0, prev.followers_count - 1)
            : prev.followers_count + 1
        }));
        
        toast.success(
          userIsFollowing
            ? `Du folgst ${profileData.username} nicht mehr`
            : `Du folgst jetzt ${profileData.username}`
        );
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Fehler beim Ändern des Folgestatus');
    }
  };
  
  const handleRetry = useCallback(() => {
    loadProfileData();
  }, [loadProfileData]);

  if (isLoading) {
    return (
      <FeedLayout hideRightSidebar={true}>
        <div className="min-h-screen flex items-center justify-center">
          <ProfileLoader />
        </div>
      </FeedLayout>
    );
  }
  
  if (error || !profileData) {
    return (
      <FeedLayout hideRightSidebar={true}>
        <ProfileError error={error} onRetry={handleRetry} />
      </FeedLayout>
    );
  }
  
  return (
    <FeedLayout hideRightSidebar={true}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={profileData.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </FeedLayout>
  );
};

export default ProfilePage;
