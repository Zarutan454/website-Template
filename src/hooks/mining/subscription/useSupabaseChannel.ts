
import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook zur Verwaltung eines Supabase-Kanals für Echtzeit-Abonnements
 * - Vereinfachte Kanalverwaltung
 * - Vermeidung von Mehrfachabonnements
 */
export const useSupabaseChannel = () => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Aufräumfunktion für die Kanalverwaltung
  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
      }
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  return {
    channelRef,
    isSubscribed, 
    setIsSubscribed,
    cleanupChannel
  };
};
