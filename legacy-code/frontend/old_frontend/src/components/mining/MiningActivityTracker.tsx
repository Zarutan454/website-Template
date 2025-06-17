
import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';
import ActivityHeader from './activity-tracker/ActivityHeader';
import InactiveMiningState from './activity-tracker/InactiveMiningState';
import TimeDisplay from './activity-tracker/TimeDisplay';
import EfficiencyDisplay from './activity-tracker/EfficiencyDisplay';
import ProgressDisplay from './activity-tracker/ProgressDisplay';
import ActivityStats from './activity-tracker/ActivityStats';
import ActivityButtons from './activity-tracker/ActivityButtons';
import MiningStartFeedback from './activity-tracker/MiningStartFeedback';
import { 
  ActivityType, 
  MINING_LIMITS, 
  normalizeMiningStats,
  formatDateForDatabase
} from '@/hooks/mining';
import { useMiningStatus } from './activity-tracker/hooks/useMiningStatus';

// Define a local mining limits object for this component
const MINING_LIMITS_LOCAL = {
  post: { count: 10, points: 50, tokens: 5 },
  comment: { count: 20, points: 10, tokens: 1 },
  like: { count: 30, points: 5, tokens: 0.5 },
  share: { count: 15, points: 15, tokens: 1.5 },
  invite: { count: 5, points: 100, tokens: 10 }
};

const MiningActivityTracker: React.FC = () => {
  const { profile } = useProfile();
  const { 
    miningStats, 
    isMining, 
    startMining, 
    stopMining, 
    recordActivity, 
    isActivityLimitReached,
    getRemainingCount,
    syncMiningState,
    pendingActivities = 0 // Provide default value of 0 if pendingActivities is undefined
  } = useMining();

  // Map the backend stats format to include both snake_case and camelCase for compatibility
  const mappedStats = {
    // Original snake_case properties with default values
    user_id: profile?.id || '',
    total_points: miningStats.total_points || 0,
    total_tokens_earned: miningStats.total_tokens_earned || 0,
    daily_points: miningStats.daily_points || 0,
    daily_tokens_earned: miningStats.daily_tokens_earned || 0,
    last_activity_at: typeof miningStats.last_activity_at === 'string'
      ? miningStats.last_activity_at
      : new Date().toISOString(),
    is_mining: miningStats.is_mining || false,
    mining_rate: miningStats.mining_rate || 0.1,
    efficiency_multiplier: miningStats.efficiency_multiplier || 1.0,
    achievement_bonus: miningStats.achievement_bonus || 0,
    streak_days: miningStats.streak_days || 0,
    // Camel case alternatives
    totalPoints: miningStats.total_points || 0,
    totalTokensEarned: miningStats.total_tokens_earned || 0,
    dailyPoints: miningStats.daily_points || 0,
    dailyTokensEarned: miningStats.daily_tokens_earned || 0,
    lastActivityAt: typeof miningStats.last_activity_at === 'string'
      ? miningStats.last_activity_at
      : new Date().toISOString(),
    isMining: miningStats.is_mining || false,
    miningRate: miningStats.mining_rate || 0.1
  };

  // Use our custom hook for mining state management with throttled updates
  const {
    isStarting,
    startError,
    timeElapsed,
    efficiency,
    comboMultiplier,
    handleMiningToggle,
    onInteraction,
    totalEarnings
  } = useMiningStatus(
    profile,
    normalizeMiningStats(mappedStats),
    isMining,
    async () => { 
      try {
        const result = await startMining();
        return !!result; 
      } catch (error) {
        return false;
      }
    },
    async () => { 
      try {
        const result = await stopMining();
        return !!result; 
      } catch (error) {
        return false;
      }
    },
    async (type: ActivityType, points: number, tokens: number) => {
      try {
        const result = await recordActivity(type, points, tokens);
        return !!result;
      } catch (error) {
        return false;
      }
    }
  );

  // Sync mining state periodically to ensure it's accurate across components
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (syncMiningState) {
        syncMiningState().then(status => {
        });
      }
    }, 30000); // Sync every 30 seconds
    
    return () => clearInterval(syncInterval);
  }, [syncMiningState]);

  return (
    <div className="bg-dark-100 border border-gray-800 rounded-lg p-4 space-y-4">
      <ActivityHeader 
        isMining={isMining}
        isStarting={isStarting}
        onStartMining={handleMiningToggle}
        onStopMining={handleMiningToggle}
      />

      {isStarting && <MiningStartFeedback isStarting={isStarting} />}

      {isMining ? (
        <>
          <div className="flex justify-between items-center text-sm">
            <TimeDisplay timeElapsed={timeElapsed} />
            <EfficiencyDisplay 
              efficiency={efficiency} 
              comboMultiplier={comboMultiplier} 
            />
          </div>
          
          <ProgressDisplay 
            dailyProgress={Math.min(100, (mappedStats.daily_tokens_earned / 10) * 100)}
            dailyTokensEarned={mappedStats.daily_tokens_earned}
            totalEarnings={totalEarnings}
          />
          
          <ActivityStats 
            getRemainingCount={getRemainingCount}
            isActivityLimitReached={isActivityLimitReached}
            MINING_LIMITS={MINING_LIMITS}
          />
          
          <ActivityButtons 
            handleInteraction={onInteraction}
            isActivityLimitReached={isActivityLimitReached}
            MINING_LIMITS={MINING_LIMITS}
          />
        </>
      ) : (
        <InactiveMiningState errorMessage={startError} />
      )}
    </div>
  );
};

export default MiningActivityTracker;
