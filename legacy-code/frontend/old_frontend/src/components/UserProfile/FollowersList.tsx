
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface FollowersListProps {
  userId: string;
  limit?: number;
}

const FollowersList: React.FC<FollowersListProps> = ({ userId, limit = 5 }) => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('follows')
          .select(`
            created_at,
            follower:follower_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('following_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        // Extrahiere die Follower aus den Ergebnissen
        const formattedFollowers = data.map(item => ({
          ...item.follower,
          followed_at: item.created_at
        }));
        
        setFollowers(formattedFollowers);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFollowers();
  }, [userId, limit]);
  
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
  
  if (followers.length === 0) {
    return (
      <Card className="bg-dark-100/50 border-gray-800">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Noch keine Follower</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {followers.map(follower => (
        <Link 
          key={follower.id} 
          to={`/feed/profile/${follower.username}`}
          className="flex items-center p-2 rounded-lg hover:bg-dark-300/50 transition-colors"
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={follower.avatar_url} alt={follower.display_name || follower.username} />
            <AvatarFallback className="bg-primary-700 text-white">
              {(follower.display_name || follower.username || "").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {follower.display_name || follower.username}
            </p>
            <p className="text-sm text-gray-400 truncate">
              @{follower.username}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FollowersList;
