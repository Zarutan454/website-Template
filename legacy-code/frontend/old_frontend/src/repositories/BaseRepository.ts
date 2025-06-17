
import { supabase } from '@/lib/supabase';

/**
 * Basis-Repository mit gemeinsamen Funktionalitäten
 */
export class BaseRepository {
  protected supabase = supabase;
  
  constructor() {
    // Kann in Unterklassen erweitert werden
  }
  
  /**
   * Hilfsmethode für konsistente Fehlerprotokollierung
   */
  protected logError(operation: string, error: unknown) {
    console.error(`[${this.constructor.name}] Error in ${operation}:`, error);
  }
}
