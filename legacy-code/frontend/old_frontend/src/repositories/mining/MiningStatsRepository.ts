
import { BaseRepository } from '../MiningRepositoryBase';
import { MiningStats, formatDateForDatabase } from '@/hooks/mining/types';

/**
 * Repository class for mining statistics
 */
export class MiningStatsRepository extends BaseRepository {
  /**
   * Initialize mining statistics for a new user
   */
  async initializeMiningStats(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('mining_stats')
        .insert({
          user_id: userId,
          total_points: 0,
          total_tokens_earned: 0,
          daily_points: 0,
          daily_tokens_earned: 0,
          is_mining: false,
          last_activity_at: new Date().toISOString(), // Convert Date to string
          daily_reset_at: new Date().toISOString() // Convert Date to string
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Transform the data from the database into the correct format
   */
  transformMiningStats(data: unknown): MiningStats {
    if (!data) {
      return {
        user_id: '', // Default empty string, will be replaced in the app
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
      };
    }
    
    return {
      user_id: data.user_id || '',
      total_points: data.total_points || 0,
      total_tokens_earned: data.total_tokens_earned || 0,
      daily_points: data.daily_points || 0,
      daily_tokens_earned: data.daily_tokens_earned || 0,
      last_activity_at: data.last_activity_at || new Date().toISOString(), // Ensure it's a string
      is_mining: !!data.is_mining,
      mining_rate: data.mining_rate || 0.1,
      efficiency_multiplier: data.efficiency_multiplier || 1.0,
      streak_days: data.streak_days || 0,
      achievement_bonus: data.achievement_bonus || 0,
      daily_posts_count: data.daily_posts_count || 0,
      daily_comments_count: data.daily_comments_count || 0,
      daily_likes_count: data.daily_likes_count || 0,
      daily_shares_count: data.daily_shares_count || 0,
      daily_invites_count: data.daily_invites_count || 0
    };
  }
}
