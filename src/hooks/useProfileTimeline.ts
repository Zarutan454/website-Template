import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface TimelineEvent {
  id: string;
  type: 'post' | 'achievement' | 'token' | 'comment' | 'follow' | 'like' | 'mining';
  timestamp: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
  data?: any;
}

export const useProfileTimeline = (userId?: string | number) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimelineEvents = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      const allEvents: TimelineEvent[] = [];
      
      // Fetch user posts
      try {
        const postsResponse = await apiClient.get(`/posts/?author=${userIdNum}&limit=20`);
        if (postsResponse && postsResponse.results) {
          const postEvents = postsResponse.results.map((post: any) => ({
            id: `post-${post.id}`,
            type: 'post' as const,
            timestamp: post.created_at,
            title: 'Neuer Beitrag erstellt',
            description: post.content?.substring(0, 100) || 'Beitrag ohne Text',
            targetId: post.id.toString(),
            targetType: 'post',
            data: post
          }));
          allEvents.push(...postEvents);
        }
      } catch (error) {
        console.warn('Could not fetch posts for timeline:', error);
      }
      
      // Fetch user comments
      try {
        const commentsResponse = await apiClient.get(`/comments/?author=${userIdNum}&limit=10`);
        if (commentsResponse && commentsResponse.results) {
          const commentEvents = commentsResponse.results.map((comment: any) => ({
            id: `comment-${comment.id}`,
            type: 'comment' as const,
            timestamp: comment.created_at,
            title: 'Kommentar verfasst',
            description: comment.content?.substring(0, 100) || 'Kommentar ohne Text',
            targetId: comment.post?.toString(),
            targetType: 'post',
            data: comment
          }));
          allEvents.push(...commentEvents);
        }
      } catch (error) {
        console.warn('Could not fetch comments for timeline:', error);
      }
      
      // Fetch user achievements
      try {
        const achievementsResponse = await apiClient.get(`/achievements/user/${userIdNum}/`);
        if (achievementsResponse && achievementsResponse.achievements) {
          const achievementEvents = achievementsResponse.achievements
            .filter((achievement: any) => achievement.unlocked)
            .map((achievement: any) => ({
              id: `achievement-${achievement.id}`,
              type: 'achievement' as const,
              timestamp: achievement.unlocked_at || new Date().toISOString(),
              title: `Achievement freigeschaltet: ${achievement.name}`,
              description: achievement.description || 'Achievement freigeschaltet',
              targetId: achievement.id.toString(),
              targetType: 'achievement',
              data: achievement
            }));
          allEvents.push(...achievementEvents);
        }
      } catch (error) {
        console.warn('Could not fetch achievements for timeline:', error);
      }
      
      // Fetch mining activities
      try {
        const miningResponse = await apiClient.get(`/mining/activities/?user=${userIdNum}&limit=10`);
        if (miningResponse && miningResponse.results) {
          const miningEvents = miningResponse.results.map((activity: any) => ({
            id: `mining-${activity.id}`,
            type: 'mining' as const,
            timestamp: activity.created_at,
            title: 'Mining-Aktivität',
            description: `${activity.tokens_earned || 0} Token gemined`,
            targetId: activity.id.toString(),
            targetType: 'mining',
            data: activity
          }));
          allEvents.push(...miningEvents);
        }
      } catch (error) {
        console.warn('Could not fetch mining activities for timeline:', error);
      }
      
      // Sort events by timestamp (most recent first)
      const sortedEvents = allEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setEvents(sortedEvents);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching timeline');
      setError(error);
      console.error('Error fetching profile timeline:', error);
      toast.error('Fehler beim Laden der Timeline');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTimelineEvents();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    events,
    isLoading,
    error,
    refreshTimeline: fetchTimelineEvents
  };
}; 