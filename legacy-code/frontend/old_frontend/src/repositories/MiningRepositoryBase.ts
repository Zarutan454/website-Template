
import { supabase } from '@/lib/supabase';

/**
 * Base Repository class that provides the Supabase client
 */
export class BaseRepository {
  protected supabase;
  
  constructor(supabaseClient: typeof supabase = supabase) {
    this.supabase = supabaseClient;
  }
}
