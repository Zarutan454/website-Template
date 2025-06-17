
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useProfile } from '@/hooks/useProfile';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { UserPlus, UserCheck, Link, MapPin, Calendar, ExternalLink, Trophy } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Profile } from '@/hooks/useProfile';
import ProfileCardAchievements from '@/components/Profile/ProfileCardAchievements';

interface ProfileCardProps {
  user: Profile;
  isCurrentUser?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, isCurrentUser = false }) => {
  const { profile: currentUserProfile } = useProfile();
  const { followUser, unfollowUser, isFollowing, getFollowStats, isProcessing } = useUserRelationships();
  const { achievements, isLoading: isLoadingAchievements } = useUserAchievements(user?.id);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const stats = await getFollowStats(user.id);
        setFollowStats(stats);
        
        if (currentUserProfile?.id && currentUserProfile.id !== user.id) {
          const following = await isFollowing(user.id);
          setUserIsFollowing(following);
        }
      }
    };
    
    fetchData();
  }, [user, currentUserProfile, getFollowStats, isFollowing]);
  
  const handleFollowToggle = async () => {
    if (!user?.id || isProcessing) return;
    
    const success = userIsFollowing 
      ? await unfollowUser(user.id)
      : await followUser(user.id);
      
    if (success) {
      setUserIsFollowing(!userIsFollowing);
      // Aktualisiere die Follower-Zahl
      const stats = await getFollowStats(user.id);
      setFollowStats(stats);
    }
  };
  
  const handleViewAllAchievements = () => {
    // Navigate to the achievements tab on the profile page
    window.location.href = `/feed/profile/${user?.username}?tab=achievements`;
  };
  
  return (
    <Card className="overflow-hidden border-gray-800">
      <div className="h-32 bg-gradient-to-r from-primary-900/50 to-secondary-900/50"></div>
      
      <CardHeader className="-mt-16 flex flex-col items-center">
        <Avatar className="h-24 w-24 border-4 border-background">
          <AvatarImage src={user?.avatar_url} alt={user?.display_name || user?.username} />
          <AvatarFallback className="bg-primary-700 text-white text-2xl">
            {(user?.display_name || user?.username || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">{user?.display_name || user?.username}</h2>
          <p className="text-sm text-gray-400">@{user?.username}</p>
        </div>
        
        {!isCurrentUser && currentUserProfile?.id && (
          <Button 
            className="mt-4"
            variant={userIsFollowing ? "outline" : "default"}
            disabled={isProcessing}
            onClick={handleFollowToggle}
          >
            {userIsFollowing ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Folgst du
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Folgen
              </>
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {user?.bio && (
          <p className="text-sm text-gray-300">{user.bio}</p>
        )}
        
        <div className="flex justify-center space-x-6 text-center">
          <div>
            <p className="text-lg font-bold">{followStats.followers_count}</p>
            <p className="text-xs text-gray-400">Follower</p>
          </div>
          
          <div>
            <p className="text-lg font-bold">{followStats.following_count}</p>
            <p className="text-xs text-gray-400">Folgt</p>
          </div>
          
          <div>
            <p className="text-lg font-bold">{user?.posts_count || 0}</p>
            <p className="text-xs text-gray-400">Beiträge</p>
          </div>
        </div>
        
        <Separator />
        
        <ProfileCardAchievements 
          achievements={achievements || []}
          isLoading={isLoadingAchievements}
          maxToShow={4}
          onViewAll={handleViewAllAchievements}
        />
        
        <Separator />
        
        <div className="space-y-2 text-sm">
          {user?.created_at && (
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <span>Beigetreten am {format(new Date(user.created_at), 'PPP', { locale: de })}</span>
            </div>
          )}
          
          {user?.website && (
            <div className="flex items-center">
              <Link className="mr-2 h-4 w-4 text-gray-400" />
              <a 
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            asChild
          >
            <RouterLink to={`/feed/profile/${user?.username}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Vollständiges Profil anzeigen
            </RouterLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
