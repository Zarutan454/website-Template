
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MiningStats } from '../types';
import { normalizeMiningStats } from '../utils';

interface UseStatsHandlerProps {
  userId: string;
  onStatsUpdate?: (stats: MiningStats) => void;
}

/**
 * Hook zum Verarbeiten von Mining-Statistiken über Echtzeit-Subscription
 */
export function useStatsHandler({
  userId,
  onStatsUpdate
}: UseStatsHandlerProps) {
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Anfängliches Laden der Statistiken
  useEffect(() => {
    async function loadStats() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('mining_stats')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) throw error;
        
        const normalizedStats = normalizeMiningStats(data);
        setStats(normalizedStats);
        if (onStatsUpdate) onStatsUpdate(normalizedStats);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStats();
  }, [userId, onStatsUpdate]);

  // Echtzeit-Subscription für Statistikänderungen
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('mining-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mining_stats',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          try {
            console.log('Mining stats updated:', payload);
            
            const updatedStats = payload.new as MiningStats;
            
            // Normalisiere die Statistiken und aktualisiere den lokalen Zustand
            const normalizedStats = normalizeMiningStats({
              ...updatedStats,
              // Vorhandene Werte beibehalten für konsistente camelCase-Eigenschaften
              dailyPostsCount: updatedStats.daily_posts_count,
              dailyCommentsCount: updatedStats.daily_comments_count,
              dailyLikesCount: updatedStats.daily_likes_count,
              dailySharesCount: updatedStats.daily_shares_count,
              dailyInvitesCount: updatedStats.daily_invites_count
            });
            
            setStats(normalizedStats);
            
            // Benachrichtige den Eltern-Hook, falls gewünscht
            if (onStatsUpdate) {
              onStatsUpdate(normalizedStats);
            }
          } catch (error) {
            console.error('Error processing stats change:', error);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onStatsUpdate]);

  return {
    stats,
    isLoading
  };
}
