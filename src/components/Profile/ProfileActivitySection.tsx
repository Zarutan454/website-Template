import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Heart, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  Trophy, 
  Zap, 
  Coins, 
  Camera, 
  Edit, 
  Calendar, 
  Clock, 
  Filter,
  Search,
  TrendingUp,
  Star,
  Gift,
  Target,
  Bookmark,
  Eye,
  ThumbsUp,
  Users,
  Image as ImageIcon,
  Video,
  FileText,
  Award
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'post' | 'like' | 'comment' | 'follow' | 'achievement' | 'mining' | 'token' | 'media' | 'share' | 'bookmark';
  timestamp: string;
  title: string;
  description: string;
  metadata?: {
    targetId?: string;
    targetType?: string;
    targetTitle?: string;
    targetUrl?: string;
    targetUser?: {
      id: string;
      username: string;
      display_name: string;
      avatar_url?: string;
    };
    amount?: number;
    currency?: string;
    media_url?: string;
    media_type?: string;
  };
  points?: number;
  is_public?: boolean;
  interaction_count?: number;
}

interface ProfileActivitySectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const ProfileActivitySection: React.FC<ProfileActivitySectionProps> = ({ userId, isOwnProfile }) => {
  // State Management
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'social' | 'achievements' | 'mining' | 'tokens'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrivate, setShowPrivate] = useState(false);

  // Mock data for demonstration
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'post',
      timestamp: '2024-01-15T10:30:00Z',
      title: 'Neuen Beitrag erstellt',
      description: 'Hat einen neuen Beitrag über Blockchain-Technologie geteilt',
      metadata: {
        targetId: 'post-123',
        targetType: 'post',
        targetTitle: 'Die Zukunft der Blockchain-Technologie',
        targetUrl: '/post/123'
      },
      points: 5,
      is_public: true,
      interaction_count: 12
    },
    {
      id: '2',
      type: 'achievement',
      timestamp: '2024-01-15T09:15:00Z',
      title: 'Erfolg freigeschaltet',
      description: 'Hat das "Early Adopter" Achievement erhalten',
      metadata: {
        targetId: 'achievement-early-adopter',
        targetType: 'achievement',
        targetTitle: 'Early Adopter',
        targetUrl: '/achievements/early-adopter'
      },
      points: 100,
      is_public: true,
      interaction_count: 8
    },
    {
      id: '3',
      type: 'mining',
      timestamp: '2024-01-15T08:45:00Z',
      title: 'Mining-Session beendet',
      description: 'Hat 2.5 BSN-Token durch Mining erhalten',
      metadata: {
        amount: 2.5,
        currency: 'BSN',
        targetType: 'mining'
      },
      points: 25,
      is_public: true,
      interaction_count: 3
    },
    {
      id: '4',
      type: 'follow',
      timestamp: '2024-01-14T18:20:00Z',
      title: 'Neuer Follower',
      description: 'Folgt jetzt @alice_dev',
      metadata: {
        targetUser: {
          id: 'user-456',
          username: 'alice_dev',
          display_name: 'Alice Developer',
          avatar_url: '/api/placeholder/40/40'
        }
      },
      points: 2,
      is_public: true,
      interaction_count: 1
    },
    {
      id: '5',
      type: 'like',
      timestamp: '2024-01-14T17:10:00Z',
      title: 'Beitrag geliked',
      description: 'Hat einen Beitrag von @bob_crypto geliked',
      metadata: {
        targetId: 'post-456',
        targetType: 'post',
        targetTitle: 'Crypto Market Analysis',
        targetUser: {
          id: 'user-789',
          username: 'bob_crypto',
          display_name: 'Bob Crypto',
          avatar_url: '/api/placeholder/40/40'
        }
      },
      points: 1,
      is_public: false,
      interaction_count: 0
    },
    {
      id: '6',
      type: 'media',
      timestamp: '2024-01-14T16:30:00Z',
      title: 'Medien hochgeladen',
      description: 'Hat 3 neue Bilder hochgeladen',
      metadata: {
        targetType: 'media',
        media_url: '/api/placeholder/300/200',
        media_type: 'image'
      },
      points: 3,
      is_public: true,
      interaction_count: 15
    },
    {
      id: '7',
      type: 'token',
      timestamp: '2024-01-14T15:45:00Z',
      title: 'Token-Transfer',
      description: 'Hat 10 BSN-Token an @charlie_mining gesendet',
      metadata: {
        amount: 10,
        currency: 'BSN',
        targetUser: {
          id: 'user-101',
          username: 'charlie_mining',
          display_name: 'Charlie Mining',
          avatar_url: '/api/placeholder/40/40'
        }
      },
      points: 0,
      is_public: false,
      interaction_count: 0
    },
    {
      id: '8',
      type: 'comment',
      timestamp: '2024-01-14T14:20:00Z',
      title: 'Kommentar erstellt',
      description: 'Hat einen Kommentar zu "DeFi Trends 2024" hinzugefügt',
      metadata: {
        targetId: 'post-789',
        targetType: 'post',
        targetTitle: 'DeFi Trends 2024',
        targetUrl: '/post/789'
      },
      points: 2,
      is_public: true,
      interaction_count: 5
    }
  ];

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActivities(mockActivities);
      } catch (error) {
        toast.error('Fehler beim Laden der Aktivitäten');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [userId]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by type
    if (filterType !== 'all') {
      switch (filterType) {
        case 'posts':
          filtered = filtered.filter(a => ['post', 'comment', 'share'].includes(a.type));
          break;
        case 'social':
          filtered = filtered.filter(a => ['like', 'follow', 'share'].includes(a.type));
          break;
        case 'achievements':
          filtered = filtered.filter(a => a.type === 'achievement');
          break;
        case 'mining':
          filtered = filtered.filter(a => a.type === 'mining');
          break;
        case 'tokens':
          filtered = filtered.filter(a => a.type === 'token');
          break;
      }
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(a => new Date(a.timestamp) >= cutoff);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by privacy (only for own profile)
    if (!isOwnProfile || !showPrivate) {
      filtered = filtered.filter(a => a.is_public);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, filterType, timeRange, searchTerm, showPrivate, isOwnProfile]);

  // Get activity icon
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post': return <FileText className="w-4 h-4" />;
      case 'like': return <Heart className="w-4 h-4" />;
      case 'comment': return <MessageCircle className="w-4 h-4" />;
      case 'follow': return <UserPlus className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'mining': return <Zap className="w-4 h-4" />;
      case 'token': return <Coins className="w-4 h-4" />;
      case 'media': return <Camera className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      case 'bookmark': return <Bookmark className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Get activity color
  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post': return 'text-blue-400';
      case 'like': return 'text-red-400';
      case 'comment': return 'text-green-400';
      case 'follow': return 'text-purple-400';
      case 'achievement': return 'text-yellow-400';
      case 'mining': return 'text-orange-400';
      case 'token': return 'text-cyan-400';
      case 'media': return 'text-pink-400';
      case 'share': return 'text-indigo-400';
      case 'bookmark': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-gray-800/60 bg-gray-900/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Aktivitäten</h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>{filteredActivities.length} Aktivitäten</span>
            <span>{filteredActivities.reduce((sum, a) => sum + (a.points || 0), 0)} Punkte</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Aktivitäten durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="posts">Beiträge</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="achievements">Erfolge</SelectItem>
              <SelectItem value="mining">Mining</SelectItem>
              <SelectItem value="tokens">Token</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Zeit</SelectItem>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>

          {isOwnProfile && (
            <Button
              variant={showPrivate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPrivate(!showPrivate)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Privat
            </Button>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      {Object.keys(groupedActivities).length === 0 ? (
        <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Keine Aktivitäten</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? `Keine Aktivitäten gefunden für "${searchTerm}"`
                : 'Noch keine Aktivitäten vorhanden'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-700 flex-1" />
                <Badge variant="outline" className="text-xs">
                  {format(new Date(date), 'dd. MMMM yyyy', { locale: de })}
                </Badge>
                <div className="h-px bg-gray-700 flex-1" />
              </div>
              
              <div className="space-y-3">
                {dayActivities.map((activity) => (
                  <Card
                    key={activity.id}
                    className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gray-800/60 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{activity.title}</h3>
                              <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                              
                              {/* Metadata */}
                              {activity.metadata && (
                                <div className="mt-2 space-y-1">
                                  {activity.metadata.targetUser && (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={activity.metadata.targetUser.avatar_url} />
                                        <AvatarFallback className="text-xs">
                                          {activity.metadata.targetUser.display_name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-400">
                                        {activity.metadata.targetUser.display_name}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {activity.metadata.amount && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                      <Coins className="w-3 h-3" />
                                      {activity.metadata.amount} {activity.metadata.currency}
                                    </div>
                                  )}
                                  
                                  {activity.metadata.media_url && (
                                    <div className="mt-2">
                                      <img 
                                        src={activity.metadata.media_url} 
                                        alt="Media preview"
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {activity.points && activity.points > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{activity.points} Punkte
                                </Badge>
                              )}
                              {!activity.is_public && (
                                <Badge variant="outline" className="text-xs">
                                  Privat
                                </Badge>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(activity.timestamp), { 
                                  addSuffix: true, 
                                  locale: de 
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Interactions */}
                          {activity.interaction_count > 0 && (
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {activity.interaction_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileActivitySection; 