
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createMiningInterval, 
  getMiningIntervals, 
  getActiveMiningIntervals 
} from '@/hooks/mining/services/intervals';

// Supabase-Mock
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn()
  };
  
  return { supabase: mockSupabase };
});

import { supabase } from '@/lib/supabase';

describe('Mining Intervals Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMiningInterval', () => {
    it('sollte ein neues Mining-Intervall erstellen', async () => {
      // Mock für Finden einer aktiven Sitzung
      (supabase.from().select().eq().eq().order().limit().single as any).mockResolvedValue({ 
        data: { id: 'test-session' }, 
        error: null 
      });
      
      // Mock für Schließen vorheriger Intervalle
      (supabase.from().update().eq().eq().is as any).mockResolvedValue({ 
        error: null 
      });
      
      // Mock für Erstellen eines neuen Intervalls
      (supabase.from().insert().select().single as any).mockResolvedValue({ 
        data: { 
          id: 'test-interval', 
          user_id: 'test-user', 
          session_id: 'test-session',
          start_time: new Date().toISOString()
        }, 
        error: null 
      });

      const result = await createMiningInterval('test-user', null, 5, 1, 'standard');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(result).toHaveProperty('id', 'test-interval');
    });

    it('sollte mit einer übergebenen Sitzungs-ID arbeiten', async () => {
      // Mock für Schließen vorheriger Intervalle
      (supabase.from().update().eq().eq().is as any).mockResolvedValue({ 
        error: null 
      });
      
      // Mock für Erstellen eines neuen Intervalls
      (supabase.from().insert().select().single as any).mockResolvedValue({ 
        data: { 
          id: 'test-interval', 
          user_id: 'test-user', 
          session_id: 'provided-session',
          start_time: new Date().toISOString()
        }, 
        error: null 
      });

      const result = await createMiningInterval('test-user', 'provided-session', 5, 1, 'standard');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(supabase.from().select().eq().eq().order().limit().single).not.toHaveBeenCalled();
      expect(result).toHaveProperty('session_id', 'provided-session');
    });
  });

  describe('getMiningIntervals', () => {
    it('sollte Intervalle für eine Sitzung zurückgeben', async () => {
      const mockIntervals = [
        { id: 'interval1', start_time: new Date().toISOString() },
        { id: 'interval2', start_time: new Date().toISOString() }
      ];
      
      (supabase.from().select().eq().order as any).mockResolvedValue({ 
        data: mockIntervals, 
        error: null 
      });

      const result = await getMiningIntervals('test-session');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(result).toEqual(mockIntervals);
    });

    it('sollte ein leeres Array zurückgeben, wenn ein Fehler auftritt', async () => {
      (supabase.from().select().eq().order as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Datenbankfehler' } 
      });

      const result = await getMiningIntervals('test-session');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(result).toEqual([]);
    });
  });

  describe('getActiveMiningIntervals', () => {
    it('sollte aktive Intervalle für einen Benutzer zurückgeben', async () => {
      const mockIntervals = [
        { id: 'interval1', start_time: new Date().toISOString(), end_time: null }
      ];
      
      (supabase.from().select().eq().is().order as any).mockResolvedValue({ 
        data: mockIntervals, 
        error: null 
      });

      const result = await getActiveMiningIntervals('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(result).toEqual(mockIntervals);
    });

    it('sollte ein leeres Array zurückgeben, wenn ein Fehler auftritt', async () => {
      (supabase.from().select().eq().is().order as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Datenbankfehler' } 
      });

      const result = await getActiveMiningIntervals('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_intervals');
      expect(result).toEqual([]);
    });
  });
});
