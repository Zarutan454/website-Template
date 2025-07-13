import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Coins, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  Clock, 
  TrendingUp,
  Crown,
  Shield,
  Flame,
  Gift,
  Lock,
  Unlock,
  Search,
  Filter,
  Grid3X3,
  List,
  Medal,
  Gem,
  Sparkles,
  CheckCircle,
  Circle,
  BarChart3
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'mining' | 'social' | 'trading' | 'community' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  points: number;
  token_reward?: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string[];
  next_tier?: {
    id: string;
    title: string;
    requirements: string[];
  };
}

interface ProfileAchievementsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const ProfileAchievementsSection: React.FC<ProfileAchievementsSectionProps> = ({ userId, isOwnProfile }) => {
  // State Management
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked' | 'mining' | 'social'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'points' | 'rarity' | 'alphabetical'>('recent');

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: 'early-adopter',
      title: 'Early Adopter',
      description: 'Einer der ersten 1000 Nutzer der Plattform',
      category: 'special',
      tier: 'gold',
      icon: '🌟',
      points: 500,
      token_reward: 100,
      is_unlocked: true,
      unlocked_at: '2023-05-20T15:45:00Z',
      rarity: 'legendary',
      requirements: ['Registrierung in den ersten 30 Tagen']
    },
    {
      id: 'mining-novice',
      title: 'Mining Novice',
      description: 'Erste 10 BSN-Token durch Mining erhalten',
      category: 'mining',
      tier: 'bronze',
      icon: '⛏️',
      points: 50,
      token_reward: 10,
      is_unlocked: true,
      unlocked_at: '2023-06-01T10:30:00Z',
      progress: {
        current: 10,
        required: 10,
        percentage: 100
      },
      rarity: 'common',
      requirements: ['10 BSN-Token minen'],
      next_tier: {
        id: 'mining-apprentice',
        title: 'Mining Apprentice',
        requirements: ['100 BSN-Token minen']
      }
    },
    {
      id: 'mining-apprentice',
      title: 'Mining Apprentice',
      description: '100 BSN-Token durch Mining erhalten',
      category: 'mining',
      tier: 'silver',
      icon: '⚡',
      points: 150,
      token_reward: 25,
      is_unlocked: true,
      unlocked_at: '2023-08-15T14:20:00Z',
      progress: {
        current: 100,
        required: 100,
        percentage: 100
      },
      rarity: 'rare',
      requirements: ['100 BSN-Token minen'],
      next_tier: {
        id: 'mining-expert',
        title: 'Mining Expert',
        requirements: ['1000 BSN-Token minen']
      }
    },
    {
      id: 'mining-expert',
      title: 'Mining Expert',
      description: '1000 BSN-Token durch Mining erhalten',
      category: 'mining',
      tier: 'gold',
      icon: '💎',
      points: 500,
      token_reward: 100,
      is_unlocked: false,
      progress: {
        current: 450,
        required: 1000,
        percentage: 45
      },
      rarity: 'epic',
      requirements: ['1000 BSN-Token minen']
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: '100 Beiträge geliked',
      category: 'social',
      tier: 'bronze',
      icon: '❤️',
      points: 75,
      token_reward: 15,
      is_unlocked: true,
      unlocked_at: '2023-07-10T09:15:00Z',
      progress: {
        current: 100,
        required: 100,
        percentage: 100
      },
      rarity: 'common',
      requirements: ['100 Beiträge liken']
    },
    {
      id: 'content-creator',
      title: 'Content Creator',
      description: '50 eigene Beiträge erstellt',
      category: 'social',
      tier: 'silver',
      icon: '📝',
      points: 200,
      token_reward: 50,
      is_unlocked: false,
      progress: {
        current: 23,
        required: 50,
        percentage: 46
      },
      rarity: 'rare',
      requirements: ['50 Beiträge erstellen']
    },
    {
      id: 'community-leader',
      title: 'Community Leader',
      description: '500 Follower erreicht',
      category: 'community',
      tier: 'gold',
      icon: '👑',
      points: 300,
      token_reward: 75,
      is_unlocked: false,
      progress: {
        current: 187,
        required: 500,
        percentage: 37
      },
      rarity: 'epic',
      requirements: ['500 Follower erreichen']
    },
    {
      id: 'token-trader',
      title: 'Token Trader',
      description: '10 erfolgreiche Token-Transfers',
      category: 'trading',
      tier: 'bronze',
      icon: '💰',
      points: 100,
      token_reward: 20,
      is_unlocked: true,
      unlocked_at: '2023-09-05T16:45:00Z',
      progress: {
        current: 10,
        required: 10,
        percentage: 100
      },
      rarity: 'common',
      requirements: ['10 Token-Transfers durchführen']
    }
  ];

  // Load achievements
  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAchievements(mockAchievements);
      } catch (error) {
        toast.error('Fehler beim Laden der Erfolge');
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [userId]);

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;

    // Filter by tab
    switch (activeTab) {
      case 'unlocked':
        filtered = filtered.filter(a => a.is_unlocked);
        break;
      case 'locked':
        filtered = filtered.filter(a => !a.is_unlocked);
        break;
      case 'mining':
        filtered = filtered.filter(a => a.category === 'mining');
        break;
      case 'social':
        filtered = filtered.filter(a => ['social', 'community'].includes(a.category));
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          if (a.is_unlocked && b.is_unlocked) {
            return new Date(b.unlocked_at || '').getTime() - new Date(a.unlocked_at || '').getTime();
          }
          return a.is_unlocked ? -1 : 1;
        case 'points':
          return b.points - a.points;
        case 'rarity': {
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        }
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [achievements, activeTab, searchTerm, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.is_unlocked);
    const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
    const totalTokens = unlocked.reduce((sum, a) => sum + (a.token_reward || 0), 0);
    
    return {
      total: achievements.length,
      unlocked: unlocked.length,
      locked: achievements.length - unlocked.length,
      totalPoints,
      totalTokens,
      completionRate: Math.round((unlocked.length / achievements.length) * 100)
    };
  }, [achievements]);

  // Get tier color
  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'text-orange-400';
      case 'silver': return 'text-gray-300';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-purple-400';
      case 'diamond': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  // Get rarity color
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-600 bg-gray-600/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-600 bg-gray-600/10';
    }
  };

  // Get tier icon
  const getTierIcon = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return <Medal className="w-4 h-4" />;
      case 'silver': return <Award className="w-4 h-4" />;
      case 'gold': return <Trophy className="w-4 h-4" />;
      case 'platinum': return <Crown className="w-4 h-4" />;
      case 'diamond': return <Gem className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-gray-800/60 bg-gray-900/30">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{stats.unlocked}</div>
            <div className="text-sm text-gray-400">Freigeschaltet</div>
          </CardContent>
        </Card>
        <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.totalPoints}</div>
            <div className="text-sm text-gray-400">Punkte</div>
          </CardContent>
        </Card>
        <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalTokens}</div>
            <div className="text-sm text-gray-400">Token erhalten</div>
          </CardContent>
        </Card>
        <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.completionRate}%</div>
            <div className="text-sm text-gray-400">Vollständigkeit</div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Erfolge</h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>{stats.unlocked} von {stats.total} freigeschaltet</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="unlocked">Freigeschaltet</TabsTrigger>
          <TabsTrigger value="locked">Gesperrt</TabsTrigger>
          <TabsTrigger value="mining">Mining</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Erfolge durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Zuletzt erhalten</SelectItem>
                <SelectItem value="points">Nach Punkten</SelectItem>
                <SelectItem value="rarity">Nach Seltenheit</SelectItem>
                <SelectItem value="alphabetical">Alphabetisch</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-700 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredAchievements.length === 0 ? (
            <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Keine Erfolge</h3>
                <p className="text-gray-400">
                  {searchTerm 
                    ? `Keine Erfolge gefunden für "${searchTerm}"`
                    : 'Noch keine Erfolge in dieser Kategorie'
                  }
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`border-2 backdrop-blur-sm transition-all hover:scale-105 ${
                    achievement.is_unlocked 
                      ? getRarityColor(achievement.rarity)
                      : 'border-gray-700 bg-gray-800/30 opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${achievement.is_unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold truncate ${
                            achievement.is_unlocked ? 'text-white' : 'text-gray-400'
                          }`}>
                            {achievement.title}
                          </h3>
                          <div className={getTierColor(achievement.tier)}>
                            {getTierIcon(achievement.tier)}
                          </div>
                          {!achievement.is_unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                        </div>
                        
                        <p className={`text-sm mb-2 ${
                          achievement.is_unlocked ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>

                        {/* Progress */}
                        {achievement.progress && !achievement.is_unlocked && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Fortschritt</span>
                              <span>{achievement.progress.current}/{achievement.progress.required}</span>
                            </div>
                            <Progress value={achievement.progress.percentage} className="h-2" />
                          </div>
                        )}

                        {/* Rewards */}
                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="secondary" className="text-xs">
                            {achievement.points} Punkte
                          </Badge>
                          {achievement.token_reward && (
                            <Badge variant="outline" className="text-xs">
                              +{achievement.token_reward} BSN
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${
                            achievement.rarity === 'legendary' ? 'border-yellow-500 text-yellow-400' :
                            achievement.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                            achievement.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                            'border-gray-500 text-gray-400'
                          }`}>
                            {achievement.rarity === 'legendary' ? 'Legendär' :
                             achievement.rarity === 'epic' ? 'Episch' :
                             achievement.rarity === 'rare' ? 'Selten' : 'Gewöhnlich'}
                          </Badge>
                        </div>

                        {/* Unlock date */}
                        {achievement.is_unlocked && achievement.unlocked_at && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3" />
                            Freigeschaltet {formatDistanceToNow(new Date(achievement.unlocked_at), { 
                              addSuffix: true, 
                              locale: de 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`border backdrop-blur-sm transition-all ${
                    achievement.is_unlocked 
                      ? getRarityColor(achievement.rarity)
                      : 'border-gray-700 bg-gray-800/30 opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl ${achievement.is_unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${
                                achievement.is_unlocked ? 'text-white' : 'text-gray-400'
                              }`}>
                                {achievement.title}
                              </h3>
                              <div className={getTierColor(achievement.tier)}>
                                {getTierIcon(achievement.tier)}
                              </div>
                              {!achievement.is_unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                            </div>
                            <p className={`text-sm mb-2 ${
                              achievement.is_unlocked ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {achievement.description}
                            </p>
                            
                            {/* Progress */}
                            {achievement.progress && !achievement.is_unlocked && (
                              <div className="mb-2 max-w-xs">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span>Fortschritt</span>
                                  <span>{achievement.progress.current}/{achievement.progress.required}</span>
                                </div>
                                <Progress value={achievement.progress.percentage} className="h-2" />
                              </div>
                            )}

                            {/* Unlock date */}
                            {achievement.is_unlocked && achievement.unlocked_at && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <CheckCircle className="w-3 h-3" />
                                {formatDistanceToNow(new Date(achievement.unlocked_at), { 
                                  addSuffix: true, 
                                  locale: de 
                                })}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {achievement.points} Punkte
                              </Badge>
                              {achievement.token_reward && (
                                <Badge variant="outline" className="text-xs">
                                  +{achievement.token_reward} BSN
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className={`text-xs ${
                              achievement.rarity === 'legendary' ? 'border-yellow-500 text-yellow-400' :
                              achievement.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                              achievement.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                              'border-gray-500 text-gray-400'
                            }`}>
                              {achievement.rarity === 'legendary' ? 'Legendär' :
                               achievement.rarity === 'epic' ? 'Episch' :
                               achievement.rarity === 'rare' ? 'Selten' : 'Gewöhnlich'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileAchievementsSection; 