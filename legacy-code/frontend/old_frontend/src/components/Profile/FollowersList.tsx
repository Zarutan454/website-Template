
import React, { useState, useEffect } from 'react';
import { User, useFollowSystem } from '@/hooks/useFollowSystem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowersListProps {
  userId: string;
  limit?: number;
}

const FollowersList: React.FC<FollowersListProps> = ({ userId, limit = 5 }) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({});
  
  const { profile: currentUser } = useProfile();
  const { getFollowers, isFollowing, followUser, unfollowUser } = useFollowSystem();
  
  useEffect(() => {
    const loadFollowers = async () => {
      setIsLoading(true);
      try {
        const userFollowers = await getFollowers(userId, limit);
        setFollowers(userFollowers);
        
        // Initialisieren der Follow-Status für alle Follower
        if (currentUser?.id) {
          const statusMap: Record<string, boolean> = {};
          
          for (const user of userFollowers) {
            // Eigenes Profil überspringen
            if (user.id === currentUser.id) continue;
            statusMap[user.id] = await isFollowing(user.id);
          }
          
          setFollowStatus(statusMap);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      loadFollowers();
    }
  }, [userId, limit, getFollowers, currentUser?.id, isFollowing]);
  
  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUser?.id) return;
    
    setLoadingFollow(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      const isCurrentlyFollowing = followStatus[targetUserId];
      
      if (isCurrentlyFollowing) {
        await unfollowUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await followUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: true }));
      }
    } catch (error) {
    } finally {
      setLoadingFollow(prev => ({ ...prev, [targetUserId]: false }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    );
  }
  
  if (followers.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Noch keine Follower vorhanden.
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {followers.map(user => (
        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Link to={`/profile/${user.username}`} className="flex items-center flex-1">
            <Avatar className="h-10 w-10 mr-3">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                  {(user.display_name || user.username)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.display_name || user.username}
              </p>
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>
          </Link>
          
          {currentUser?.id && currentUser.id !== user.id && (
            <Button 
              size="sm" 
              variant={followStatus[user.id] ? "outline" : "default"}
              onClick={() => handleFollowToggle(user.id)}
              disabled={loadingFollow[user.id]}
            >
              {loadingFollow[user.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : followStatus[user.id] ? (
                <>
                  <UserCheck size={16} className="mr-1" />
                  Folgst du
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-1" />
                  Folgen
                </>
              )}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowersList;
