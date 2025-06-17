
import { BaseRepository } from '../MiningRepositoryBase';
import { MiningActivity, ActivityType } from '@/hooks/mining/types';

/**
 * Repository class for mining activities
 */
export class MiningActivityRepository extends BaseRepository {
  /**
   * Records a single mining activity
   */
  async recordActivity(
    userId: string, 
    type: ActivityType, 
    points: number, 
    tokens: number
  ): Promise<MiningActivity | null> {
    try {
      // Get current efficiency multiplier for the user
      const { data: statsData, error: statsError } = await this.supabase
        .from('mining_stats')
        .select('efficiency_multiplier, mining_rate')
        .eq('user_id', userId)
        .single();
      
      if (statsError) {
        console.error('[MiningActivityRepository] Error getting user stats:', statsError);
        return null;
      }
      
      const efficiencyMultiplier = statsData?.efficiency_multiplier || 1.0;
      const miningRate = statsData?.mining_rate || 0.1;
      
      // Use the optimized function
      const { data, error } = await this.supabase.rpc('record_mining_activity_optimized', {
        p_user_id: userId,
        p_type: type,
        p_points: points,
        p_tokens: tokens,
        p_efficiency_multiplier: efficiencyMultiplier,
        p_mining_rate: miningRate
      });
      
      if (error) {
        console.error('[MiningActivityRepository] Error recording activity:', error);
        return null;
      }
      
      if (!data.success) {
        console.log(`[MiningActivityRepository] Could not record activity: ${data.reason}`);
        return null;
      }
      
      console.log(`[MiningActivityRepository] Activity recorded successfully:`, data.activity);
      
      // Return the activity data
      return {
        ...data.activity,
        created_at: new Date(data.activity.created_at)
      };
    } catch (error) {
      console.error('[MiningActivityRepository] Error recording activity:', error);
      return null;
    }
  }
  
  /**
   * Records multiple mining activities in a batch
   */
  async batchRecordActivities(
    userId: string,
    activities: Array<{type: ActivityType, points: number, tokens: number}>
  ): Promise<{success: boolean, error?: unknown, reason?: string, count: number}> {
    try {
      console.log(`[MiningActivityRepository] Batch processing ${activities.length} activities for user ${userId}`);
      
      // Optimized version: Check if user is mining first to avoid unnecessary processing
      const { data: miningStatus, error: statusError } = await this.supabase
        .from('mining_stats')
        .select('is_mining')
        .eq('user_id', userId)
        .single();
      
      if (statusError) {
        console.error('[MiningActivityRepository] Error checking mining status:', statusError);
        return { success: false, error: statusError, count: 0 };
      }
      
      if (!miningStatus.is_mining) {
        console.log('[MiningActivityRepository] User is not mining, skipping batch processing');
        return { success: false, reason: 'not_mining', count: 0 };
      }
      
      // Convert activities to JSON format expected by the function
      const activitiesJson = activities.map(activity => ({
        type: activity.type,
        points: activity.points,
        tokens: activity.tokens
      }));
      
      // Use the batch processing function
      const { data, error } = await this.supabase.rpc('batch_process_mining_activities', {
        p_user_id: userId,
        p_activities: activitiesJson
      });
      
      if (error) {
        console.error('[MiningActivityRepository] Error in batch processing:', error);
        return { success: false, error, count: 0 };
      }
      
      console.log(`[MiningActivityRepository] Batch processing result:`, data);
      return data;
    } catch (error) {
      console.error('[MiningActivityRepository] Error in batch processing:', error);
      return { success: false, error, count: 0 };
    }
  }
  
  /**
   * Gets mining activities for a user
   */
  async getMiningActivities(userId: string, limit: number = 10): Promise<MiningActivity[]> {
    try {
      console.log(`[MiningActivityRepository] Getting mining activities for user ${userId}, limit: ${limit}`);
      
      // Use the composite index for more efficient querying
      const { data, error } = await this.supabase
        .from('mining_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      console.log(`[MiningActivityRepository] Mining activities loaded:`, data);
      
      // Transform the data to the correct format
      return data.map((activity: any) => ({
        ...activity,
        created_at: new Date(activity.created_at)
      }));
    } catch (error) {
      console.error('[MiningActivityRepository] Error getting mining activities:', error);
      return [];
    }
  }
  
  /**
   * Archives old mining activities
   */
  async archiveOldActivities(days = 90): Promise<number> {
    try {
      console.log(`[MiningActivityRepository] Archiving activities older than ${days} days`);
      
      const { data, error } = await this.supabase.rpc('cleanup_stale_mining_states', { days });
      
      if (error) {
        console.error('[MiningActivityRepository] Error archiving old activities:', error);
        return 0;
      }
      
      console.log(`[MiningActivityRepository] Archived ${data} old activities`);
      return data || 0;
    } catch (error) {
      console.error('[MiningActivityRepository] Error archiving old activities:', error);
      return 0;
    }
  }
}
