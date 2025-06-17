
import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';
import ActivityHeader from './ActivityHeader';
import InactiveMiningState from './InactiveMiningState';
import TimeDisplay from './TimeDisplay';
import EfficiencyDisplay from './EfficiencyDisplay';
import ProgressDisplay from './ProgressDisplay';
import ActivityStats from './ActivityStats';
import ActivityButtons from './ActivityButtons';
import MiningStartFeedback from './MiningStartFeedback';
import { 
  ActivityType, 
  MINING_LIMITS, 
  normalizeMiningStats,
  formatDateForDatabase
} from '@/hooks/mining';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';

// Define local mining limits
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
    syncMiningState
  } = useMining();

  // Throttle sync to prevent excessive updates with boolean return type
  const throttledSyncState = useThrottledCallback(
    async () => {
      if (syncMiningState) {
        try {
          const result = await syncMiningState();
          return !!result;
        } catch (error) {
          return false;
        }
      }
      return false;
    },
    30000, // 30 second throttle
    [syncMiningState]
  );

  // Map the backend stats format to include both snake_case and camelCase properties
  const mappedStats = {
    // Original snake_case properties
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

  // Define a simplified useMiningStatus hook here instead of importing the problematic one
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [efficiency, setEfficiency] = useState(1.0);
  const [comboMultiplier, setComboMultiplier] = useState(1.0);
  const [totalEarnings, setTotalEarnings] = useState(mappedStats.total_tokens_earned);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Initialize time elapsed counter
  useEffect(() => {
    if (isMining && !startTime) {
      setStartTime(new Date());
    }
    
    if (!isMining) {
      setStartTime(null);
      setTimeElapsed(0);
    }
  }, [isMining, startTime]);

  // Update time elapsed
  useEffect(() => {
    if (!isMining || !startTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isMining, startTime]);

  // Sync mining state periodically using throttled function
  useEffect(() => {
    if (isMining) {
      const syncInterval = setInterval(() => {
        throttledSyncState();
      }, 30000);
      return () => clearInterval(syncInterval);
    }
  }, [isMining, throttledSyncState]);

  // Handle mining toggle
  const handleMiningToggle = useCallback(async () => {
    if (isStarting) return false;
    
    if (isMining) {
      try {
        setIsStarting(true);
        const result = await stopMining();
        if (result) {
          setStartTime(null);
          setTimeElapsed(0);
          toast.success("Mining stopped");
          return true;
        } else {
          toast.error("Failed to stop mining");
          return false;
        }
      } catch (error) {
        toast.error("Error stopping mining");
        return false;
      } finally {
        setIsStarting(false);
      }
    } else {
      try {
        setIsStarting(true);
        setStartError(null);
        const result = await startMining();
        if (result) {
          setStartTime(new Date());
          toast.success("Mining started");
          return true;
        } else {
          setStartError("Failed to start mining");
          toast.error("Failed to start mining");
          return false;
        }
      } catch (error) {
        setStartError("An error occurred");
        toast.error("Error starting mining");
        return false;
      } finally {
        setIsStarting(false);
      }
    }
  }, [isMining, isStarting, startMining, stopMining]);

  // Handle activity interactions
  const onInteraction = useCallback(async (type: ActivityType) => {
    if (!profile || !isMining) return false;
    
    try {
      const result = await recordActivity(type);
      if (result) {
        setComboMultiplier(prev => Math.min(2.0, prev + 0.05));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [profile, isMining, recordActivity]);

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
