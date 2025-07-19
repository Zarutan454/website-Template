import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext.utils';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { UserAchievement } from './achievements/types';

export function useAchievements() {
  const { user: profile } = useAuth();
  
  const { 
    data: userAchievements, 
    isLoading, 
    error,
    refetch
  } = useQuery<UserAchievement[]>({
    queryKey: ['userAchievements', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return [];
      }
      try {
        const data = await apiClient.get<UserAchievement[]>(`/achievements/user/${profile.id}/`);
        return data || [];
      } catch (err) {
        console.error('Failed to fetch user achievements:', err);
        toast.error('Fehler beim Laden der Erfolge.');
        throw err;
      }
    },
    enabled: !!profile?.id,
  });

  return {
    userAchievements: userAchievements || [],
    isLoading,
    error,
    refetchAchievements: refetch,
  };
}

