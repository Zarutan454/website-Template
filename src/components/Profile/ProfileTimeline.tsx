
import React from 'react';
import ProfileTimelineEvent from './ProfileTimelineEvent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BarChart } from 'lucide-react';
import { UserAchievement } from '@/hooks/mining/achievements/types';

interface TimelineEvent {
  id: string;
  type: 'post' | 'achievement' | 'token' | 'comment' | 'follow';
  timestamp: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
}

interface ProfileTimelineProps {
  userId: string;
  events: TimelineEvent[];
  achievements?: UserAchievement[];
  isLoading: boolean;
  isOwnProfile: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

const ProfileTimeline: React.FC<ProfileTimelineProps> = ({
  userId,
  events,
  achievements = [],
  isLoading,
  isOwnProfile,
  onEventClick
}) => {
  // Convert completed achievements to timeline events
  const achievementEvents = achievements
    .filter(achievement => achievement.completed && achievement.completedAt)
    .map(achievement => ({
      id: `achievement-${achievement.id}`,
      type: 'achievement' as const,
      timestamp: achievement.completedAt?.toString() || new Date().toISOString(),
      title: `Achievement freigeschaltet: ${achievement.title || achievement.achievement?.title || 'Erfolg'}`,
      description: `Hat das Achievement "${achievement.title || achievement.achievement?.title || 'Erfolg'}" freigeschaltet`,
      targetId: achievement.id,
      targetType: 'achievement'
    }));

  // Combine regular events with achievement events and sort by timestamp (most recent first)
  const allEvents = [...events, ...achievementEvents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (isLoading) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-800"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allEvents.length === 0) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Noch keine Aktivitäten</h3>
            <p className="text-gray-400 max-w-md">
              {isOwnProfile 
                ? 'Hier werden deine Aktivitäten und Erfolge angezeigt.'
                : 'Hier werden die Aktivitäten und Erfolge angezeigt.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {allEvents.map(event => (
        <ProfileTimelineEvent 
          key={event.id} 
          event={event} 
          onClick={onEventClick}
        />
      ))}
    </div>
  );
};

export default ProfileTimeline;
