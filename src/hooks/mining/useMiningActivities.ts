import { useState, useCallback } from 'react';
import { MiningActivity } from './types';
import MiningRepository from '@/repositories/MiningRepository';

export const useMiningActivities = () => {
  const [activities, setActivities] = useState<MiningActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshActivities = useCallback(async (userId?: string, limit: number = 20) => {
    if (!userId) {
      setError('No user ID provided');
      return [];
    }

    try {
      setIsLoading(true);
      setError('');
      const fetchedActivities = await MiningRepository.getMiningActivities(userId, limit);
      setActivities(fetchedActivities);
      return fetchedActivities;
    } catch (err) {
      setError('Failed to load mining activities');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    activities,
    setActivities,
    isLoading,
    error,
    refreshActivities
  };
};
