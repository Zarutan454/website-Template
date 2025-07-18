
// TODO: Django-API-Migration: intervals auf Django-API umstellen

interface MiningInterval {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  tokens_earned: number;
  points_earned: number;
  is_active: boolean;
}

/**
 * Erstelle ein neues Mining-Intervall beim Starten des Minings
 */
export const createMiningInterval = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const now = new Date().toISOString();
    
    // TODO: Django-API-Migration: intervals auf Django-API umstellen
    // const { data, error } = await supabase
    //   .from('mining_intervals')
    //   .insert([{
    //     user_id: userId,
    //     start_time: now,
    //     end_time: null,
    //     tokens_earned: 0,
    //     points_earned: 0,
    //     is_active: true
    //   }])
    //   .select('id')
    //   .single();
      
    // if (error) {
    //   console.error('Error creating mining interval:', error);
    //   return null;
    // }
    
    // return data.id;
    return null; // Placeholder for Django API call
  } catch (err) {
    console.error('Error in createMiningInterval:', err);
    return null;
  }
};

/**
 * Beende ein aktives Mining-Intervall
 */
export const endMiningInterval = async (
  userId: string,
  tokensEarned: number = 0,
  pointsEarned: number = 0
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const now = new Date().toISOString();
    
    // TODO: Django-API-Migration: intervals auf Django-API umstellen
    // // Finde das aktive Intervall für diesen Benutzer
    // const { data: intervalData, error: fetchError } = await supabase
    //   .from('mining_intervals')
    //   .select('id')
    //   .eq('user_id', userId)
    //   .eq('is_active', true)
    //   .order('start_time', { ascending: false })
    //   .limit(1);
      
    // if (fetchError || !intervalData || intervalData.length === 0) {
    //   console.error('No active mining interval found:', fetchError);
    //   return false;
    // }
    
    // const intervalId = intervalData[0].id;
    
    // // Aktualisiere das Intervall
    // const { error: updateError } = await supabase
    //   .from('mining_intervals')
    //   .update({
    //     end_time: now,
    //     tokens_earned: tokensEarned,
    //     points_earned: pointsEarned,
    //     is_active: false
    //   })
    //   .eq('id', intervalId);
      
    // if (updateError) {
    //   console.error('Error ending mining interval:', updateError);
    //   return false;
    // }
    
    return true; // Placeholder for Django API call
  } catch (err) {
    console.error('Error in endMiningInterval:', err);
    return false;
  }
};

/**
 * Lade Mining-Intervalle für einen Benutzer
 */
export const getMiningIntervals = async (userId: string, limit: number = 10): Promise<MiningInterval[]> => {
  if (!userId) return [];
  
  try {
    // TODO: Django-API-Migration: intervals auf Django-API umstellen
    // const { data, error } = await supabase
    //   .from('mining_intervals')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('start_time', { ascending: false })
    //   .limit(limit);
      
    // if (error) {
    //   console.error('Error getting mining intervals:', error);
    //   return [];
    // }
    
    // return data || [];
    return []; // Placeholder for Django API call
  } catch (err) {
    console.error('Error in getMiningIntervals:', err);
    return [];
  }
};

/**
 * Lade aktive Mining-Intervalle für einen Benutzer
 */
export const getActiveMiningIntervals = async (userId: string): Promise<MiningInterval[]> => {
  if (!userId) return [];
  
  try {
    // TODO: Django-API-Migration: intervals auf Django-API umstellen
    // const { data, error } = await supabase
    //   .from('mining_intervals')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .eq('is_active', true)
    //   .order('start_time', { ascending: false });
      
    // if (error) {
    //   console.error('Error getting active mining intervals:', error);
    //   return [];
    // }
    
    // return data || [];
    return []; // Placeholder for Django API call
  } catch (err) {
    console.error('Error in getActiveMiningIntervals:', err);
    return [];
  }
};

export default {
  createMiningInterval,
  endMiningInterval,
  getMiningIntervals,
  getActiveMiningIntervals
};
