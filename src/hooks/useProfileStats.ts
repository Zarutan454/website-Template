
import { useState, useEffect, useCallback } from 'react';

interface ProfileStats {
  postsCount: number;
  commentsCount: number;
  likesCount: number;
  sharesCount: number;
  minedTokens: number;
  dailyMiningRate: number;
  totalMiningDays: number;
  streak: number;
  isLoading: boolean;
  error: Error | null;
}

export const useProfileStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    commentsCount: 0,
    likesCount: 0,
    sharesCount: 0,
    minedTokens: 0,
    dailyMiningRate: 0,
    totalMiningDays: 0,
    streak: 0,
    isLoading: true,
    error: null
  });

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setStats(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch post count
      // TODO: Django-API-Migration: useProfileStats auf Django-API umstellen
      const postsCount = 0; // Placeholder
      
      // Fetch comments count
      // TODO: Django-API-Migration: useProfileStats auf Django-API umstellen
      const commentsCount = 0; // Placeholder
      
      // Fetch likes given count
      // TODO: Django-API-Migration: useProfileStats auf Django-API umstellen
      const likesCount = 0; // Placeholder
      
      // Fetch mining stats
      // TODO: Django-API-Migration: useProfileStats auf Django-API umstellen
      const miningData = { total_tokens_earned: 0, mining_rate: 0, streak_days: 0 }; // Placeholder
      
      // Calculate total mining days (approximate)
      // TODO: Django-API-Migration: useProfileStats auf Django-API umstellen
      const totalMiningDays = 0; // Placeholder
      
      setStats({
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        likesCount: likesCount || 0,
        sharesCount: 0, // Currently not tracked
        minedTokens: miningData?.total_tokens_earned || 0,
        dailyMiningRate: miningData?.mining_rate || 0,
        totalMiningDays,
        streak: miningData?.streak_days || 0,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      setStats(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      }));
    }
  }, [userId]);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return {
    ...stats,
    refreshStats: fetchStats
  };
};
