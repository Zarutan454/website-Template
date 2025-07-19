import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { Search, Users, UserPlus, Loader2 } from 'lucide-react';
import FollowButton from './FollowButton';

interface User {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  followed_at?: string;
}

interface FollowListsProps {
  userId: number;
  className?: string;
}

const FollowLists: React.FC<FollowListsProps> = ({
  userId,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFollowers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/users/${userId}/followers/`);
      setFollowers(response.data.followers || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Follower';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/users/${userId}/following/`);
      setFollowing(response.data.following || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Following';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else {
      fetchFollowing();
    }
  }, [userId, activeTab]);

  const handleFollowChange = (targetUserId: number, isFollowing: boolean) => {
    if (activeTab === 'following') {
      setFollowing(prev => 
        isFollowing 
          ? prev.filter(user => user.id !== targetUserId)
          : prev
      );
    }
  };

  const filteredUsers = (activeTab === 'followers' ? followers : following).filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const UserList = ({ users }: { users: User[] }) => (
    <div className="space-y-3">
      {users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>
            {activeTab === 'followers' 
              ? 'Noch keine Follower' 
              : 'Folgt noch niemandem'
            }
          </p>
        </div>
      ) : (
        users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={user.avatar_url || "/placeholder-avatar.jpg"} 
                  alt={user.username}
                />
                <AvatarFallback>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.display_name || user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
                {user.followed_at && (
                  <p className="text-xs text-muted-foreground">
                    Gefolgt seit {new Date(user.followed_at).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            </div>
            
            <FollowButton
              userId={user.id}
              onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
              size="sm"
              variant="outline"
            />
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Beziehungen</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Follower ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Folgt ({following.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`${activeTab === 'followers' ? 'Follower' : 'Following'} durchsuchen...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Lade...</span>
              </div>
            ) : (
              <TabsContent value="followers">
                <UserList users={filteredUsers} />
              </TabsContent>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Lade...</span>
              </div>
            ) : (
              <TabsContent value="following">
                <UserList users={filteredUsers} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FollowLists; 