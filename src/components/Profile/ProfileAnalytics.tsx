import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Loader2, 
  Users,
  Image,
  Heart,
  Zap,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { userAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

interface AnalyticsData {
  follower_count: number;
  following_count: number;
  post_count: number;
  like_count: number;
  mining_count: number;
  achievement_count: number;
}

interface ProfileAnalyticsProps {
  userId: number;
  isOwnProfile?: boolean;
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ userId, isOwnProfile = false }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getUserAnalytics(userId);
      setAnalytics(response);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Fehler beim Laden der Analytics');
      toast.error('Analytics konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const analyticsItems = [
    {
      key: 'follower_count',
      label: 'Follower',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-blue-500',
    },
    {
      key: 'following_count',
      label: 'Following',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-green-500',
    },
    {
      key: 'post_count',
      label: 'Beiträge',
      icon: <Image className="h-4 w-4" />,
      color: 'bg-purple-500',
    },
    {
      key: 'like_count',
      label: 'Likes',
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-red-500',
    },
    {
      key: 'mining_count',
      label: 'Mining',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-yellow-500',
    },
    {
      key: 'achievement_count',
      label: 'Achievements',
      icon: <Trophy className="h-4 w-4" />,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Lade Analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Keine Analytics-Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActivity = analytics.post_count + analytics.like_count + analytics.mining_count + analytics.achievement_count;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Übersicht */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {analyticsItems.map((item) => (
              <div key={item.key} className="text-center p-4 rounded-lg border bg-card">
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-2`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {analytics[item.key as keyof AnalyticsData]}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Aktivitäts-Score */}
          <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Aktivitäts-Score</h3>
            </div>
            <div className="text-3xl font-bold text-primary">
              {totalActivity}
            </div>
            <p className="text-sm text-muted-foreground">
              Gesamte Aktivitäten in diesem Profil
            </p>
          </div>

          {/* Social Score */}
          <div className="p-4 rounded-lg border bg-gradient-to-r from-green-500/5 to-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Social Score</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {analytics.follower_count + analytics.following_count}
            </div>
            <p className="text-sm text-muted-foreground">
              Follower + Following
            </p>
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <h3 className="font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.post_count > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Content Creator
                </Badge>
              )}
              {analytics.follower_count > 10 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Popular
                </Badge>
              )}
              {analytics.mining_count > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Miner
                </Badge>
              )}
              {analytics.achievement_count > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Achiever
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileAnalytics; 