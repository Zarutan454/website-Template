
import { supabase } from '@/lib/supabase';
import { formatDateForDatabase } from '../utils';

// Intervall, nach dem ein Benutzer als inaktiv betrachtet wird (5 Minuten)
const INACTIVITY_THRESHOLD = 5 * 60 * 1000;

/**
 * Sendet einen Heartbeat, um zu signalisieren, dass der Benutzer aktiv ist
 */
export const sendHeartbeat = async (userId: string): Promise<boolean> => {
  try {
    // Direkte ISO-Zeichenfolge für PostgreSQL-Kompatibilität verwenden
    const currentTimestamp = formatDateForDatabase(new Date());
    
    // Mining-Statistiken mit dem letzten Heartbeat-Zeitstempel aktualisieren
    const { error } = await supabase
      .from('mining_stats')
      .update({
        last_heartbeat: currentTimestamp,
        last_activity_at: currentTimestamp
      })
      .eq('user_id', userId)
      .eq('is_mining', true);
      
    if (error) {
      console.error('Fehler beim Senden des Heartbeats:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Fehler in sendHeartbeat:', err);
    return false;
  }
};

/**
 * Prüft, ob Benutzer mit inaktiven Heartbeats existieren, und stoppt deren Mining
 */
export const checkInactiveMiners = async (): Promise<number> => {
  try {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - INACTIVITY_THRESHOLD / 60000);
    
    // Suche nach Benutzern mit fehlendem Heartbeat
    const { data, error } = await supabase.rpc('get_inactive_miners', {
      inactivity_minutes: INACTIVITY_THRESHOLD / 60000
    });
    
    if (error) {
      console.error('Fehler beim Prüfen inaktiver Miner:', error);
      return 0;
    }
    
    if (!data || data.length === 0) {
      return 0;
    }
    
    // Mining für jeden inaktiven Benutzer stoppen
    let stoppedCount = 0;
    
    for (const miner of data) {
      const { error: updateError } = await supabase.rpc('handle_mining_status_update', {
        user_id_param: miner.user_id,
        is_mining_param: false,
        update_heartbeat: false
      });
      
      if (!updateError) {
        stoppedCount++;
        
        // Mining-Sitzungen beenden
        await supabase
          .from('mining_sessions')
          .update({
            status: 'inactive',
            end_time: formatDateForDatabase(new Date())
          })
          .eq('user_id', miner.user_id)
          .is('end_time', null);
      }
    }
    
    return stoppedCount;
  } catch (err) {
    console.error('Fehler in checkInactiveMiners:', err);
    return 0;
  }
};

// Exportieren als benannte Exports und als Standard
export default {
  sendHeartbeat,
  checkInactiveMiners
};
