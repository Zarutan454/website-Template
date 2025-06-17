
import { supabase } from '@/lib/supabase';

/**
 * Prüft, ob ein Mining-Stats-Eintrag für den Benutzer existiert
 */
export const checkMiningStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      return { existingStats: null, error };
    }
    
    return { existingStats: data, error: null };
  } catch (err) {
    return { existingStats: null, error: err };
  }
};
