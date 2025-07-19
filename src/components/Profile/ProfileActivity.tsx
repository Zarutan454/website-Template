import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Image, MessageSquare, Heart, Zap, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { userAPI } from '@/lib/django-api-new';

interface ActivityItem {
  type: 'post' | 'comment' | 'like' | 'mining' | 'achievement';
  created_at: string;
  data: Record<string, unknown>;
}

interface ProfileActivityProps {
  userId: number;
  isOwnProfile?: boolean;
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({ userId, isOwnProfile = false }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchActivities = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getUserActivity(userId, page);
      
      if (response.results) {
        setActivities(response.results);
        setHasNextPage(!!response.next);
        setHasPrevPage(!!response.previous);
      } else {
        setActivities([]);
        setHasNextPage(false);
        setHasPrevPage(false);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Fehler beim Laden der Aktivitäten');
      toast.error('Aktivitäten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivities(currentPage);
  }, [fetchActivities, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <Image className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'mining':
        return <Zap className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'post':
        return `Hat einen Beitrag erstellt`;
      case 'comment':
        return `Hat einen Kommentar geschrieben`;
      case 'like':
        return `Hat etwas geliked`;
      case 'mining':
        return `Hat gemined`;
      case 'achievement':
        return `Hat ein Achievement freigeschaltet`;
      default:
        return 'Hat eine Aktivität durchgeführt';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Gerade eben';
    } else if (diffInHours < 24) {
      return `vor ${diffInHours} Stunden`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `vor ${diffInDays} Tagen`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Lade Aktivitäten...</span>
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
            <Activity className="h-5 w-5" />
            Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchActivities(currentPage)} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Aktivitäten ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {isOwnProfile ? 'Du hast noch keine Aktivitäten' : 'Keine Aktivitäten vorhanden'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{getActivityText(activity)}</p>
                    {typeof activity.data?.content === 'string' && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.data.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {(hasNextPage || hasPrevPage) && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Zurück
                </Button>
                <span className="text-sm text-muted-foreground">
                  Seite {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Weiter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileActivity; 