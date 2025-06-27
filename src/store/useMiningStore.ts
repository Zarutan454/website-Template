import { create } from 'zustand';
import djangoApi from '@/lib/django-api-new';
import { MiningStats } from '@/hooks/mining/types';

interface MiningState {
  miningStats: MiningStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  startMining: () => Promise<boolean>;
  stopMining: () => Promise<boolean>;
  heartbeat: () => Promise<void>;
  clearError: () => void;
}

const useMiningStore = create<MiningState>((set, get) => ({
  miningStats: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await djangoApi.miningGetStats();
      set({ miningStats: stats, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mining stats';
      set({ error: errorMessage, isLoading: false });
    }
  },

  startMining: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await djangoApi.miningStart();
      set({ miningStats: stats, isLoading: false });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start mining';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  stopMining: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await djangoApi.miningStop();
      set({ miningStats: stats, isLoading: false });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop mining';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  heartbeat: async () => {
    try {
      const updatedStats = await djangoApi.miningHeartbeat();
      set(state => ({
        miningStats: { ...state.miningStats, ...updatedStats } as MiningStats,
      }));
    } catch (err) {
      console.error("Heartbeat failed:", err);
    }
  },
}));

export { useMiningStore }; 