
import { supabase } from '@/lib/supabase';
import { formatDateForDatabase } from '../utils';

/**
 * Aktualisiert die geminte Token-Anzahl im Benutzerprofil
 */
export const updateUserMinedTokens = async (
  userId: string, 
  tokensEarned: number
): Promise<boolean> => {
  try {
    // Don't attempt to update if token amount is 0
    if (tokensEarned <= 0) {
      return true;
    }
    
    // First, try using RPC function which is more reliable
    try {
      const { error: rpcError } = await supabase.rpc('increment_mined_tokens', { 
        user_id_param: userId,
        increment_value: tokensEarned
      });
      
      if (rpcError) {
        console.error('Error using RPC to update tokens:', rpcError);
        throw rpcError;
      }
      
      console.log('Tokens updated using RPC function');
      return true;
    } catch (rpcError) {
      console.error('Error using RPC to update tokens:', rpcError);
      
      // Fallback: Direct update if RPC fails
      const { error: directUpdateError } = await supabase
        .from('users')
        .update({
          mined_tokens: supabase.rpc('increment_decimal', { value: tokensEarned }),
          updated_at: formatDateForDatabase(new Date())
        })
        .eq('id', userId);
        
      if (directUpdateError) {
        console.error('Error in direct update of mined tokens:', directUpdateError);
        return false;
      }
    }
    
    console.log(`Successfully updated tokens for user ${userId}`);
    return true;
  } catch (err) {
    console.error('Error in updateUserMinedTokens:', err);
    return false;
  }
};

/**
 * Erstellt einen Eintrag im Mining-Rewards-Verlauf
 */
export const recordMiningReward = async (
  userId: string,
  tokensEarned: number,
  source: string
): Promise<boolean> => {
  try {
    console.log(`Recording reward of ${tokensEarned} tokens for user ${userId} from source ${source}`);
    const { error } = await supabase
      .from('mining_rewards')
      .insert({
        user_id: userId,
        tokens_earned: tokensEarned,
        source: source,
        created_at: formatDateForDatabase(new Date())
      });
      
    if (error) {
      console.error('Error recording mining reward:', error);
      return false;
    }
    
    console.log('Mining reward recorded successfully');
    return true;
  } catch (err) {
    console.error('Error in recordMiningReward:', err);
    return false;
  }
};

/**
 * Prüft, ob der Benutzer das tägliche Aktivitätslimit erreicht hat
 */
export const checkDailyActivityLimit = async (
  userId: string,
  limit: number = 10
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('daily_activity_count, last_activity_reset')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error checking daily activity limit:', error);
      return false;
    }
    
    // Wenn kein Datum für den letzten Reset oder wenn es vor heute liegt, zurücksetzen
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastReset = data.last_activity_reset ? new Date(data.last_activity_reset) : null;
    
    if (!lastReset || lastReset < today) {
      // Zurücksetzen des Zählers und Aktualisieren des Reset-Datums
      await supabase
        .from('users')
        .update({
          daily_activity_count: 0,
          last_activity_reset: formatDateForDatabase(today)
        })
        .eq('id', userId);
        
      return false; // Limit nicht erreicht nach Reset
    }
    
    return (data.daily_activity_count || 0) >= limit;
  } catch (err) {
    console.error('Error in checkDailyActivityLimit:', err);
    return false;
  }
};

/**
 * Inkrementiert den täglichen Aktivitätszähler
 */
export const incrementDailyActivity = async (userId: string): Promise<boolean> => {
  try {
    // Direktes Update statt RPC-Aufruf
    const { error } = await supabase
      .from('users')
      .update({
        daily_activity_count: supabase.rpc('increment', { value: 1 })
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error incrementing daily activity count:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in incrementDailyActivity:', err);
    return false;
  }
};

/**
 * Lädt die Mining-Rewards für einen Benutzer
 */
interface MiningReward {
  id: string;
  user_id: string;
  tokens_earned: number;
  source: string;
  created_at: string;
}

export const getUserMiningRewards = async (
  userId: string,
  limit: number = 10
): Promise<MiningReward[]> => {
  try {
    const { data, error } = await supabase
      .from('mining_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching user mining rewards:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getUserMiningRewards:', err);
    return [];
  }
};
