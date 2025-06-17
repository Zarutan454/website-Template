
import { useCallback } from 'react';

/**
 * Hook für sichere Datumsverarbeitung in Mining-Daten
 */
export const useDateParser = () => {
  // Hilfsfunktion für sichere Datumsverarbeitung
  const safeParseDate = useCallback((timestamp: string | Date | null | undefined): Date => {
    if (!timestamp) return new Date();
    
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return !isNaN(date.getTime()) ? date : new Date();
    } catch (error) {
      return new Date();
    }
  }, []);

  return { safeParseDate };
};
