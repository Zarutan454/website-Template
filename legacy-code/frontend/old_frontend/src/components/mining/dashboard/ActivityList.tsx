
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity as ActivityIcon, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/utils/formatters';
import { MiningActivity } from '@/hooks/mining/types';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface ActivityListProps {
  activities: MiningActivity[];
  isLoading: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, isLoading }) => {
  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'like': return '👍';
      case 'share': return '🔄';
      case 'mining_start': return '⛏️';
      case 'mining_stop': return '🛑';
      case 'invite': return '👥';
      case 'login': return '🔑';
      default: return '🔔';
    }
  };

  const getActivityName = (type: string): string => {
    switch (type) {
      case 'post': return 'Beitrag erstellt';
      case 'comment': return 'Kommentar geschrieben';
      case 'like': return 'Beitrag geliked';
      case 'share': return 'Beitrag geteilt';
      case 'mining_start': return 'Mining gestartet';
      case 'mining_stop': return 'Mining gestoppt';
      case 'invite': return 'Freund eingeladen';
      case 'login': return 'Eingeloggt';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="bg-dark-100 border-gray-800">
          <CardContent className="flex justify-center py-8">
            <LoadingSpinner 
              size="lg" 
              text="Aktivitäten werden geladen..." 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="w-full">
        <EmptyState
          title="Keine Aktivitäten"
          description="Du hast noch keine Mining-Aktivitäten. Starte das Mining, um Token zu verdienen."
          icon={<ActivityIcon className="h-10 w-10" />}
          action={
            <Button variant="outline" size="sm" className="mt-2">
              Mining starten
            </Button>
          }
          className="bg-dark-100"
        />
      </div>
    );
  }

  return (
    <Card className="bg-dark-100 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <ActivityIcon className="h-4 w-4 mr-2 text-primary" />
          Neueste Aktivitäten
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map(activity => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 border-b border-gray-800 pb-3 last:border-0 last:pb-0 hover:bg-gray-800/20 rounded-md p-2 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                <span>{getActivityIcon(activity.activity_type)}</span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{getActivityName(activity.activity_type)}</p>
                  {activity.tokens_earned > 0 && (
                    <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                      +{activity.tokens_earned} BSN
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityList;
