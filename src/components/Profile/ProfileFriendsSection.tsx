import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useUserRelationships } from '@/hooks/useUserRelationships';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Calendar,
  MapPin,
  Star,
  UserCheck,
  Clock,
  Eye,
  Shield
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  follower_count?: number;
  following_count?: number;
  mutual_friends_count?: number;
  is_following?: boolean;
  is_followed_by?: boolean;
  last_active?: string;
  created_at?: string;
  is_verified?: boolean;
  is_online?: boolean;
}

interface ProfileFriendsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const ProfileFriendsSection: React.FC<ProfileFriendsSectionProps> = ({ userId, isOwnProfile }) => {
  const { followUser, unfollowUser, isFollowing, getFollowStats } = useUserRelationships();
  
  // State Management
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'mutual'>('following');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'popular'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [stats, setStats] = useState({
    followers_count: 0,
    following_count: 0,
    mutual_friends_count: 0
  });

  // Load real data instead of mock data
  useEffect(() => {
    const loadFriendsData = async () => {
      setIsLoading(true);
      try {
        // TODO: Implement real API calls for friends/followers
        // For now, show empty state
        setFriends([]);
        setStats({
          followers_count: 0,
          following_count: 0,
          mutual_friends_count: 0
        });
      } catch (error) {
        console.error('Error loading friends data:', error);
        toast.error('Fehler beim Laden der Freunde');
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendsData();
  }, [userId]);

  // Filtered and sorted friends
  const filteredFriends = useMemo(() => {
    if (!friends) return [];
    
    let filtered = friends;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(friend => 
        friend.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.last_active || b.created_at || '').getTime() - 
                 new Date(a.last_active || a.created_at || '').getTime();
        case 'alphabetical':
          return (a.display_name || a.username || '').localeCompare(b.display_name || b.username || '');
        case 'popular':
          return (b.follower_count || 0) - (a.follower_count || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [friends, searchTerm, sortBy]);

  // Event handlers
  const handleFollowToggle = async (friendId: string) => {
    try {
      const friend = friends.find(f => f.id === friendId);
      if (!friend) return;

      if (friend.is_following) {
        await unfollowUser(parseInt(friendId));
        setFriends(prev => prev.map(f => 
          f.id === friendId ? { ...f, is_following: false } : f
        ));
        toast.success(`Du folgst ${friend.display_name} nicht mehr`);
      } else {
        await followUser(parseInt(friendId));
        setFriends(prev => prev.map(f => 
          f.id === friendId ? { ...f, is_following: true } : f
        ));
        toast.success(`Du folgst jetzt ${friend.display_name}`);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Fehler beim Ändern des Folgestatus');
    }
  };

  const handleMessage = (friendId: string) => {
    // TODO: Implement messaging functionality
    toast.info('Nachrichten-Funktion wird bald verfügbar sein');
  };

  const handleViewProfile = (friendId: string) => {
    // TODO: Navigate to friend's profile
    toast.info('Profil-Ansicht wird bald verfügbar sein');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Freunde & Follower
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Freunde & Follower
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-dark-300/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.following_count}</div>
              <div className="text-sm text-gray-400">Folgt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.followers_count}</div>
              <div className="text-sm text-gray-400">Follower</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.mutual_friends_count}</div>
              <div className="text-sm text-gray-400">Gemeinsam</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'following' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('following')}
              >
                Folgt
              </Button>
              <Button
                variant={activeTab === 'followers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('followers')}
              >
                Follower
              </Button>
              <Button
                variant={activeTab === 'mutual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('mutual')}
              >
                Gemeinsam
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'recent' | 'alphabetical' | 'popular') => setSortBy(value)}>
                <SelectTrigger className="w-32" aria-label="Sortierung">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Neueste</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="popular">Beliebt</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Freunde suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Friends List */}
          <div className="space-y-4">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'following' ? 'Keine gefolgten Benutzer' :
                   activeTab === 'followers' ? 'Keine Follower' :
                   'Keine gemeinsamen Freunde'}
                </h3>
                <p className="text-gray-500">
                  {isOwnProfile 
                    ? 'Beginne damit, andere Benutzer zu folgen!' 
                    : 'Dieser Benutzer hat noch keine Verbindungen.'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-3 bg-dark-300/30 rounded-lg hover:bg-dark-300/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar_url} alt={friend.display_name} />
                      <AvatarFallback>
                        {friend.display_name?.charAt(0) || friend.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">
                          {friend.display_name || friend.username}
                        </h4>
                        {friend.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Verifiziert
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        @{friend.username}
                      </p>
                      {friend.bio && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {friend.bio}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMessage(friend.id)}
                        className="h-8 w-8 p-0"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProfile(friend.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isOwnProfile && (
                        <Button
                          variant={friend.is_following ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowToggle(friend.id)}
                          className="h-8 px-3"
                        >
                          {friend.is_following ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileFriendsSection; 