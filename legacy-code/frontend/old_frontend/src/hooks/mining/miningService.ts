
import { MiningStats, MiningActivity, ActivityResult } from './types';
import { supabase } from '@/lib/supabase';
import { calculateReward } from './services/rewardsService';
import { 
  normalizeMiningStats, 
  calculateEfficiencyMultiplier,
  formatDateForDatabase 
} from './utils';
import { 
  isActivityLimitReached, 
  getRemainingCount 
} from './services/rewardsService';

/**
 * Prüft den Mining-Status und gibt die Gesundheit zurück
 */
export async function checkMiningHealth(userId: string): Promise<{ active: boolean, healthy: boolean }> {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .select('is_mining, last_heartbeat')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return { active: false, healthy: false };
    }
    
    // Prüfe, ob das letzte Heartbeat zu lange her ist (5 Minuten)
    const lastHeartbeat = new Date(data.last_heartbeat);
    const now = new Date();
    const timeDiff = now.getTime() - lastHeartbeat.getTime();
    const minutesDiff = timeDiff / 1000 / 60;
    
    const isActive = data.is_mining;
    const isHealthy = minutesDiff < 5;
    
    return { active: isActive, healthy: isHealthy && isActive };
  } catch (error) {
    console.error('Error in checkMiningHealth:', error);
    return { active: false, healthy: false };
  }
}

/**
 * Startet das Mining für einen Benutzer
 */
export async function startMining(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mining_stats')
      .update({
        is_mining: true,
        last_heartbeat: formatDateForDatabase(new Date())
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error starting mining:', error);
      return false;
    }
    
    // Logging des Statuswechsels
    const { error: historyError } = await supabase
      .from('mining_status_history')
      .insert({
        user_id: userId,
        previous_status: false,
        new_status: true,
        changed_at: formatDateForDatabase(new Date()),
        change_reason: 'manual_start'
      });
    
    if (historyError) {
      console.error('Error logging mining status change:', historyError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in startMining:', error);
    return false;
  }
}

/**
 * Stoppt das Mining für einen Benutzer
 */
export async function stopMining(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mining_stats')
      .update({
        is_mining: false
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error stopping mining:', error);
      return false;
    }
    
    // Logging des Statuswechsels
    const { error: historyError } = await supabase
      .from('mining_status_history')
      .insert({
        user_id: userId,
        previous_status: true,
        new_status: false,
        changed_at: formatDateForDatabase(new Date()),
        change_reason: 'manual_stop'
      });
    
    if (historyError) {
      console.error('Error logging mining status change:', historyError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in stopMining:', error);
    return false;
  }
}

/**
 * Initialisiert die Mining-Statistiken für einen neuen Benutzer
 */
export async function initializeMiningStats(userId: string): Promise<MiningStats | null> {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching mining stats:', error);
      return null;
    }
    
    if (data) {
      // Benutzer hat bereits Mining-Statistiken
      return normalizeMiningStats(data);
    }
    
    // Erstelle neue Mining-Statistiken für den Benutzer
    const initialStats = {
      user_id: userId,
      total_points: 0,
      total_tokens_earned: 0,
      daily_points: 0,
      daily_tokens_earned: 0,
      daily_posts_count: 0,
      daily_comments_count: 0,
      daily_likes_count: 0,
      daily_shares_count: 0,
      daily_invites_count: 0,
      is_mining: false,
      last_activity_at: new Date(),
      last_heartbeat: new Date(),
      daily_reset_at: new Date(),
      efficiency_multiplier: 1.0,
      mining_rate: 0.1,
      streak_days: 0,
      achievement_bonus: 0
    };
    
    const { data: newStats, error: insertError } = await supabase
      .from('mining_stats')
      .insert(initialStats)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating mining stats:', insertError);
      return null;
    }
    
    return normalizeMiningStats(newStats);
  } catch (error) {
    console.error('Error in initializeMiningStats:', error);
    return null;
  }
}

/**
 * Ruft die Mining-Statistiken für einen Benutzer ab
 */
export async function fetchMiningStats(userId: string): Promise<MiningStats | null> {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching mining stats:', error);
      return null;
    }
    
    return normalizeMiningStats(data);
  } catch (error) {
    console.error('Error in fetchMiningStats:', error);
    return null;
  }
}

/**
 * Aktualisiert den Mining-Status für einen Benutzer
 */
