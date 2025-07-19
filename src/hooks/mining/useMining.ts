import { useEffect } from 'react';
import { useMiningStore } from '@/store/useMiningStore';
import { useAuth } from '@/context/AuthContext';

/**
 * PERFECTED BSN Mining Hook
 * 
 * This hook is the central interface for all UI components to interact with the mining system.
 * It connects to the global `useMiningStore` to ensure a single source of truth.
 * All state logic is handled by the store, keeping components clean and synchronized.
 */
export const useMining = () => {
  const { user, isAuthenticated } = useAuth();
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

  // Fetch initial stats when the hook is first used, but only if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !miningStats && !isLoading) {
      fetchStats();
    }
  }, [fetchStats, miningStats, isLoading, isAuthenticated, user]);

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
    isAuthenticated,
  };
}; 
