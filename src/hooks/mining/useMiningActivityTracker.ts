
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMining } from '@/hooks/useMining';

type ActivityType = 'post' | 'comment' | 'like' | 'share' | 'invite';

export const useMiningActivityTracker = (userId?: string) => {
  const { recordActivity, isActivityLimitReached } = useMining();
  const [isPerformingAction, setIsPerformingAction] = useState<ActivityType | null>(null);

  // Mining-Aktivität im Feed aufzeichnen
  const trackFeedActivity = useCallback(
    async (activityType: ActivityType) => {
      if (!userId) {
        return false;
      }

      if (isActivityLimitReached(activityType)) {
        toast.info(`Du hast das tägliche Limit für ${getActivityName(activityType)} erreicht.`);
        return false;
      }

      try {
        setIsPerformingAction(activityType);

        const rewardPoints = getRewardPoints(activityType);
        const rewardTokens = getRewardTokens(activityType);

        // Aktivität aufzeichnen
        const success = await recordActivity(activityType, rewardPoints, rewardTokens);

        if (success) {
          toast.success(
            `+${rewardPoints} Punkte, +${rewardTokens} Tokens für ${getActivityName(activityType)}!`,
            { duration: 2000 }
          );
        }

        return success;
      } catch (error) {
        console.error(`Fehler beim Aufzeichnen der ${activityType}-Aktivität:`, error);
        return false;
      } finally {
        setIsPerformingAction(null);
      }
    },
    [userId, recordActivity, isActivityLimitReached]
  );

  // Belohnungspunkte für verschiedene Aktivitätstypen
  const getRewardPoints = (activityType: ActivityType): number => {
    const pointsMap: Record<ActivityType, number> = {
      post: 50,
      comment: 10,
      like: 5,
      share: 15,
      invite: 100
    };
    return pointsMap[activityType] || 0;
  };

  // Token-Belohnungen für verschiedene Aktivitätstypen
  const getRewardTokens = (activityType: ActivityType): number => {
    const tokensMap: Record<ActivityType, number> = {
      post: 5,
      comment: 1,
      like: 0.5,
      share: 1.5,
      invite: 10
    };
    return tokensMap[activityType] || 0;
  };

  // Namen für verschiedene Aktivitätstypen
  const getActivityName = (activityType: ActivityType): string => {
    const nameMap: Record<ActivityType, string> = {
      post: 'Beiträge',
      comment: 'Kommentare',
      like: 'Likes',
      share: 'Teilen',
      invite: 'Einladungen'
    };
    return nameMap[activityType] || activityType;
  };

  return {
    trackFeedActivity,
    isPerformingAction
  };
};
