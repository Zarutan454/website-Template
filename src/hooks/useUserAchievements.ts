import { useState, useEffect } from 'react';
import { apiClient } from '../lib/django-api-new';
import { UserAchievement, BackendAchievement, BackendAchievementsResponse } from '@/hooks/mining/achievements/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useUserAchievements = (userId?: string | number) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: profile } = useAuth();

  const fetchUserAchievements = async (targetUserId: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch achievements from the Django API
      const response = await apiClient(`/achievements/user/${targetUserId}/`);
      
      // Convert backend achievements to frontend format
      const convertedAchievements: UserAchievement[] = (response?.achievements || []).map((backendAchievement: BackendAchievement) => ({
        id: backendAchievement.id,
        progress: backendAchievement.progress || 0,
        completed: backendAchievement.unlocked || false,
        title: backendAchievement.name,
        tokenReward: backendAchievement.reward || 0,
        achievement: {
          id: backendAchievement.id,
          title: backendAchievement.name,
          description: backendAchievement.description,
          category: backendAchievement.category as 'mining' | 'social' | 'token' | 'system',
          icon: backendAchievement.icon,
          difficulty: 'easy' as 'easy' | 'medium' | 'hard' | 'expert',
          requirements: {
            type: 'custom',
            value: backendAchievement.max_progress || 1
          },
          token_reward: backendAchievement.reward || 0,
          tokenReward: backendAchievement.reward || 0,
          points_reward: 0,
          pointsReward: 0
        }
      }));
      
      setAchievements(convertedAchievements);
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
    refreshAchievements: (targetUserId: string | number) => fetchUserAchievements(targetUserId)
  };
};
