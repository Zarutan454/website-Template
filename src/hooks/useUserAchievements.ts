import { useState, useEffect } from 'react';
import { apiClient } from '../lib/django-api-new';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Achievement, AchievementStats } from '@/hooks/achievements/useAchievements';

interface UserAchievementsResponse {
  achievements: Achievement[];
  stats: AchievementStats;
  total_count: number;
}

export const useUserAchievements = (userId?: string | number) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: profile } = useAuth();

  const fetchUserAchievements = async (targetUserId: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the new achievements API that returns all achievements with user progress
      const params = new URLSearchParams({
        page: '1',
        page_size: '50', // Get first 50 achievements for profile display
        status: 'all', // Show all achievements (completed + in progress + locked)
      });

      const response = await fetch(`http://localhost:8000/api/achievements/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('[Achievement Hook] New API Response:', data);
        
        // Extract achievements and stats from the new API response
        const achievements = data.results || [];
        const stats = data.stats || null;
        
        setAchievements(achievements);
        setStats(stats);
        
        console.log('[Achievement Hook] Processed achievements:', achievements);
        console.log('[Achievement Hook] Stats:', stats);
      } else {
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching achievements');
      console.error('[Achievement Hook] Error:', error);
      setError(error);
      toast.error('Fehler beim Laden der Erfolge');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If userId is provided, use that, otherwise use the current user's ID
    const targetUserId = userId || profile?.id;
    
    if (targetUserId) {
      console.log('[Achievement Hook] Fetching achievements for user:', targetUserId);
      fetchUserAchievements(targetUserId);
    } else {
      console.log('[Achievement Hook] No userId provided, skipping fetch');
      setIsLoading(false);
    }
  }, [userId, profile?.id]);

  return {
    achievements,
    stats,
    isLoading,
    error,
    refreshAchievements: (targetUserId: string | number) => fetchUserAchievements(targetUserId)
  };
};
