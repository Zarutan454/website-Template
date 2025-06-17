
import { supabase } from '@/lib/supabase';

/**
 * Aktualisiert den Mining-Status für einen Benutzer
 */
export const updateMiningStatus = async (userId: string, isActive: boolean, currentTimestamp: string) => {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .update({
        is_mining: isActive,
        last_activity_at: currentTimestamp,
        last_heartbeat: currentTimestamp
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating mining status:', error);
      return { data: null, error };
    }
    
    // Optional: Einen Eintrag in der Mining-Status-History erstellen
    try {
      await supabase
        .from('mining_status_history')
        .insert({
          user_id: userId,
          previous_status: !isActive,
          new_status: isActive,
          change_reason: isActive ? 'user_started' : 'user_stopped'
        });
    } catch (historyError) {
      console.error('Error recording mining status history:', historyError);
      // Wir fahren trotzdem fort, da dies nur ein Zusatzfeature ist
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in updateMiningStatus:', err);
    return { data: null, error: err };
  }
};
