import { supabase } from '@/lib/supabase';
import { INACTIVITY_TIMEOUT } from '../constants';

/**
 * Sends a mining heartbeat to keep the mining session active
 * and checks for inactivity
 */
export const sendMiningHeartbeat = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('Cannot send heartbeat: No user ID provided');
    return false;
  }
  
  try {
    // Call the Supabase function to update the heartbeat
    const { data, error } = await supabase
      .from('mining_stats')
      .update({ 
        last_heartbeat: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Heartbeat error:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error sending mining heartbeat:', err);
    return false;
  }
};

/**
 * Checks if a user is inactive based on their last activity timestamp
 * and stops mining if they've been inactive for too long
 */
export const checkInactivity = async (userId: string, lastActivityAt: string): Promise<boolean> => {
  if (!userId || !lastActivityAt) {
    console.error('Cannot check inactivity: Missing required parameters');
    return false;
  }
  
  try {
    const lastActivity = new Date(lastActivityAt);
    const now = new Date();
    const inactiveTime = now.getTime() - lastActivity.getTime();
    
    if (inactiveTime > INACTIVITY_TIMEOUT) {
      const { data, error } = await supabase
        .from('mining_stats')
        .update({ 
          is_mining: false,
          last_inactive_check: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error stopping mining due to inactivity:', error);
        return false;
      }
      
      return true;
    }
    
    const { data, error } = await supabase
      .from('mining_stats')
      .update({ 
        last_inactive_check: now.toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating inactive check timestamp:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error checking inactivity:', err);
    return false;
  }
};
