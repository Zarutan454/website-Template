
import { formatDateForDatabase } from '../utils';

// TODO: Django-API-Migration: maintenance auf Django-API umstellen
// Check and stop inactive miners
export const checkAndStopInactiveMiners = async (inactivityMinutes: number = 60): Promise<number> => {
  try {
    // Get inactive miners using database function
    const { data, error } = await supabase
      .rpc('get_inactive_miners', { inactivity_minutes: inactivityMinutes });
      
    if (error) {
      console.error('Error checking inactive miners:', error);
      return 0;
    }
    
    const inactiveUsers = data || [];
    
    // Stop mining for each inactive user
    for (const user of inactiveUsers) {
      await supabase
        .from('mining_stats')
        .update({
          is_mining: false,
          last_activity_at: formatDateForDatabase(new Date())
        })
        .eq('user_id', user.user_id);
        
      // Close active sessions
      await supabase
        .from('mining_sessions')
        .update({
          status: 'auto_terminated',
          end_time: formatDateForDatabase(new Date())
        })
        .eq('user_id', user.user_id)
        .eq('status', 'active');
        
      // Record status change
      await supabase
        .from('mining_status_history')
        .insert({
          user_id: user.user_id,
          previous_status: true,
          new_status: false,
          change_reason: 'inactivity'
        });
    }
    
    return inactiveUsers.length;
  } catch (err) {
    console.error('Error in checkAndStopInactiveMiners:', err);
    return 0;
  }
};

// Cleanup stale mining states
export const cleanupStaleMiningStates = async (): Promise<number> => {
  try {
    // Call the database function to cleanup stale mining states
    const { data, error } = await supabase
      .rpc('cleanup_stale_mining_states', { auto_cleanup: true });
      
    if (error) {
      console.error('Error cleaning up stale mining states:', error);
      return 0;
    }
    
    return data || 0;
  } catch (err) {
    console.error('Error in cleanupStaleMiningStates:', err);
    return 0;
  }
};

export default {
  checkAndStopInactiveMiners,
  cleanupStaleMiningStates
};
