
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '@/wallet/services/apiService';

// Mock für supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

import { supabase } from '@/integrations/supabase/client';

describe('API Service', () => {
  const originalFetch = global.fetch;
  const originalLocalStorage = global.localStorage;
  
  beforeEach(() => {
    global.fetch = vi.fn();
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    
    // Console-Mocks, um Logs in Tests zu unterdrücken
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
    vi.clearAllMocks();
  });

  describe('getGasPrice', () => {
    it('sollte Gaspreise erfolgreich abrufen', async () => {
      const mockGasData = {
        network: 'ethereum',
        fast_gwei: '100',
        standard_gwei: '80',
        slow_gwei: '60'
      };
      
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValueOnce({
        data: mockGasData,
        error: null
      });
      
      const result = await apiService.getGasPrice('ethereum');
      
      expect(supabase.from).toHaveBeenCalledWith('gas_prices');
      expect(supabase.from().select).toHaveBeenCalled();
      expect(supabase.from().select().eq).toHaveBeenCalledWith('network', 'ethereum');
      
      expect(result).toEqual({
        network: 'ethereum',
        fast: 100,
        standard: 80,
        slow: 60
      });
    });
    
    it('sollte null zurückgeben, wenn keine Gaspreisdaten gefunden werden', async () => {
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValueOnce({
        data: null,
        error: null
      });
      
      const result = await apiService.getGasPrice('ethereum');
      
      expect(result).toBeNull();
    });
    
    it('sollte null zurückgeben, wenn ein Fehler auftritt', async () => {
      (supabase.from().select().eq().maybeSingle as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      const result = await apiService.getGasPrice('ethereum');
      
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getTokenPrice', () => {
    const mockTokenData = {
      '0x1234567890abcdef': {
        usd: 2500.25,
        usd_24h_change: 2.5,
        last_updated_at: 1625961600
      }
    };
    
    it('sollte Token-Preis aus dem Cache zurückgeben, wenn verfügbar', async () => {
      // Zuerst Daten in den Cache holen
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenData)
      });
      
      await apiService.getTokenPrice('0x1234567890abcdef', 'ethereum');
      
      // Cache sollte jetzt Daten haben, also den Fetch-Mock zurücksetzen
      vi.clearAllMocks();
      
      // Erneuter Aufruf sollte Cache verwenden
      const result = await apiService.getTokenPrice('0x1234567890abcdef', 'ethereum');
      
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        usd: 2500.25,
        usd_24h_change: 2.5,
        last_updated_at: 1625961600
      });
    });
    
    it('sollte Token-Preis von der API abrufen und im Cache speichern', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenData)
      });
      
      const result = await apiService.getTokenPrice('0x1234567890abcdef', 'ethereum');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x1234567890abcdef&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true',
        expect.any(Object)
      );
      
      expect(result).toEqual({
        usd: 2500.25,
        usd_24h_change: 2.5,
        last_updated_at: 1625961600
      });
    });
    
    it('sollte null zurückgeben, wenn die Token-Preisabfrage fehlschlägt', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false
      });
      
      const result = await apiService.getTokenPrice('0x1234567890abcdef', 'ethereum');
      
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getTransactionHistory', () => {
    const mockTransactionData = {
      status: "1",
      result: [
        {
          hash: '0xabc123',
          from: '0x123',
          to: '0x456',
          value: '1000000000000000000',
          timeStamp: '1625961600'
        }
      ]
    };
    
    it('sollte Transaktionen aus dem localStorage zurückgeben, wenn verfügbar', async () => {
      const mockCachedData = {
        data: [
          {
            hash: '0xabc123',
            from: '0x123',
            to: '0x456',
            value: '1000000000000000000',
            timestamp: 1625961600
          }
        ],
        timestamp: Date.now()
      };
      
      (global.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(mockCachedData));
      
      const result = await apiService.getTransactionHistory('0x123', 1);
      
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedData.data);
    });
    
    it('sollte Transaktionen von der API abrufen und im localStorage speichern', async () => {
      (global.localStorage.getItem as any).mockReturnValueOnce(null);
      
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: { api_key: 'test-api-key' }
      });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactionData)
      });
      
      const result = await apiService.getTransactionHistory('0x123', 1);
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('get-explorer-api-key', {
        body: { network: 'ethereum' }
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.etherscan.io/api?module=account&action=txlist&address=0x123&startblock=0&endblock=99999999&sort=desc&apikey=test-api-key'
      );
      
      expect(global.localStorage.setItem).toHaveBeenCalled();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        hash: '0xabc123',
        from: '0x123',
        to: '0x456',
        value: '1000000000000000000',
        timestamp: 1625961600
      });
    });
    
    it('sollte ein leeres Array zurückgeben, wenn die API-Anfrage fehlschlägt', async () => {
      (global.localStorage.getItem as any).mockReturnValueOnce(null);
      
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: { api_key: 'test-api-key' }
      });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false
      });
      
      const result = await apiService.getTransactionHistory('0x123', 1);
      
      expect(console.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
