
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendMiningHeartbeat } from '@/hooks/mining/services/heartbeat';

// Supabase-Mock
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn()
  };
  
  return { supabase: mockSupabase };
});

import { supabase } from '@/lib/supabase';

describe('Mining Heartbeat Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMiningHeartbeat', () => {
    it('sollte das Heartbeat aktualisieren, wenn Mining-Stats existieren', async () => {
      // Mock für existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: { user_id: 'test-user', is_mining: true }, 
        error: null 
      });
      
      // Mock für Aktualisieren des Heartbeats
      (supabase.from().update().eq().eq().select as any).mockResolvedValue({ 
        data: [{ user_id: 'test-user', last_heartbeat: expect.any(String) }], 
        error: null 
      });

      const result = await sendMiningHeartbeat('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toEqual([{ user_id: 'test-user', last_heartbeat: expect.any(String) }]);
    });

    it('sollte null zurückgeben, wenn keine Mining-Stats existieren', async () => {
      // Mock für nicht existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: null, 
        error: null 
      });

      const result = await sendMiningHeartbeat('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toBeNull();
    });

    it('sollte null zurückgeben, wenn ein Fehler beim Prüfen der Mining-Stats auftritt', async () => {
      // Mock für Fehler beim Abfragen
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Datenbankfehler' } 
      });

      const result = await sendMiningHeartbeat('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toBeNull();
    });

    it('sollte null zurückgeben, wenn ein Fehler beim Aktualisieren des Heartbeats auftritt', async () => {
      // Mock für existierenden Eintrag
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValue({ 
        data: { user_id: 'test-user', is_mining: true }, 
        error: null 
      });
      
      // Mock für Fehler beim Aktualisieren
      (supabase.from().update().eq().eq().select as any).mockResolvedValue({ 
        data: null, 
        error: { message: 'Aktualisierungsfehler' } 
      });

      const result = await sendMiningHeartbeat('test-user');
      
      expect(supabase.from).toHaveBeenCalledWith('mining_stats');
      expect(result).toBeNull();
    });
  });
});
