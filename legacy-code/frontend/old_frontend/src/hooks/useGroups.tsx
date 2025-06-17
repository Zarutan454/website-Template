
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  member_count: number;
  posts_count: number;
  created_at: string;
  is_private: boolean;
  created_by: string;
  updated_at: string;
}

export const useGroups = (activeTab: 'all' | 'my-groups' | 'suggested') => {
  const { profile } = useProfile();

  return useQuery({
    queryKey: ['groups', activeTab, profile?.id],
    queryFn: async () => {
      try {
        let query = supabase.from('groups').select('*');
        
        if (activeTab === 'my-groups' && profile) {
          // Für "Meine Gruppen" Gruppen holen, bei denen der Benutzer Mitglied ist
          const { data: memberGroups, error: memberError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', profile.id);
            
          if (memberError) {
            console.error('Error fetching member groups:', memberError);
            return [] as Group[];
          }
            
          if (memberGroups && memberGroups.length > 0) {
            const groupIds = memberGroups.map(item => item.group_id);
            query = query.in('id', groupIds);
          } else {
            return [] as Group[];
          }
        } else if (activeTab === 'suggested' && profile) {
          // Für "Empfohlene Gruppen" Gruppen holen, bei denen der Benutzer kein Mitglied ist
          const { data: memberGroups, error: memberError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', profile.id);
            
          if (memberError) {
            console.error('Error fetching member groups:', memberError);
            return [] as Group[];
          }
            
          if (memberGroups && memberGroups.length > 0) {
            const groupIds = memberGroups.map(item => item.group_id);
            query = query.not('id', 'in', groupIds);
          }
        }
        
        const { data, error } = await query
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching groups:', error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data.length} groups for ${activeTab} tab`);
        return data as Group[];
      } catch (error) {
        console.error('Error in useGroups hook:', error);
        toast.error('Fehler beim Laden der Gruppen');
        return [] as Group[];
      }
    },
    enabled: activeTab !== 'my-groups' || !!profile,
  });
};
