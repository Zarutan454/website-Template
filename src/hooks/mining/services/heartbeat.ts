// import { supabase } from '@/lib/supabase'; // TODO: Remove Supabase dependency
import djangoApi from '@/lib/django-api-new';
import { INACTIVITY_TIMEOUT } from '../constants';

/**
 * Sends a mining heartbeat to keep the mining session active
 */
export const sendMiningHeartbeat = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('Cannot send heartbeat: No user ID provided');
    return false;
  }
  try {
    const response = await djangoApi.patch('/mining/heartbeat/', {});
    return response.status === 200;
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
      // Stop mining due to inactivity
      const response = await djangoApi.post('/mining/stop/', {});
      return response.status === 200;
    }
    // Update inactive check timestamp
    const response = await djangoApi.patch('/mining/activity-check/', {});
    return response.status === 200;
  } catch (err) {
    console.error('Error checking inactivity:', err);
    return false;
  }
};
