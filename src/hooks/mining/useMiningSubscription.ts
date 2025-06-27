
import { useState, useEffect, useCallback } from 'react';
import { MiningStats, MiningActivity, formatDateForDatabase } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useMiningSubscription = (userId: string) => {
  const [miningStats, setMiningStats] = useState<MiningStats>({
    user_id: userId,
    total_points: 0,
    total_tokens_earned: 0,
    daily_points: 0,
    daily_tokens_earned: 0,
    last_activity_at: new Date().toISOString(), // Convert Date to string
    is_mining: false,
    mining_rate: 0.1,
    efficiency_multiplier: 1.0,
    achievement_bonus: 0,
    streak_days: 0
  });
  
  const [miningActivities, setMiningActivities] = useState<MiningActivity[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to mining stats changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('mining-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mining_stats',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          handleStatsUpdate(payload.new as MiningStats);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mining_activities',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New mining activity:', payload);
          handleNewActivity(payload.new as any);
        }
      )
      .subscribe();

    setIsSubscribed(true);

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [userId]);

  // Initial data fetch
  useEffect(() => {
    if (!userId) return;
    fetchInitialData();
  }, [userId]);

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      // Fetch mining stats
      const { data: statsData, error: statsError } = await supabase
        .from('mining_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;
      if (statsData) handleStatsUpdate(statsData);

      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('mining_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activitiesError) throw activitiesError;
      if (activitiesData) setMiningActivities(activitiesData as any);
    } catch (err) {
      console.error('Error fetching initial mining data:', err);
      setError('Failed to fetch mining data');
    }
  };

  // Handle stats update from subscription
  const handleStatsUpdate = useCallback((data: any) => {
    if (!data) return;

    const updatedStats: MiningStats = {
      user_id: userId,
      total_points: data.total_points || 0,
      total_tokens_earned: data.total_tokens_earned || 0,
      daily_points: data.daily_points || 0,
      daily_tokens_earned: data.daily_tokens_earned || 0,
      last_activity_at: data.last_activity_at || new Date().toISOString(), // Ensure it's a string
      is_mining: !!data.is_mining,
      daily_posts_count: data.daily_posts_count || 0,
      daily_comments_count: data.daily_comments_count || 0,
      daily_likes_count: data.daily_likes_count || 0,
      daily_shares_count: data.daily_shares_count || 0,
      daily_invites_count: data.daily_invites_count || 0,
      streak_days: data.streak_days || 0,
      efficiency_multiplier: data.efficiency_multiplier || 1.0,
      mining_rate: data.mining_rate || 0.1,
      achievement_bonus: data.achievement_bonus || 0
    };

    setMiningStats(updatedStats);
  }, [userId]);

  // Handle new activity from subscription
  const handleNewActivity = useCallback((data: any) => {
    if (!data) return;

    const newActivity: MiningActivity = {
      id: data.id,
      user_id: data.user_id,
      activity_type: data.activity_type,
      points: data.points || 0,
      tokens_earned: data.tokens_earned || 0,
      created_at: data.created_at || new Date().toISOString(), // Ensure it's a string
      efficiency_at_time: data.efficiency_at_time || 1.0,
      mining_rate_at_time: data.mining_rate_at_time || 0.1
    };

    setMiningActivities(prev => [newActivity, ...prev].slice(0, 20));

    // Optional: Show toast notification for new activities
    toast.success(`+${newActivity.tokens_earned.toFixed(2)} BSN for ${newActivity.activity_type}`);
  }, []);

  // Make sure all Date objects are converted to strings
  const updateLocalStats = useCallback((update: Partial<MiningStats>) => {
    setMiningStats(prev => {
      // Ensure all Date objects are converted to strings
      const updatedValues = {...update};
      
      if (updatedValues.last_activity_at && typeof updatedValues.last_activity_at !== 'string') {
        updatedValues.last_activity_at = String(updatedValues.last_activity_at);
      }
      
      if (updatedValues.daily_reset_at && typeof updatedValues.daily_reset_at !== 'string') {
        updatedValues.daily_reset_at = String(updatedValues.daily_reset_at);
      }
      
      return {
        ...prev,
        ...updatedValues
      };
    });
  }, []);

  return {
    miningStats,
    updateLocalStats,
    miningActivities,
    isSubscribed,
    error,
    fetchInitialData
  };
};
