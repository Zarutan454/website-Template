
import { useState, useEffect, useCallback } from 'react';
import { useMining } from '@/hooks/useMining';
import { ActivityType, ActivityResult, isActivityResult } from '@/hooks/mining/types';
import { toast } from 'sonner';

// Initial activity types with default counts
const INITIAL_ACTIVITY_COUNTS: Record<string, number> = {
  login: 0,
  post: 0,
  comment: 0,
  like: 0,
  share: 0,
  invite: 0,
  profile_update: 0,
  follow: 0,
  achievement_unlocked: 0,
  streak_bonus: 0,
  daily_bonus: 0,
  mining: 0,
  nft_like: 0,
  nft_share: 0,
  nft_purchase: 0,
  token_like: 0,
  token_share: 0
};

export const useActivityProcessor = (userId?: string) => {
  const { miningStats, recordActivity } = useMining();
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>(INITIAL_ACTIVITY_COUNTS);
  const [isPerformingAction, setIsPerformingAction] = useState<ActivityType | null>(null);
  
  // Sync activity counts from miningStats
  useEffect(() => {
    if (miningStats) {
      setActivityCounts(prev => ({
        ...prev,
        post: miningStats.daily_posts_count || 0,
        comment: miningStats.daily_comments_count || 0,
        like: miningStats.daily_likes_count || 0,
        share: miningStats.daily_shares_count || 0,
        invite: miningStats.daily_invites_count || 0,
        nft_like: miningStats.daily_nft_likes_count || 0,
        nft_share: miningStats.daily_nft_shares_count || 0,
        nft_purchase: miningStats.daily_nft_purchases_count || 0,
        token_like: miningStats.daily_token_likes_count || 0,
        token_share: miningStats.daily_token_shares_count || 0
      }));
    }
  }, [miningStats]);

  // Activity limits configuration
  const activityLimits: Record<string, number> = {
    post: 10,
    comment: 20,
    like: 30,
    share: 15,
    invite: 5,
    // Default to 0 for other activities
    login: 0,
    profile_update: 0,
    follow: 0,
    achievement_unlocked: 0,
    streak_bonus: 0,
    daily_bonus: 0,
    mining: 0,
    nft_like: 0,
    nft_share: 0,
    nft_purchase: 0,
    token_like: 0,
    token_share: 0
  };
  
  // Check if an activity is at its daily limit
  const isActivityLimitReached = useCallback((type: ActivityType): boolean => {
    // Get the count for this activity type
    const count = activityCounts[type] || 0;
    
    // Get the limit for this type, default to 0 if not found
    const limit = activityLimits[type] || 0;
    
    // Return true if the count is >= the limit
    return count >= limit;
  }, [activityCounts, activityLimits]);

  // Update a single activity count
  const updateActivityCount = useCallback((type: ActivityType) => {
    setActivityCounts(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));
  }, []);
  
  const processActivity = useCallback(async (
    type: ActivityType, 
    points: number = 0, 
    tokens: number = 0
  ): Promise<boolean> => {
    if (!userId) {
      return false;
    }
    
    try {
      setIsPerformingAction(type);
      
      // Check if activity limit reached
      if (isActivityLimitReached(type)) {
        toast.info(`Daily limit reached for ${type} activities`);
        setIsPerformingAction(null);
        return false;
      }

      const result = await recordActivity(type, points, tokens);
      
      // Using type guard to safely check if result is an ActivityResult object
      if (isActivityResult(result)) {
        if (result.success) {
          updateActivityCount(type);
          setIsPerformingAction(null);
          return true;
        }
        setIsPerformingAction(null);
        return false;
      }
      
      // Handle the case where result is a boolean
      if (typeof result === 'boolean') {
        if (result) {
          updateActivityCount(type);
          setIsPerformingAction(null);
          return true;
        }
      }
      
      setIsPerformingAction(null);
      return false;
    } catch (error) {
      toast.error(`Error with ${type} activity`);
      setIsPerformingAction(null);
      return false;
    }
  }, [userId, isActivityLimitReached, recordActivity, updateActivityCount]);
  
  return {
    activityCounts,
    processActivity,
    isPerformingAction,
    isActivityLimitReached
  };
};
