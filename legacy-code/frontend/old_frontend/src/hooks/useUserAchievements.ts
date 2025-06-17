import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserAchievement } from '@/hooks/mining/achievements/types';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export const useUserAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useProfile();

  const fetchUserAchievements = async (targetUserId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch achievements from the database
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', targetUserId);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match our UserAchievement type
      const formattedAchievements = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        achievementId: item.achievement_id,
        progress: item.progress,
        completed: item.completed,
        completedAt: item.completed_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        // Also keep snake_case properties for backend compatibility
        user_id: item.user_id,
        achievement_id: item.achievement_id,
        completed_at: item.completed_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Include the full achievement data
        achievement: item.achievements,
        title: item.achievements?.title,
        tokenReward: item.achievements?.token_reward
      }));
      
      setAchievements(formattedAchievements as UserAchievement[]);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching achievements');
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
      fetchUserAchievements(targetUserId);
    } else {
      setIsLoading(false);
    }
  }, [userId, profile?.id]);

  return {
    achievements,
    isLoading,
    error,
    refreshAchievements: (targetUserId: string) => fetchUserAchievements(targetUserId)
  };
};
