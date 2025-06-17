
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMiningControl } from '@/hooks/mining/useMiningControl';

// Mocks für die Dienste
vi.mock('@/hooks/mining/miningService', () => ({
  startMining: vi.fn().mockResolvedValue({ is_mining: true }),
  stopMining: vi.fn().mockResolvedValue({ is_mining: false }),
  recordActivity: vi.fn().mockResolvedValue({ success: true })
}));

// Toast-Mock
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Supabase-Mock
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      })
    }
  }
}));

// Importiere gemockte Module
import { supabase } from '@/lib/supabase';
import { startMining, stopMining, recordActivity } from '@/hooks/mining/miningService';
import { toast } from 'sonner';

describe('useMiningControl Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sollte Mining starten, wenn nicht bereits aktiv', async () => {
    const { result } = renderHook(() => useMiningControl());
    
    await act(async () => {
      const success = await result.current.startMining('test-user-id', false);
      expect(success).toBe(true);
    });
    
    expect(startMining).toHaveBeenCalledWith('test-user-id');
    expect(toast.success).toHaveBeenCalled();
  });

  it('sollte Mining nicht starten, wenn bereits aktiv', async () => {
    const { result } = renderHook(() => useMiningControl());
    
    await act(async () => {
      const success = await result.current.startMining('test-user-id', true);
      expect(success).toBe(false);
    });
    
    expect(startMining).not.toHaveBeenCalled();
  });

  it('sollte Mining stoppen, wenn aktiv', async () => {
    const { result } = renderHook(() => useMiningControl());
    
    await act(async () => {
      const success = await result.current.stopMining('test-user-id', true);
      expect(success).toBe(true);
    });
    
    expect(stopMining).toHaveBeenCalledWith('test-user-id');
    expect(toast.info).toHaveBeenCalled();
  });

  it('sollte Mining nicht stoppen, wenn nicht aktiv', async () => {
    const { result } = renderHook(() => useMiningControl());
    
    await act(async () => {
      const success = await result.current.stopMining('test-user-id', false);
      expect(success).toBe(false);
    });
    
    expect(stopMining).not.toHaveBeenCalled();
  });

  it('sollte Mining-Aktivität aufzeichnen', async () => {
    const { result } = renderHook(() => useMiningControl());
    const mockStats = { totalPoints: 0, totalTokensEarned: 0 };
    
    await act(async () => {
      const response = await result.current.recordActivity('test-user-id', mockStats, 'test', 5, 1);
      expect(response).toEqual({ success: true });
    });
    
    expect(recordActivity).toHaveBeenCalledWith('test-user-id', mockStats, 'test', 5, 1);
  });

  it('sollte Fehler beim Starten des Minings behandeln', async () => {
    // Einmaligen Fehler einrichten
    (startMining as jest.Mock).mockRejectedValueOnce(new Error('Mining-Startfehler'));
    
    const { result } = renderHook(() => useMiningControl());
    
    await act(async () => {
      const success = await result.current.startMining('test-user-id', false);
      expect(success).toBe(false);
    });
    
    expect(startMining).toHaveBeenCalledWith('test-user-id');
    expect(toast.error).toHaveBeenCalled();
  });
});
