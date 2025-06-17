
import { BaseRepository } from '../MiningRepositoryBase';

/**
 * Repository class for mining sessions
 */
export class MiningSessionRepository extends BaseRepository {
  /**
   * Starts mining for a user
   */
  async startMining(userId: string): Promise<boolean> {
    try {
      // Set mining status in mining_stats
      const { error: statsError } = await this.supabase.rpc('handle_mining_status_update', {
        user_id_param: userId,
        is_mining_param: true,
        update_heartbeat: true
      });
      
      if (statsError) throw statsError;
      
      // Create mining session (if the table exists)
      const { error: sessionError } = await this.supabase
        .from('mining_sessions')
        .insert({
          user_id: userId,
          start_time: new Date().toISOString(),
          status: 'active'
        });
      
      if (sessionError && sessionError.code !== '42P01') { // 42P01 = Table not found
        console.warn('[MiningSessionRepository] Mining-Sessions-Table not found:', sessionError);
      }
      
      return true;
    } catch (error) {
      console.error('[MiningSessionRepository] Error starting mining:', error);
      return false;
    }
  }
  
  /**
   * Stops mining for a user
   */
  async stopMining(userId: string): Promise<boolean> {
    try {
      console.log(`[MiningSessionRepository] Stopping mining for user ${userId}`);
      
      // Set mining status in mining_stats
      const { error: statsError } = await this.supabase.rpc('handle_mining_status_update', {
        user_id_param: userId,
        is_mining_param: false,
        update_heartbeat: true
      });
      
      if (statsError) throw statsError;
      
      // End active mining session (if the table exists)
      const { error: sessionError } = await this.supabase
        .from('mining_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('user_id', userId)
        .is('end_time', null);
      
      if (sessionError && sessionError.code !== '42P01') { // 42P01 = Table not found
        console.warn('[MiningSessionRepository] Mining-Sessions-Table not found:', sessionError);
      }
      
      console.log(`[MiningSessionRepository] Mining for user ${userId} stopped`);
      return true;
    } catch (error) {
      console.error('[MiningSessionRepository] Error stopping mining:', error);
      return false;
    }
  }
  
  /**
   * Checks the mining status of a user
   */
  async checkMiningStatus(userId: string): Promise<boolean> {
    try {
      console.log(`[MiningSessionRepository] Checking mining status for user ${userId}`);
      
      // Use covering index for more efficient querying
      const { data, error } = await this.supabase
        .from('mining_stats')
        .select('is_mining')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      console.log(`[MiningSessionRepository] Mining status for user ${userId}: ${data.is_mining}`);
      return data.is_mining;
    } catch (error) {
      console.error('[MiningSessionRepository] Error checking mining status:', error);
      return false;
    }
  }
  
  /**
   * Sends a heartbeat signal for active mining
   */
  async sendHeartbeat(userId: string): Promise<boolean> {
    try {
      console.log(`[MiningSessionRepository] Sending heartbeat for user ${userId}`);
      
      const { error } = await this.supabase.rpc('update_mining_heartbeat', {
        user_id_param: userId
      });
      
      if (error) throw error;
      
      console.log(`[MiningSessionRepository] Heartbeat for user ${userId} sent`);
      return true;
    } catch (error) {
      console.error('[MiningSessionRepository] Error sending heartbeat:', error);
      return false;
    }
  }
}
