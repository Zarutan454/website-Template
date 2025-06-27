
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  checkAndStopInactiveMiners, 
  cleanupStaleMiningStates 
} from '@/hooks/mining/services/maintenance';

// Supabase-Mock
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis()
  };
  
  return { supabase: mockSupabase };
});

// stopMining-Mock
vi.mock('@/hooks/mining/services/sessions', () => ({
  stopMining: vi.fn().mockResolvedValue({ success: true })
}));

import { supabase } from '@/lib/supabase';
import { stopMining } from '@/hooks/mining/services/sessions';

describe('Mining Maintenance Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAndStopInactiveMiners', () => {
    it('sollte inaktive Miner identifizieren und stoppen', async () => {
      const mockInactiveUsers = [
        { user_id: 'inactive-user-1' },
        { user_id: 'inactive-user-2' }
      ];
      
      // Mock für Finden inaktiver Miner
      (supabase.from().select().eq().lt as any).mockResolvedValue({ 
        data: mockInactiveUsers, 
        error: null 
      });

      const result = await checkAndStopInactiveMiners();
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(stopMining).toHaveBeenCalledTimes(2);
      expect(result).toBe(2);
    });

    it('sollte 0 zurückgeben, wenn keine inaktiven Miner gefunden werden', async () => {
      // Mock für keine inaktiven Miner
      (supabase.from().select().eq().lt as any).mockResolvedValue({ 
        data: [], 
        error: null 
      });

      const result = await checkAndStopInactiveMiners();
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(stopMining).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('sollte Fehler abfangen und 0 zurückgeben', async () => {
      // Mock für Datenbankfehler
      (supabase.from().select().eq().lt as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Datenbankfehler' } 
      });

      const result = await checkAndStopInactiveMiners();
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toBe(0);
    });
  });

  describe('cleanupStaleMiningStates', () => {
    it('sollte veraltete Mining-Zustände bereinigen', async () => {
      const mockStaleUsers = [
        { user_id: 'stale-user-1' },
        { user_id: 'stale-user-2' }
      ];
      
      // Mock für Finden veralteter Zustände
      (supabase.from().select().eq().lt as any).mockResolvedValue({ 
        data: mockStaleUsers, 
        error: null 
      });
      
      // Mocks für die Aktualisierungsoperationen
      (supabase.from().update().eq().lt as any).mockResolvedValue({ error: null });
      (supabase.from().update().is().lt as any).mockResolvedValue({ error: null });

      const result = await cleanupStaleMiningStates();
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(supabase.from).toHaveBeenCalledWith('mining_sessions');
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(stopMining).toHaveBeenCalledTimes(2);
      expect(result).toBe(2);
    });

    it('sollte 0 zurückgeben, wenn keine veralteten Zustände gefunden werden', async () => {
      // Mock für keine veralteten Zustände
      (supabase.from().select().eq().lt as any).mockResolvedValue({ 
        data: [], 
        error: null 
      });

      const result = await cleanupStaleMiningStates();
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(stopMining).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
});
