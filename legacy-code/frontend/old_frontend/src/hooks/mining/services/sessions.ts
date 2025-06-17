import { toast } from 'sonner';
import { checkMiningStats } from './sessions/checkMiningStats';
import { createMiningStats } from './sessions/createMiningStats';
import { updateMiningStatus } from './sessions/updateMiningStatus';
import { createSession, endActiveSessions } from './sessions/manageSessions';
import { supabase } from '@/lib/supabase';
import { sendHeartbeat } from './heartbeatService';

// Start mining for user
export const startMining = async (userId: string) => {
  try {
    // Use direct ISO string format that PostgreSQL can handle properly
    const currentTimestamp = new Date().toISOString();
    
    // Check if mining_stats record exists for the user
    const { existingStats, error: checkError } = await checkMiningStats(userId);
    
    if (checkError) throw checkError;
    
    let statsData;
    
    // If record doesn't exist, create it first
    if (!existingStats) {
      console.log("No mining stats found for user, creating new record");
      const { data: newStats, error: createError } = await createMiningStats(userId, currentTimestamp);
      
      if (createError) throw createError;
      statsData = newStats;
    } else {
      // Update existing record
      const { data, error } = await updateMiningStatus(userId, true, currentTimestamp);
      
      if (error) throw error;
      statsData = data;
    }
    
    // Try to use RPC function for safer status update
    try {
      await supabase.rpc('handle_mining_status_update', {
        user_id_param: userId,
        is_mining_param: true,
        update_heartbeat: true
      });
      console.log('Mining status updated via RPC function');
    } catch (rpcError) {
      console.log('RPC function call failed, continuing with standard approach');
    }
    
    try {
      // Create mining session with consistent timestamp format
      const { data: sessionData, error: sessionError } = await createSession(userId, currentTimestamp);
        
      if (sessionError) {
        console.error("Error creating mining session:", sessionError);
        // Continue despite the error, the most important part (mining stats) was updated
        return statsData;
      }
      
      // Send a heartbeat immediately to confirm mining is active
      await sendHeartbeat(userId);
    } catch (sessionErr) {
      console.error("Error in session creation:", sessionErr);
      // Return stats data even if session creation failed
      // This allows mining to work even if sessions have RLS issues
    }
    
    return statsData;
  } catch (error) {
    console.error("Error in startMining:", error);
    throw error;
  }
};

// Stop mining for user
export const stopMining = async (userId: string) => {
  try {
    console.log(`Stopping mining for user: ${userId}`);
    
    // Use direct ISO string format that PostgreSQL can handle properly
    const currentTimestamp = new Date().toISOString();
    
    // Check if mining_stats record exists for the user
    const { existingStats, error: checkError } = await checkMiningStats(userId);
    
    if (checkError) throw checkError;
    
    if (!existingStats) {
      console.error("No mining stats found for user:", userId);
      return null;
    }
    
    // Try to use RPC function for safer status update
    try {
      await supabase.rpc('handle_mining_status_update', {
        user_id_param: userId,
        is_mining_param: false,
        update_heartbeat: true
      });
      console.log('Mining status updated via RPC function');
    } catch (rpcError) {
      console.log('RPC function call failed, continuing with standard approach');
      
      // Update mining status through direct update
      const { data, error } = await updateMiningStatus(userId, false, currentTimestamp);
      
      if (error) throw error;
    }
    
    // End active mining sessions
    await endActiveSessions(userId, currentTimestamp);
    
    return existingStats;
  } catch (error) {
    console.error("Error in stopMining:", error);
    throw error;
  }
};

// Send heartbeat to keep mining session active
const sendMiningHeartbeat = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('update_mining_heartbeat', {
      user_id_param: userId
    });
    
    if (error) {
      console.error("Error sending mining heartbeat:", error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error("Error in sendHeartbeat:", error);
    return false;
  }
};

// Get mining history for a user
export const getMiningHistory = async (userId: string, limit = 10) => {
  try {
    console.log(`Getting mining history for user: ${userId}`);
    const { data, error } = await supabase
      .from('mining_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching mining history:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getMiningHistory:", error);
    return [];
  }
};

// Export the heartbeat function too
export { sendMiningHeartbeat };
