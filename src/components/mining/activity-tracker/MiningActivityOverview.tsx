
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Share2, Send, Plus } from 'lucide-react';
import { MiningActivity } from '@/hooks/mining/types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface MiningActivityOverviewProps {
  recentActivities: MiningActivity[];
  isLoading?: boolean;
}

const ActivityTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'post':
      return <MessageSquare className="h-4 w-4" />;
    case 'like':
      return <ThumbsUp className="h-4 w-4" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4" />;
    case 'share':
      return <Share2 className="h-4 w-4" />;
    case 'invite':
      return <Send className="h-4 w-4" />;
    default:
      return <Plus className="h-4 w-4" />;
  }
};

const ActivityTypeBadge = ({ type }: { type: string }) => {
  const getVariant = () => {
    switch (type) {
      case 'post':
        return 'default';
      case 'like':
        return 'secondary';
      case 'comment':
        return 'outline';
      case 'share':
        return 'destructive';
      case 'invite':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'post':
        return 'Beitrag';
      case 'like':
        return 'Like';
      case 'comment':
        return 'Kommentar';
      case 'share':
        return 'Geteilt';
      case 'invite':
        return 'Einladung';
      case 'mining_start':
        return 'Mining Start';
      case 'mining_stop':
        return 'Mining Stop';
      default:
        return type;
    }
  };

  return (
    <Badge variant={getVariant()}>
      <ActivityTypeIcon type={type} />
      <span className="ml-1">{getLabel()}</span>
    </Badge>
  );
};

const MiningActivityOverview: React.FC<MiningActivityOverviewProps> = ({ 
  recentActivities, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-10 h-5 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Letzte Aktivitäten</CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Noch keine Mining-Aktivitäten vorhanden. Starte das Mining und beginne mit Interaktionen.
          </p>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2">
                <ActivityTypeBadge type={activity.activity_type} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm">{activity.tokens_earned.toFixed(4)} BSN verdient</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true, 
                        locale: de
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Effizienz: {(activity.efficiency_at_time || 1.0) * 100}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiningActivityOverview;
