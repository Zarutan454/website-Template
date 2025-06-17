
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { UserCheck, UserMinus } from 'lucide-react';

interface FollowingListProps {
  userId: string;
  limit?: number;
  showFollowButtons?: boolean;
}

const FollowingList: React.FC<FollowingListProps> = ({ 
  userId, 
  limit = 5,
  showFollowButtons = false
}) => {
  const { profile: currentUserProfile } = useProfile();
  const { unfollowUser } = useUserRelationships();
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isCurrentUser = currentUserProfile?.id === userId;
  
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('follows')
          .select(`
            created_at,
            following:following_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('follower_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        // Extrahiere die Following-Benutzer aus den Ergebnissen
        const formattedFollowing = data.map(item => ({
          ...item.following,
          followed_at: item.created_at
        }));
        
        setFollowing(formattedFollowing);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFollowing();
  }, [userId, limit]);
  
  const handleUnfollow = async (followingId: string) => {
    if (!currentUserProfile?.id) return;
    
    const success = await unfollowUser(followingId);
    if (success) {
      // Aktualisiere die Liste
      setFollowing(following.filter(user => user.id !== followingId));
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (following.length === 0) {
    return (
      <Card className="bg-dark-100/50 border-gray-800">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Folgt noch niemandem</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {following.map(user => (
        <div 
          key={user.id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-300/50 transition-colors"
        >
          <Link 
            to={`/feed/profile/${user.username}`}
            className="flex items-center flex-1"
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
              <AvatarFallback className="bg-primary-700 text-white">
                {(user.display_name || user.username || "").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {user.display_name || user.username}
              </p>
              <p className="text-sm text-gray-400 truncate">
                @{user.username}
              </p>
            </div>
          </Link>
          
          {showFollowButtons && isCurrentUser && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleUnfollow(user.id)}
              className="ml-2 text-gray-400 hover:text-white hover:bg-red-900/30"
            >
              <UserMinus className="h-4 w-4" />
              <span className="sr-only">Entfolgen</span>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowingList;