export async function updateMiningStatus(userId: string, isMining: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mining_stats')
      .update({
        is_mining: isMining,
        last_heartbeat: new Date()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating mining status:', error);
      return false;
    }
    
    // Logging des Statuswechsels
    const { error: historyError } = await supabase
      .from('mining_status_history')
      .insert({
        user_id: userId,
        previous_status: !isMining,
        new_status: isMining,
        changed_at: new Date(),
        change_reason: isMining ? 'manual_start' : 'manual_stop'
      });
    
    if (historyError) {
      console.error('Error logging mining status change:', historyError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateMiningStatus:', error);
    return false;
  }
}

/**
 * Sendet ein Heartbeat-Signal, um anzuzeigen, dass der Benutzer noch aktiv ist
 */
export async function sendHeartbeat(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mining_stats')
      .update({
        last_heartbeat: new Date()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error sending heartbeat:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendHeartbeat:', error);
    return false;
  }
}

/**
 * Ruft den aktuellen Mining-Status für einen Benutzer ab
 */
export async function checkMiningStatus(userId: string): Promise<boolean | undefined> {
  try {
    const { data, error } = await supabase
      .from('mining_stats')
      .select('is_mining, last_heartbeat')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking mining status:', error);
      return undefined;
    }
    
    // Prüfe, ob das letzte Heartbeat zu lange her ist (5 Minuten)
    const lastHeartbeat = new Date(data.last_heartbeat);
    const now = new Date();
    const timeDiff = now.getTime() - lastHeartbeat.getTime();
    const minutesDiff = timeDiff / 1000 / 60;
    
    // Wenn das letzte Heartbeat mehr als 5 Minuten her ist und der Status aktiv ist,
    // setze den Status automatisch auf inaktiv
    if (minutesDiff > 5 && data.is_mining) {
      await updateMiningStatus(userId, false);
      return false;
    }
    
    return data.is_mining;
  } catch (error) {
    console.error('Error in checkMiningStatus:', error);
    return undefined;
  }
}

/**
 * Zeichnet eine Mining-Aktivität auf und aktualisiert die Statistiken
 */
export async function recordActivity(
  userId: string,
  activityType: string,
  basePoints: number = 0,
  baseTokens: number = 0
): Promise<ActivityResult | null> {
  try {
    // Hole aktuelle Mining-Statistiken
    const stats = await fetchMiningStats(userId);
    
    if (!stats || !stats.is_mining) {
      return {
        rewarded: false,
        debounced: false,
        success: false,
        message: 'Mining ist nicht aktiv'
      };
    }
    
    // Prüfe, ob das Limit für die Aktivität erreicht ist
    if (isActivityLimitReached(activityType, stats)) {
      return {
        rewarded: false,
        debounced: false,
        success: false,
        message: 'Aktivitätslimit erreicht'
      };
    }
    
    // Berechne Belohnung basierend auf Effizienz-Multiplikator
    const efficiencyMultiplier = stats.efficiency_multiplier || 1.0;
    let { points, tokens } = calculateReward(activityType, stats, efficiencyMultiplier);
    
    // Wenn Basispunkte und -token angegeben wurden, verwende diese stattdessen
    if (basePoints > 0 || baseTokens > 0) {
      points = basePoints * efficiencyMultiplier;
      tokens = baseTokens * efficiencyMultiplier;
    }
    
    // Zeichne Aktivität auf
    const { data: activityData, error: activityError } = await supabase
      .from('mining_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        points: points,
        tokens_earned: tokens,
        efficiency_at_time: efficiencyMultiplier,
        mining_rate_at_time: stats.mining_rate || 0.1
      })
      .select()
      .single();
    
    if (activityError) {
      console.error('Error recording activity:', activityError);
      return {
        rewarded: false,
        debounced: false,
        success: false,
        message: 'Fehler beim Aufzeichnen der Aktivität'
      };
    }
    
    // Aktualisiere die Mining-Statistiken
    const updates: Record<string, number | Date> = {
      total_points: (stats.total_points || 0) + points,
      total_tokens_earned: (stats.total_tokens_earned || 0) + tokens,
      daily_points: (stats.daily_points || 0) + points,
      daily_tokens_earned: (stats.daily_tokens_earned || 0) + tokens,
      last_activity_at: new Date()
    };
    
    // Erhöhe den entsprechenden Aktivitätszähler
    switch (activityType) {
      case 'post':
        updates.daily_posts_count = (stats.daily_posts_count || 0) + 1;
        break;
      case 'comment':
        updates.daily_comments_count = (stats.daily_comments_count || 0) + 1;
        break;
      case 'like':
        updates.daily_likes_count = (stats.daily_likes_count || 0) + 1;
        break;
      case 'share':
        updates.daily_shares_count = (stats.daily_shares_count || 0) + 1;
        break;
      case 'invite':
        updates.daily_invites_count = (stats.daily_invites_count || 0) + 1;
        break;
    }
    
    const { error: updateError } = await supabase
      .from('mining_stats')
      .update(updates)
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating mining stats:', updateError);
      return {
        rewarded: true,
        debounced: false,
        success: false,
        message: 'Aktivität aufgezeichnet, aber Statistikaktualisierung fehlgeschlagen',
        points,
        tokens,
        newActivity: activityData
      };
    }
    
    return {
      rewarded: true,
      debounced: false,
      success: true,
      points,
      tokens,
      newActivity: activityData
    };
  } catch (error) {
    console.error('Error in recordActivity:', error);
    return {
      rewarded: false,
      debounced: false,
      success: false,
      message: 'Unerwarteter Fehler bei der Aktivitätsaufzeichnung'
    };
  }
}

/**
 * Ruft die Mining-Aktivitäten für einen Benutzer ab
 */
export async function fetchMiningActivities(userId: string, limit: number = 50): Promise<MiningActivity[]> {
  try {
    const { data, error } = await supabase
      .from('mining_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching mining activities:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchMiningActivities:', error);
    return [];
  }
}

// Füge diese Funktionen exportieren
export { isActivityLimitReached, getRemainingCount };
