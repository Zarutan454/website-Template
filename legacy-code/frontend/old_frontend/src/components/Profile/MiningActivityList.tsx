
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeAgo } from '@/utils/timeAgo';
import { supabase } from '@/lib/supabase';
import { Activity, Heart, MessageCircle, Share2, PlusCircle, AlertCircle } from 'lucide-react';

interface MiningActivity {
  id: string;
  activity_type: string;
  tokens_earned: number;
  points: number;
  created_at: string;
}

interface MiningActivityListProps {
  userId: string;
  limit?: number;
}

const MiningActivityList: React.FC<MiningActivityListProps> = ({ userId, limit = 10 }) => {
  const [activities, setActivities] = useState<MiningActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('mining_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        
        setActivities(data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId, limit]);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-green-500" />;
      case 'post':
        return <PlusCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };
  
  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'like':
        return 'Like';
      case 'comment':
        return 'Kommentar';
      case 'share':
        return 'Teilen';
      case 'post':
        return 'Beitrag';
      case 'invite':
        return 'Einladung';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 text-center space-y-2">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">
          Fehler beim Laden der Mining-Aktivitäten
        </p>
      </Card>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center space-y-2">
        <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">
          Noch keine Mining-Aktivitäten vorhanden
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-center p-4 border rounded-md bg-card">
          <div className="flex-shrink-0 mr-4">
            {getActivityIcon(activity.activity_type)}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {getActivityLabel(activity.activity_type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
                <p className="text-sm">
                  {activity.points} Punkte
                </p>
              </div>
              
              <Badge className="bg-primary/10 text-primary border-primary/20">
                +{activity.tokens_earned.toFixed(2)} BSN
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MiningActivityList;
