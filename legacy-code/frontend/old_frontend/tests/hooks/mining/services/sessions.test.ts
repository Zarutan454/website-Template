
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startMining, stopMining, getMiningHistory } from '@/hooks/mining/services/sessions';

// Supabase-Mock
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn()
  };
  
  return { supabase: mockSupabase };
});

// MINING_LIMITS-Mock
vi.mock('@/hooks/mining/types', () => ({
  MINING_LIMITS: {
    mining_start: {
      reward: 1
    }
  }
}));

// createMiningInterval-Mock
vi.mock('@/hooks/mining/services/intervals', () => ({
  createMiningInterval: vi.fn().mockResolvedValue({ id: 'test-interval' })
}));

import { supabase } from '@/lib/supabase';
import { createMiningInterval } from '@/hooks/mining/services/intervals';

describe('Mining Sessions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startMining', () => {
    it('sollte eine neue Mining-Statistik erstellen, wenn keine existiert', async () => {
      // Mock für nicht existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ data: null, error: null });
      // Mock für Einfügen neuer Statistik
      (supabase.from().insert().select().single as any).mockResolvedValue({ 
        data: { user_id: 'test-user', is_mining: true }, 
        error: null 
      });
      // Mock für Erstellen einer Sitzung
      (supabase.from().insert().select().single as any).mockResolvedValueOnce({ 
        data: { id: 'test-session' }, 
        error: null 
      }).mockResolvedValueOnce({ 
        data: { id: 'test-session' }, 
        error: null 
      });

      const result = await startMining('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(supabase.from).toHaveBeenCalledWith('mining_sessions');
      expect(createMiningInterval).toHaveBeenCalledWith('test-user', 'test-session', 1, expect.any(Number), 'mining_start');
      expect(result).toEqual({ user_id: 'test-user', is_mining: true });
    });

    it('sollte eine bestehende Mining-Statistik aktualisieren, wenn diese existiert', async () => {
      // Mock für existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: { user_id: 'test-user', is_mining: false }, 
        error: null 
      });
      // Mock für Aktualisieren einer Statistik
      (supabase.from().update().eq().select().single as any).mockResolvedValue({ 
        data: { user_id: 'test-user', is_mining: true }, 
        error: null 
      });
      // Mock für Erstellen einer Sitzung
      (supabase.from().insert().select().single as any).mockResolvedValue({ 
        data: { id: 'test-session' }, 
        error: null 
      });

      const result = await startMining('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toEqual({ user_id: 'test-user', is_mining: true });
    });

    it('sollte Fehler beim Erstellen von Mining-Statistiken behandeln', async () => {
      // Mock für Datenbankfehler
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Datenbankfehler' } 
      });

      await expect(startMining('test-user')).rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
    });
  });

  describe('stopMining', () => {
    it('sollte den Mining-Status auf false setzen', async () => {
      // Mock für existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: { user_id: 'test-user', is_mining: true }, 
        error: null 
      });
      // Mock für Aktualisieren einer Statistik
      (supabase.from().update().eq().select as any).mockResolvedValue({ 
        data: [{ user_id: 'test-user', is_mining: false }], 
        error: null 
      });
      // Mock für Aktualisieren von Sitzungen
      (supabase.from().update().eq().eq().select as any).mockResolvedValue({ 
        data: [{ id: 'test-session' }], 
        error: null 
      });

      const result = await stopMining('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(supabase.from).toHaveBeenCalledWith('mining_sessions');
      expect(result).toEqual([{ user_id: 'test-user', is_mining: false }]);
    });

    it('sollte null zurückgeben, wenn keine Mining-Statistik existiert', async () => {
      // Mock für nicht existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: null, 
        error: null 
      });

      const result = await stopMining('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toBeNull();
    });
  });

  describe('getMiningHistory', () => {
    it('sollte die Mining-Historie zurückgeben', async () => {
      const mockHistory = [
        { id: 'session1', start_time: new Date().toISOString() },
        { id: 'session2', start_time: new Date().toISOString() }
      ];
      
      (supabase.from().select().eq().order().limit as any).mockResolvedValue({ 
        data: mockHistory, 
        error: null 
      });

      const result = await getMiningHistory('test-user', 10);
      
      expect(supabase.from).toHaveBeenCalledWith('mining_sessions');
      expect(result).toEqual(mockHistory);
    });

    it('sollte ein leeres Array zurückgeben, wenn ein Fehler auftritt', async () => {
      (supabase.from().select().eq().order().limit as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Datenbankfehler' } 
      });

      const result = await getMiningHistory('test-user', 10);
      
      expect(supabase.from).toHaveBeenCalledWith('mining_sessions');
      expect(result).toEqual([]);
    });
  });
});
