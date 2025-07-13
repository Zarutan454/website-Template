import { useEffect } from 'react';
import { useMiningStore } from '@/store/useMiningStore';
import { useAuth } from '@/hooks/useAuth';

/**
 * PERFECTED BSN Mining Hook
 * 
 * This hook is the central interface for all UI components to interact with the mining system.
 * It connects to the global `useMiningStore` to ensure a single source of truth.
 * All state logic is handled by the store, keeping components clean and synchronized.
 */
export const useMining = () => {
  const {
    miningStats,
    isLoading,
    error,
    fetchStats,
    startMining,
    stopMining,
    heartbeat,
    clearError,
  } = useMiningStore();
  const { isAuthenticated } = useAuth();

  // Fetch initial stats when the hook is first used
  useEffect(() => {
    if (isAuthenticated && !miningStats && !isLoading) {
      fetchStats();
    }
  }, [fetchStats, miningStats, isLoading, isAuthenticated]);

  return {
    miningStats,
    isMining: miningStats?.is_mining || false,
    isLoading,
    error,
    fetchStats,
    startMining,
    stopMining,
    heartbeat,
    clearError,
  };
}; 
