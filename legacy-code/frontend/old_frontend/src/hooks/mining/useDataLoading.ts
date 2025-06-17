
import { useEffect } from 'react';
import { useMiningStats } from './useMiningStats';
import { MiningStats } from './types';

export const useDataLoading = (
  isMining: boolean,
  miningStats: MiningStats,
  syncMiningState?: () => Promise<boolean>,
  intervalTime: number = 60000 // Default 1 minute
) => {
  const progressPercent = ((miningStats.daily_tokens_earned || 0) / 10) * 100;
  const isComplete = progressPercent >= 100;

  // Effect to periodically sync mining state when active
  useEffect(() => {
    if (!isMining || !syncMiningState) return;

    // Initial sync on mount if mining is active
    syncMiningState();

    // Set up interval for continuous updates
    const intervalId = setInterval(() => {
      syncMiningState();
    }, intervalTime);

    return () => {
      clearInterval(intervalId);
    };
  }, [isMining, syncMiningState, intervalTime]);

  return {
    progressPercent: Math.min(100, progressPercent),
    isComplete,
    miningRate: miningStats.mining_rate || 0.1
  };
};
