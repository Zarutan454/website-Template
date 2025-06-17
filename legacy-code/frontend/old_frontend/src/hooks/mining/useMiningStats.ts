
import { useState, useCallback } from 'react';
import { MiningStats, formatDateForDatabase } from './types';
import { miningRepository } from '@/repositories/MiningRepository';

export const useMiningStats = () => {
  const [miningStats, setMiningStats] = useState<MiningStats>({
    user_id: '', // Initialize with empty string to satisfy the type constraint
    total_points: 0,
    total_tokens_earned: 0,
    daily_points: 0,
    daily_tokens_earned: 0,
    last_activity_at: new Date().toISOString(), // Convert Date to string
    is_mining: false,
    mining_rate: 0.1,
    efficiency_multiplier: 1.0,
    achievement_bonus: 0,
    streak_days: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMiningStats = useCallback(async (userId: string) => {
    if (!userId) {
      setError('No user ID provided');
      return null;
    }

    try {
      setIsLoading(true);
      setError('');
      const stats = await miningRepository.getMiningStats(userId);
      
      // Ensure all properties exist with snake_case naming
      const normalizedStats: MiningStats = {
        ...stats,
        // Ensure snake_case properties
        user_id: userId, // Set user_id based on parameter
        total_points: stats.total_points,
        total_tokens_earned: stats.total_tokens_earned,
        daily_points: stats.daily_points,
        daily_tokens_earned: stats.daily_tokens_earned,
        last_activity_at: stats.last_activity_at,
        is_mining: stats.is_mining,
        mining_rate: stats.mining_rate,
        efficiency_multiplier: stats.efficiency_multiplier || 1.0,
        achievement_bonus: stats.achievement_bonus || 0,
        streak_days: stats.streak_days || 0
      };
      
      setMiningStats(normalizedStats);
      return normalizedStats;
    } catch (err) {
      setError('Failed to load mining statistics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    miningStats,
    setMiningStats,
    isLoading,
    error,
    fetchMiningStats
  };
}
