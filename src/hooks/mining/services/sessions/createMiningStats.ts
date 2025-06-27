
import { supabase } from '@/lib/supabase';

/**
 * Erstellt einen Mining-Stats-Eintrag für einen Benutzer
 */
export const createMiningStats = async (userId: string, currentTimestamp: string) => {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .insert({
        user_id: userId,
        is_mining: true,
        total_points: 0,
        total_tokens_earned: 0,
        daily_points: 0,
        daily_tokens_earned: 0,
        last_activity_at: currentTimestamp,
        last_heartbeat: currentTimestamp
      })
      .select()
      .single();
    
    if (error) {
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
