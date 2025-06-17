import { supabase } from '@/lib/supabase';
import { ActivityType, MiningActivity, MiningStats, normalizeMiningStats } from './types';

export const MiningRepository = {
  async startMining(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: userId,
          start_time: new Date().toISOString(),
          is_active: true
        });
      
      return !error;
    } catch (err) {
      console.error('Error starting mining session:', err);
      return false;
    }
  },
  
  async stopMining(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mining_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);
      
      return !error;
    } catch (err) {
      console.error('Error stopping mining session:', err);
      return false;
    }
  },
  
  async recordActivity(userId: string, type: ActivityType, points: number, tokens: number): Promise<MiningActivity | null> {
    try {
      const { data, error } = await supabase
        .from('mining_activities')
        .insert({
          user_id: userId,
          activity_type: type,
          points,
          tokens_earned: tokens,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error recording ${type} activity:`, err);
      return null;
    }
  },
  
  async getMiningStats(userId: string): Promise<MiningStats> {
    try {
      const { data: pointsData, error: pointsError } = await supabase
        .from('mining_activities')
        .select('points, tokens_earned')
        .eq('user_id', userId);
        
      if (pointsError) throw pointsError;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: dailyActivities, error: dailyError } = await supabase
        .from('mining_activities')
        .select('activity_type, points, tokens_earned')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());
        
      if (dailyError) throw dailyError;
      
      const totalPoints = pointsData.reduce((sum, item) => sum + (item.points || 0), 0);
      const totalTokensEarned = pointsData.reduce((sum, item) => sum + (item.tokens_earned || 0), 0);
      
      const dailyPoints = dailyActivities.reduce((sum, item) => sum + (item.points || 0), 0);
      const dailyTokensEarned = dailyActivities.reduce((sum, item) => sum + (item.tokens_earned || 0), 0);
      
      const { data: activeSessions, error: sessionError } = await supabase
        .from('mining_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);
        
      if (sessionError) throw sessionError;
      
      const activityCounts: Record<string, number> = {};
      const activityPoints: Record<string, number> = {};
      const activityTokens: Record<string, number> = {};
      
      dailyActivities.forEach((activity) => {
        const type = activity.activity_type;
        activityCounts[type] = (activityCounts[type] || 0) + 1;
        activityPoints[type] = (activityPoints[type] || 0) + (activity.points || 0);
        activityTokens[type] = (activityTokens[type] || 0) + (activity.tokens_earned || 0);
      });
      
      const stats: Partial<MiningStats> = {
        user_id: userId,
        total_points: totalPoints,
        total_tokens_earned: totalTokensEarned,
        daily_points: dailyPoints,
        daily_tokens_earned: dailyTokensEarned,
        is_mining: activeSessions && activeSessions.length > 0,
        last_activity_at: new Date().toISOString(),
        efficiency_multiplier: 1.0, // Default value, can be calculated based on other factors
        mining_rate: 0.1, // Default value
        achievement_bonus: 0,
        streak_days: 0,
        
        daily_posts_count: activityCounts['post'] || 0,
        daily_comments_count: activityCounts['comment'] || 0,
        daily_likes_count: activityCounts['like'] || 0,
        daily_shares_count: activityCounts['share'] || 0,
        daily_invites_count: activityCounts['invite'] || 0,
        daily_nft_likes_count: activityCounts['nft_like'] || 0,
        daily_nft_shares_count: activityCounts['nft_share'] || 0,
        daily_nft_purchases_count: activityCounts['nft_purchase'] || 0,
        daily_token_likes_count: activityCounts['token_like'] || 0,
        daily_token_shares_count: activityCounts['token_share'] || 0,
        daily_reset_at: today.toISOString()
      };
      
      return normalizeMiningStats(stats);
    } catch (err) {
      console.error('Error fetching mining stats:', err);
      return normalizeMiningStats({
        user_id: userId,
        total_points: 0,
        total_tokens_earned: 0,
        daily_points: 0,
        daily_tokens_earned: 0,
        is_mining: false,
        last_activity_at: new Date().toISOString(),
        efficiency_multiplier: 1.0,
        mining_rate: 0.1,
        achievement_bonus: 0,
        streak_days: 0
      });
    }
  },
  
  async getMiningActivities(userId: string, count: number): Promise<MiningActivity[]> {
    try {
      const { data, error } = await supabase
        .from('mining_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(count);
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching mining activities:', err);
      return [];
    }
  }
};
