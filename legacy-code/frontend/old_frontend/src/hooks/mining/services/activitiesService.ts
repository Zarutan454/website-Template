import { MiningActivity, MiningStats } from '../types';
import { normalizeActivity } from '../types';

/**
 * Transform a list of mining activities for display or processing
 */
export const transformActivities = (activities: MiningActivity[]): MiningActivity[] => {
  return activities.map(normalizeActivity);
};

// Alternative for transformMiningActivities (to replace the missing import)
export const transformMiningActivities = (activities: MiningActivity[]): MiningActivity[] => {
  return activities.map(normalizeActivity);
};

// Alternative for transformMiningActivity (to replace the missing import)
export const transformMiningActivity = (activity: MiningActivity): MiningActivity => {
  return normalizeActivity(activity);
};

/**
 * Find all activities of a specific type
 */
export const filterActivitiesByType = (
  activities: MiningActivity[], 
  activityType: string
): MiningActivity[] => {
  return activities.filter(activity => activity.activity_type === activityType);
};

/**
 * Calculate total tokens earned from a list of activities
 */
export const calculateTotalTokens = (activities: MiningActivity[]): number => {
  return activities.reduce((sum, activity) => sum + (activity.tokens_earned || 0), 0);
};

/**
 * Calculate total points earned from a list of activities
 */
export const calculateTotalPoints = (activities: MiningActivity[]): number => {
  return activities.reduce((sum, activity) => sum + (activity.points || 0), 0);
};

/**
 * Get the most recent activity
 */
export const getMostRecentActivity = (activities: MiningActivity[]): MiningActivity | null => {
  if (!activities || activities.length === 0) return null;
  
  const sorted = [...activities].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
  
  return sorted[0];
};

/**
 * Sort activities by date
 */
export const sortActivitiesByDate = (
  activities: MiningActivity[], 
  direction: 'asc' | 'desc' = 'desc'
): MiningActivity[] => {
  return [...activities].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return direction === 'desc' ? dateB - dateA : dateA - dateB;
  });
};
