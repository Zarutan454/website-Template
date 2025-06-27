import { supabase } from '@/lib/supabase';
import { formatDateForDatabase } from '../../utils';

/**
 * Erstellt eine neue Mining-Session für einen Benutzer
 */
export const createSession = async (userId: string, currentTimestamp: string) => {
  try {
    // Eine neue Mining-Session für den Benutzer erstellen
    const { data, error } = await supabase
      .from('mining_sessions')
      .insert({
        user_id: userId,
        status: 'active',
        start_time: currentTimestamp
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating mining session:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in createSession:', err);
    return { data: null, error: err };
  }
};

/**
 * Beendet alle aktiven Mining-Sessions für einen Benutzer
 */
export const endActiveSessions = async (userId: string, currentTimestamp: string) => {
  try {
    // Alle aktiven Sessions für den Benutzer beenden
    const { data, error } = await supabase
      .from('mining_sessions')
      .update({
        status: 'completed',
        end_time: currentTimestamp
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select();
    
    if (error) {
      console.error('Error ending mining sessions:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in endActiveSessions:', err);
    return { data: null, error: err };
  }
};

/**
 * Prüft Mining-Sessions auf Inaktivität und beendet sie automatisch
 */
export const cleanupInactiveSessions = async (inactivityThresholdHours: number = 3) => {
  try {
    const currentTimestamp = new Date().toISOString();
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - inactivityThresholdHours);
    const thresholdTimestamp = thresholdDate.toISOString();
    
    // Alle inaktiven Sessions identifizieren und beenden
    const { data, error } = await supabase
      .from('mining_sessions')
      .update({
        status: 'auto_terminated',
        end_time: currentTimestamp
      })
      .eq('status', 'active')
      .lt('updated_at', thresholdTimestamp)
      .select();
    
    if (error) {
      console.error('Error cleaning up inactive sessions:', error);
      return { data: null, error };
    }
    
    return { data, error: null, count: data?.length || 0 };
  } catch (err) {
    console.error('Exception in cleanupInactiveSessions:', err);
    return { data: null, error: err, count: 0 };
  }
};
