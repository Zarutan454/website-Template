
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MiningActivity } from '../types';
import { toast } from 'sonner';

interface UseActivityHandlerProps {
  userId: string;
  onActivitiesUpdate?: (activities: MiningActivity[]) => void;
}

/**
 * Hook zum Verarbeiten von Mining-Aktivitäten über Echtzeit-Subscription
 */
export function useActivityHandler({
  userId,
  onActivitiesUpdate
}: UseActivityHandlerProps) {
  const [activities, setActivities] = useState<MiningActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Anfängliches Laden der Aktivitäten
  useEffect(() => {
    async function loadActivities() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('mining_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        
        setActivities(data || []);
        if (onActivitiesUpdate) onActivitiesUpdate(data || []);
      } catch (error) {
        console.error('Error loading mining activities:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadActivities();
  }, [userId, onActivitiesUpdate]);

  // Echtzeit-Subscription für neue Aktivitäten
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('mining-activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mining_activities',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          try {
            const newActivity = payload.new as MiningActivity;
            
            // Aktualisiere die lokale Zustandsvariable
            setActivities(prev => [newActivity, ...prev].slice(0, 50));
            
            // Benachrichtige den Eltern-Hook, falls gewünscht
            if (onActivitiesUpdate) {
              const updatedActivities = [newActivity, ...activities].slice(0, 50);
              onActivitiesUpdate(updatedActivities);
            }
            
            // Optional: Zeige Toast-Benachrichtigung
            if (newActivity.tokens_earned > 0) {
              toast.success(`+${newActivity.tokens_earned.toFixed(2)} BSN für ${newActivity.activity_type}`);
            }
          } catch (error) {
            console.error('Error processing activity change:', error);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activities, onActivitiesUpdate]);

  return {
    activities,
    isLoading
  };
}
