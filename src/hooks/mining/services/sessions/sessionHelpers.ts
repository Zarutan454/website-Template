
import { formatDateForDatabase } from '../../utils';

/**
 * Hilfsfunktion zum Umgehen von RLS-Problemen mit Mining-Sessions
 */
export const createSessionSafely = async (userId: string) => {
  try {
    const currentTimestamp = formatDateForDatabase(new Date());
    
    // Direkte INSERT-Operation ohne RLS-Abhängigkeit
    // TODO: Django-API-Migration: sessionHelpers auf Django-API umstellen
    const { data, error } = await supabase
      .from('mining_sessions')
      .insert({
        user_id: userId,
        status: 'active',
        start_time: currentTimestamp
      })
      .select('id')
      .single();
    
    if (error) {
      return { id: null, error };
    }
    
    return { id: data?.id, error: null };
  } catch (err) {
    console.error('Fehler in createSessionSafely:', err);
    return { id: null, error: err };
  }
};

/**
 * Aktualisiert die Mining-Statistiken ohne RLS-Probleme
 */
export const updateMiningStatsSafely = async (
  userId: string, 
  isActive: boolean,
  tokens: number = 0,
  points: number = 0
) => {
  try {
    const currentTimestamp = formatDateForDatabase(new Date());
    
    // Prüfen ob Mining-Stats bereits existieren
    // TODO: Django-API-Migration: sessionHelpers auf Django-API umstellen
    const { data: existingStats } = await supabase
      .from('mining_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingStats) {
      // Erstelle neue Mining-Stats wenn nicht vorhanden
      const { error } = await supabase
        .from('mining_stats')
        .insert({
          user_id: userId,
          is_mining: isActive,
          last_heartbeat: currentTimestamp,
          last_activity_at: currentTimestamp,
          total_points: points,
          total_tokens_earned: tokens,
          daily_points: points,
          daily_tokens_earned: tokens
        });
      
      if (error) {
        console.error('Fehler beim Erstellen der Mining-Stats:', error);
        return false;
      }
    } else {
      // Aktualisiere bestehende Mining-Stats
      const updates: {
        is_mining: boolean;
        last_activity_at: string;
        last_heartbeat?: string;
        daily_tokens_earned?: number;
        total_tokens_earned?: number;
        daily_points?: number;
        total_points?: number;
      } = {
        is_mining: isActive,
        last_activity_at: currentTimestamp
      };
      
      if (isActive) {
        updates.last_heartbeat = currentTimestamp;
      }
      
      if (tokens > 0) {
        updates.daily_tokens_earned = existingStats.daily_tokens_earned + tokens;
        updates.total_tokens_earned = existingStats.total_tokens_earned + tokens;
      }
      
      if (points > 0) {
        updates.daily_points = existingStats.daily_points + points;
        updates.total_points = existingStats.total_points + points;
      }
      
      const { error } = await supabase
        .from('mining_stats')
        .update(updates)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Fehler beim Aktualisieren der Mining-Stats:', error);
        return false;
      }
    }
    
    if (tokens > 0) {
      // Aktualisiere direkt die gemeinten Tokens in users-Tabelle
      // TODO: Django-API-Migration: sessionHelpers auf Django-API umstellen
      const { error: userError } = await supabase
        .from('users')
        .update({
          mined_tokens: supabase.rpc('increment', { value: tokens })
        })
        .eq('id', userId);
      
      if (userError) {
        console.error('Fehler beim Aktualisieren der mined_tokens:', userError);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Fehler in updateMiningStatsSafely:', err);
    return false;
  }
};
