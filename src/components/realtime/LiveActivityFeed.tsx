import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  MessageCircle, 
  Heart, 
  Share2, 
  UserPlus,
  Image,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'post' | 'like' | 'comment' | 'share' | 'follow' | 'story';
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  content?: string;
  timestamp: string;
  post_id?: string;
  story_id?: string;
}

interface LiveActivityFeedProps {
  activities: ActivityItem[];
  onClear?: () => void;
  onRefresh?: () => void;
  className?: string;
  maxItems?: number;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  activities,
  onClear,
  onRefresh,
  className,
  maxItems = 10
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post':
        return <MessageCircle className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'story':
        return <Image className="w-4 h-4 text-pink-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'post':
        return `hat einen neuen Beitrag erstellt`;
      case 'like':
        return `gefällt dein Beitrag`;
      case 'comment':
        return `hat deinen Beitrag kommentiert`;
      case 'share':
        return `hat deinen Beitrag geteilt`;
      case 'follow':
        return `folgt dir jetzt`;
      case 'story':
        return `hat eine neue Story erstellt`;
      default:
        return 'hat etwas getan';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`;
    return date.toLocaleDateString('de-DE');
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span>Live Aktivität</span>
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activities.length}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-1">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
          {onClear && activities.length > 0 && (
            <Button
              onClick={onClear}
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
            >
              Löschen
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Keine neuen Aktivitäten
          </div>
        ) : (
          <div className="space-y-2">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {activity.user.avatar_url ? (
                    <img
                      src={activity.user.avatar_url}
                      alt={activity.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {activity.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {activity.user.username}
                    </span>
                    {getActivityIcon(activity.type)}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getActivityText(activity)}
                  </p>
                  {activity.content && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      "{activity.content}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed; 