
import { supabase } from '@/lib/supabase';
import { formatDateForDatabase } from '../utils';

// Maximum number of daily activities allowed
const DAILY_ACTIVITY_LIMIT = 10;

/**
 * Checks if a user has reached their daily activity limit (10 activities)
 */
export const checkDailyActivityLimit = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('mining_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', formatDateForDatabase(today))
      .not('activity_type', 'eq', 'mining'); // Exclude passive mining activities
    
    if (error) {
      console.error('Error checking daily activity limit:', error);
      return false;
    }
    
    return (count || 0) >= DAILY_ACTIVITY_LIMIT;
  } catch (err) {
    console.error('Exception in checkDailyActivityLimit:', err);
    return false;
  }
};

/**
 * Gets the count of activities performed today by type
 */
export const getActivityCountByType = async (userId: string, activityType: string): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('mining_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .gte('created_at', formatDateForDatabase(today));
    
    if (error) {
      console.error(`Error getting ${activityType} count:`, error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error(`Exception in getActivityCountByType (${activityType}):`, err);
    return 0;
  }
};

export default {
  checkDailyActivityLimit,
  getActivityCountByType,
  DAILY_ACTIVITY_LIMIT
};
