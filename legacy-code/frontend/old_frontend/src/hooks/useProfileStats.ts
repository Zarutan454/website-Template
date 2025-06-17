
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);
      
      if (postsError) throw postsError;
      
      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);
      
      if (commentsError) throw commentsError;
      
      // Fetch likes given count
      const { count: likesCount, error: likesError } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (likesError) throw likesError;
      
      // Fetch mining stats
      const { data: miningData, error: miningError } = await supabase
        .from('mining_stats')
        .select('total_tokens_earned, mining_rate, streak_days')
        .eq('user_id', userId)
        .single();
      
      if (miningError && miningError.code !== 'PGRST116') throw miningError;
      
      // Calculate total mining days (approximate)
      const { data: miningActivities, error: activitiesError } = await supabase
        .from('mining_activities')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (activitiesError) throw activitiesError;
      
      // Get first and last mining activity to estimate total days
      let totalMiningDays = 0;
      if (miningActivities && miningActivities.length > 0) {
        const firstActivity = new Date(miningActivities[0].created_at);
        const lastActivity = new Date(miningActivities[miningActivities.length - 1].created_at);
        const diffTime = Math.abs(lastActivity.getTime() - firstActivity.getTime());
        totalMiningDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      
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
