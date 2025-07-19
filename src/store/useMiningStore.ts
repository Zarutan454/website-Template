import { create } from 'zustand';
import { MiningStats } from '@/types/mining';
import djangoApi from '@/lib/django-api-new';

interface MiningState {
  miningStats: MiningStats | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  fetchStats: () => Promise<void>;
  startMining: () => Promise<boolean>;
  stopMining: () => Promise<boolean>;
  heartbeat: () => Promise<void>;
}

const useMiningStore = create<MiningState>((set, get) => ({
  miningStats: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchStats: async () => {
    // Check if user is authenticated before making API call
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No authentication token found, skipping mining stats fetch');
      return;
    }

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
    // Check if user is authenticated before making API call
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No authentication token found, skipping mining start');
      return false;
    }

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
    // Check if user is authenticated before making API call
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No authentication token found, skipping mining stop');
      return false;
    }

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
    // Check if user is authenticated before making API call
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No authentication token found, skipping heartbeat');
      return;
    }

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