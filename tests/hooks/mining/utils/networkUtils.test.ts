
import { describe, it, expect, vi } from 'vitest';
import { fetchWithRetry } from '@/hooks/mining/utils/networkUtils';

describe('fetchWithRetry Utility', () => {
  it('sollte den Wert zurückgeben, wenn die Funktion erfolgreich ist', async () => {
    const mockFn = vi.fn().mockResolvedValue('erfolg');
    
    const result = await fetchWithRetry(mockFn);
    
    expect(result).toBe('erfolg');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('sollte es erneut versuchen, wenn die Funktion fehlschlägt', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Fehler'))
      .mockRejectedValueOnce(new Error('Fehler'))
      .mockResolvedValueOnce('erfolg nach fehlern');
    
    const result = await fetchWithRetry(mockFn, 3, 10);
    
    expect(result).toBe('erfolg nach fehlern');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('sollte den Fehler weiterwerfen, wenn alle Versuche fehlschlagen', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Dauerhafter Fehler'));
    
    await expect(fetchWithRetry(mockFn, 2, 10)).rejects.toThrow('Dauerhafter Fehler');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('sollte die maximale Anzahl an Versuchen einhalten', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Fehler 1'))
      .mockRejectedValueOnce(new Error('Fehler 2'))
      .mockRejectedValueOnce(new Error('Fehler 3'))
      .mockRejectedValueOnce(new Error('Fehler 4'))
      .mockResolvedValueOnce('erfolg nach vielen fehlern');
    
    await expect(fetchWithRetry(mockFn, 3, 10)).rejects.toThrow('Fehler 3');
    expect(mockFn).toHaveBeenCalledTimes(3); // Nur 3 Versuche trotz potentiell erfolgreicher 5. Versuch
  });
});
