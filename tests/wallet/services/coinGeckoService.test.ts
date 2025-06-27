
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { coinGeckoService } from '@/wallet/services/coinGeckoService';

describe('CoinGecko Service', () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
  });

  describe('getTokenPriceHistory', () => {
    const mockResponseData = {
      prices: [
        [1625961600000, 2000.0], // Timestamp und Preis
        [1626048000000, 2100.0]
      ],
      total_volumes: [
        [1625961600000, 50000000],
        [1626048000000, 60000000]
      ]
    };
    
    it('sollte Token-Preishistorie erfolgreich abrufen', async () => {
      // Mock der Fetch-Antwort
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });
      
      const result = await coinGeckoService.getTokenPriceHistory(
        '0x1234567890abcdef',
        'ethereum',
        7
      );
      
      // API-Aufruf überprüfen
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/ethereum/contract/0x1234567890abcdef/market_chart?vs_currency=usd&days=7'
      );
      
      // Ergebnisformat überprüfen
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: new Date(1625961600000).toISOString().split('T')[0],
        price: 2000.0,
        volume: 50000000
      });
      expect(result[1]).toEqual({
        date: new Date(1626048000000).toISOString().split('T')[0],
        price: 2100.0,
        volume: 60000000
      });
    });
    
    it('sollte ein leeres Array zurückgeben, wenn die API-Anfrage fehlschlägt', async () => {
      // Mock eines fehlgeschlagenen API-Aufrufs
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });
      
      const result = await coinGeckoService.getTokenPriceHistory(
        '0x1234567890abcdef',
        'ethereum',
        7
      );
      
      expect(console.error).toBeCalled();
      expect(result).toEqual([]);
    });
    
    it('sollte ein leeres Array zurückgeben, wenn ein Netzwerkfehler auftritt', async () => {
      // Mock eines Netzwerkfehlers
      (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));
      
      const result = await coinGeckoService.getTokenPriceHistory(
        '0x1234567890abcdef',
        'ethereum',
        7
      );
      
      expect(console.error).toBeCalled();
      expect(result).toEqual([]);
    });
  });
  
  describe('getPlatformId', () => {
    it('sollte die richtige Plattform-ID für verschiedene Netzwerke zurückgeben', async () => {
      // Ethereum
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ prices: [], total_volumes: [] })
      });
      
      await coinGeckoService.getTokenPriceHistory('0x123', 'ethereum', 1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('ethereum'));
      
      // BSC
      vi.clearAllMocks();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ prices: [], total_volumes: [] })
      });
      
      await coinGeckoService.getTokenPriceHistory('0x123', 'bsc', 1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('binance-smart-chain'));
      
      // Polygon
      vi.clearAllMocks();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ prices: [], total_volumes: [] })
      });
      
      await coinGeckoService.getTokenPriceHistory('0x123', 'polygon', 1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('polygon-pos'));
      
      // Unbekanntes Netzwerk (Standardmäßig Ethereum)
      vi.clearAllMocks();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ prices: [], total_volumes: [] })
      });
      
      await coinGeckoService.getTokenPriceHistory('0x123', 'unknown', 1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('ethereum'));
    });
  });
});
