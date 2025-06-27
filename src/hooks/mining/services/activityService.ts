
import { MiningActivity, ActivityType, ActivityResult } from '../types';
import { formatDateForDatabase } from '../types';

// Provide implementation for normalizeActivityType
export function normalizeActivityType(type: string): ActivityType {
  const validTypes: ActivityType[] = [
    'login', 'post', 'comment', 'like', 'share', 'invite', 'profile_update',
    'follow', 'achievement_unlocked', 'streak_bonus', 'daily_bonus', 'mining',
    'nft_like', 'nft_share', 'nft_purchase', 'token_like', 'token_share'
  ];
  
  if (validTypes.includes(type as ActivityType)) {
    return type as ActivityType;
  }
  // Default to login if type is invalid
  return 'login';
}

/**
 * Record an activity in the mining system and apply speed boost
 */
export const recordMiningActivity = async (
  userId: string, 
  type: ActivityType, 
  speedBoost: number,
  repository: { recordActivity: (userId: string, type: ActivityType, points: number, tokens: number, speedBoost: number) => Promise<MiningActivity> },
  currentStats: { current_speed_boost?: number, max_speed_boost?: number }
): Promise<ActivityResult> => {
  try {
    // Validate inputs
    if (!userId) throw new Error('User ID is required');
    if (!type) throw new Error('Activity type is required');
    
    // Normalize type to ensure it's a valid ActivityType
    const normalizedType = normalizeActivityType(type as string);
    
    const activityData = {
      userId,
      type: normalizedType,
      speedBoost,
      points: 0,  // No direct points awarded
      tokens: 0   // No direct tokens awarded
    };
    
    const currentBoost = currentStats?.current_speed_boost || 0;
    const maxBoost = currentStats?.max_speed_boost || 95;
    const newBoost = Math.min(currentBoost + speedBoost, maxBoost);
    
    const result = await repository.recordActivity(
      userId, 
      normalizedType, 
      0,  // No direct points
      0,  // No direct tokens
      newBoost  // Pass the new speed boost
    );
    
    if (result) {
      return {
        success: true,
        rewarded: true,
        speedBoost,
        newSpeedBoost: newBoost,
        points: 0,
        tokens: 0,
        newActivity: result
      };
    }
    
    return {
      success: false,
      rewarded: false,
      message: 'Failed to record activity'
    };
  } catch (error) {
    return {
      success: false,
      rewarded: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Format activity for display with proper timestamps
 */
export const formatActivityForDisplay = (activity: MiningActivity): MiningActivity => {
  return {
    ...activity,
    created_at: activity.created_at // Keep as string
  };
};

/**
 * Check if an activity result indicates a successful operation
 */
export const isSuccessfulActivity = (result: ActivityResult): boolean => {
  return result.success === true && result.rewarded === true;
};

/**
 * Get a user-friendly message for an activity result
 */
export const getActivityResultMessage = (result: ActivityResult): string => {
  if (result.success && result.rewarded) {
    return `Earned ${result.tokens} tokens and ${result.points} points`;
  } else if (result.success && !result.rewarded) {
    return result.message || 'Activity recorded but no rewards earned';
  } else {
    return result.message || 'Failed to record activity';
  }
};
