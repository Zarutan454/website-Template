import React from 'react';
import { Analytics } from '../../hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart3, TrendingUp, Users, Heart, MessageSquare, Calendar, Target, Zap } from 'lucide-react';

interface UserStatsProps {
  analytics: Analytics | null;
}

export const UserStats: React.FC<UserStatsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p>Statistiken werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return 'text-green-600';
    if (rate >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPopularityColor = (score: number) => {
    if (score >= 1000) return 'text-purple-600';
    if (score >= 500) return 'text-blue-600';
    if (score >= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  // TODO: Django-API-Migration: UserStats auf Django-API umstellen
  // Die gesamte Logik für das Laden der UserStats muss auf die Django-API migriert werden.
  // Aktuell ist keine Funktionalität vorhanden, da Supabase entfernt wurde.

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Detaillierte Statistiken
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Übersicht */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(analytics.total_posts)}
            </div>
            <div className="text-xs text-blue-600">Posts</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Heart className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(analytics.total_likes_received)}
            </div>
            <div className="text-xs text-green-600">Likes</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(analytics.total_comments_received)}
            </div>
            <div className="text-xs text-purple-600">Kommentare</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(analytics.follower_count)}
            </div>
            <div className="text-xs text-orange-600">Follower</div>
          </div>
        </div>

        {/* Engagement & Popularität */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Engagement-Rate</span>
            </div>
            <div className={`text-3xl font-bold ${getEngagementColor(analytics.engagement_rate)}`}>
              {analytics.engagement_rate}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Durchschnittliche Interaktion pro Post
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Popularität-Score</span>
            </div>
            <div className={`text-3xl font-bold ${getPopularityColor(analytics.popularity_score)}`}>
              {Math.round(analytics.popularity_score)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Basierend auf Follower, Likes & Aktivität
            </p>
          </div>
        </div>

        {/* Aktivitäts-Trends */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Aktivitäts-Trends</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Posts diese Woche</span>
              </div>
              <Badge variant="secondary">
                {analytics.posts_last_week}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm">Posts diesen Monat</span>
              </div>
              <Badge variant="secondary">
                {analytics.posts_last_month}
              </Badge>
            </div>
          </div>
        </div>

        {/* Account-Informationen */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Account-Informationen</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{analytics.following_count}</div>
              <div className="text-xs text-gray-600">Folgt</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{analytics.account_age_days}</div>
              <div className="text-xs text-gray-600">Tage aktiv</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{analytics.profile_completion}%</div>
              <div className="text-xs text-gray-600">Profil vollständig</div>
            </div>
          </div>
        </div>

        {/* Performance-Indikatoren */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Performance-Indikatoren</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Durchschnittliche Likes pro Post</span>
              <span className="text-sm font-medium">
                {analytics.total_posts > 0 ? Math.round(analytics.total_likes_received / analytics.total_posts) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Durchschnittliche Kommentare pro Post</span>
              <span className="text-sm font-medium">
                {analytics.total_posts > 0 ? Math.round(analytics.total_comments_received / analytics.total_posts) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Posts pro Woche (Durchschnitt)</span>
              <span className="text-sm font-medium">
                {analytics.account_age_days > 0 ? Math.round((analytics.total_posts / analytics.account_age_days) * 7) : 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 