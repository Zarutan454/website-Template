
import { useState } from 'react';
import { MiningStats, MiningActivity } from './types';

/**
 * Hook für die Mining-Zustandsverwaltung
 */
export const useMiningState = () => {
  const [stats, setStats] = useState<MiningStats>({} as MiningStats);
  const [activities, setActivities] = useState<MiningActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateStats = (newStats: Partial<MiningStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  return {
    stats,
    setStats: updateStats,
    activities,
    setActivities,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
