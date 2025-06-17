import { supabase } from '@/lib/supabase';
import { MiningActivity, ActivityType, MiningStats, formatDateForDatabase } from '@/hooks/mining/types';

export class MiningRepository {
  /**
   * Start mining for a user
   */
  async startMining(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('mining_stats')
        .update({
          is_mining: true,
          last_activity_at: new Date().toISOString(), // Convert to string
          last_heartbeat: new Date().toISOString() // Convert to string
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Add entry to mining_sessions
      await supabase
        .from('mining_sessions')
        .insert({
          user_id: userId,
          status: 'active',
          start_time: new Date().toISOString() // Convert to string
        });
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Stop mining for a user
   */
  async stopMining(userId: string): Promise<boolean> {
    try {
      // Update mining stats
      const { error } = await supabase
        .from('mining_stats')
        .update({
          is_mining: false,
          last_activity_at: new Date().toISOString() // Convert to string
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Close active mining sessions
      await supabase
        .from('mining_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString() // Convert to string
        })
        .eq('user_id', userId)
        .eq('status', 'active');
      
      return true;
    } catch (error) {
      console.error('Error stopping mining:', error);
      return false;
    }
  }
  
  /**
   * Record a mining activity for a user
   */
  async recordActivity(
    userId: string,
    type: ActivityType,
    points: number,
    tokens: number
  ): Promise<MiningActivity | null> {
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('mining_stats')
        .select('current_speed_boost, max_speed_boost, mining_rate')
        .eq('user_id', userId)
        .single();
      
      if (statsError) {
        console.error('Error fetching mining stats for speed boost update:', statsError);
      } else {
        const currentBoost = statsData?.current_speed_boost || 0;
        const maxBoost = statsData?.max_speed_boost || 95;
        const newBoost = Math.min(currentBoost + points, maxBoost);
        
        const baseRate = statsData?.mining_rate || 0.3;
        const boostMultiplier = 1 + (newBoost / 100);
        const effectiveRate = parseFloat((baseRate * boostMultiplier).toFixed(4));
        
        const { error: updateError } = await supabase
          .from('mining_stats')
          .update({
            current_speed_boost: newBoost,
            effective_mining_rate: effectiveRate,
            last_activity_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating speed boost:', updateError);
        }
      }
      
      const { data, error } = await supabase
        .from('mining_activities')
        .insert({
          user_id: userId,
          activity_type: type,
          points, // Store speed boost in points field
          tokens_earned: tokens,
          created_at: new Date().toISOString() // Convert to string
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as MiningActivity;
    } catch (error) {
      console.error(`Error recording ${type} activity:`, error);
      return null;
    }
  }
  
  /**
   * Batch record mining activities for a user
   */
  async batchRecordActivities(
    userId: string,
    activities: { type: ActivityType; points: number; tokens: number }[]
  ): Promise<{ success: boolean; count: number; error?: Error } | null> {
    try {
      // Prepare activities for batch insert
      const activitiesToInsert = activities.map(activity => ({
        user_id: userId,
        activity_type: activity.type,
        points: activity.points,
        tokens_earned: activity.tokens,
        created_at: new Date().toISOString() // Convert to string
      }));
      
      const { data, error } = await supabase
        .from('mining_activities')
        .insert(activitiesToInsert)
        .select();
      
      if (error) throw error;
      
      return { success: true, count: activitiesToInsert.length };
    } catch (error) {
      console.error('Error recording activity batch:', error);
      return { success: false, count: 0, error };
    }
  }
  
  /**
   * Get mining statistics for a user
   */
  async getMiningStats(userId: string): Promise<MiningStats> {
    try {
      const { data, error } = await supabase
        .from('mining_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      return data as MiningStats;
    } catch (error) {
      console.error('Error fetching mining stats:', error);
      
      // If no stats exist, initialize them
      await this.initializeMiningStats(userId);
      
      // Then attempt to get them again
      return this.getMiningStats(userId);
    }
  }
  
  /**
   * Get recent mining activities for a user
   */
  async getMiningActivities(userId: string, count: number): Promise<MiningActivity[]> {
    try {
      const { data, error } = await supabase
        .from('mining_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(count);
      
      if (error) throw error;
      
      return data as MiningActivity[];
    } catch (error) {
      console.error('Error fetching mining activities:', error);
      return [];
    }
  }
  
  /**
   * Check mining status for a user
   */
  async checkMiningStatus(userId: string): Promise<boolean | undefined> {
    try {
      const { data, error } = await supabase
        .from('mining_stats')
        .select('is_mining')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error checking mining status:', error);
        return undefined;
      }
      
      return data?.is_mining || false;
    } catch (error) {
      console.error('Error checking mining status:', error);
      return undefined;
    }
  }
  
  /**
   * Send a mining heartbeat to keep session alive
   */
  async sendHeartbeat(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mining_stats')
        .update({
          last_heartbeat: new Date().toISOString() // Convert to string
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error sending heartbeat:', error);
      return false;
    }
  }
  
  /**
   * Initialize mining statistics for a new user
   */
  async initializeMiningStats(userId: string): Promise<boolean> {
    try {
      console.log(`Initializing mining statistics for user ${userId}`);
      
      const { error } = await supabase
        .from('mining_stats')
        .insert({
          user_id: userId,
          total_points: 0,
          total_tokens_earned: 0,
          daily_points: 0,
          daily_tokens_earned: 0,
          is_mining: false,
          mining_rate: 0.3, // Base mining rate
          efficiency_multiplier: 1.0,
          achievement_bonus: 0,
          streak_days: 0,
          current_speed_boost: 0, // Initialize speed boost at 0%
          max_speed_boost: 95, // Maximum speed boost is 95%
          effective_mining_rate: 0.3, // Initial effective rate equals base rate
          last_activity_at: new Date().toISOString(),
          last_inactive_check: new Date().toISOString(),
          daily_reset_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      console.log(`Mining statistics for user ${userId} initialized`);
      return true;
    } catch (error) {
      console.error('Error initializing mining statistics:', error);
      return false;
    }
  }
  
  /**
   * Archive old mining activities
   */
  async archiveOldActivities(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);
      const cutoffString = cutoff.toISOString();
      
      const { data, error, count } = await supabase
        .from('mining_activities')
        .delete()
        .lt('created_at', cutoffString);
      
      if (error) {
        console.error('Error archiving old mining activities:', error);
        return 0;
      }
      
      console.log(`Successfully archived ${count} old mining activities`);
      return count || 0;
    } catch (error) {
      console.error('Error archiving old mining activities:', error);
      return 0;
    }
  }
}
