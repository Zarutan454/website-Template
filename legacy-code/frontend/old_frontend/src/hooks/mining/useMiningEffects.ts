
import { useEffect, useCallback } from 'react';
import { MiningStats } from './types';

export const useMiningEffects = (
  isMining: boolean, 
  miningRate: number, 
  setMiningStats: React.Dispatch<React.SetStateAction<MiningStats>>
) => {
  // Update mining stats continuously when mining is active
  useEffect(() => {
    if (!isMining) return;
    
    // Calculate tokens earned per second
    const tokensPerSecond = miningRate / 60;
    
    const updateInterval = setInterval(() => {
      setMiningStats((prevStats) => {
        // Calculate new token balances
        const newTotalTokens = 
          (prevStats.total_tokens_earned || 0) + tokensPerSecond;
        const newDailyTokens = 
          (prevStats.daily_tokens_earned || 0) + tokensPerSecond;
        
        // Update with snake_case properties
        return {
          ...prevStats,
          total_tokens_earned: newTotalTokens,
          daily_tokens_earned: newDailyTokens
        };
      });
    }, 1000); // Update every second
    
    return () => clearInterval(updateInterval);
  }, [isMining, miningRate, setMiningStats]);
  
  // Return any helper functions if needed
  return {
    // For now, this hook is mainly side effects
  };
};
