
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

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'admin' | 'member' | 'moderator' | 'guest';
  joined_at: string;
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
            // Korrekte Syntax für 'not in' Filter
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

// Nützlicher Hook zum Arbeiten mit Gruppenmitgliedern
export const useGroupMembers = (groupId: string) => {
  const { profile } = useProfile();

  const getGroupMembers = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          users:user_id (id, username, display_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('role', { ascending: false }) // Admins zuerst, dann Moderatoren, dann Mitglieder
        .order('joined_at', { ascending: true }); // Älteste Mitglieder zuerst
        
      if (error) {
        console.error('Error fetching group members:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!groupId,
  });

  const isUserMember = useQuery({
    queryKey: ['is-group-member', groupId, profile?.id],
    queryFn: async () => {
      if (!profile?.id) return false;
      
      const { data, error } = await supabase
        .from('group_members')
        .select('id, role')
        .eq('user_id', profile.id)
        .eq('group_id', groupId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking group membership:', error);
        return { isMember: false, role: null };
      }
      
      return { 
        isMember: !!data, 
        role: data?.role || null,
        memberId: data?.id || null
      };
    },
    enabled: !!groupId && !!profile?.id,
  });

  const joinGroup = async (role: 'member' = 'member') => {
    if (!profile?.id) {
      toast.error("Du musst angemeldet sein, um einer Gruppe beizutreten");
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: profile.id,
          role
        })
        .select()
        .single();
        
      if (error) {
        if (error.code === '23505') {
          toast.info("Du bist bereits Mitglied dieser Gruppe");
          return true;
        }
        throw error;
      }
      
      // Aktualisiere das updated_at Feld der Gruppe
      await updateGroupTimestamp(groupId);
      
      toast.success("Du bist der Gruppe beigetreten");
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error("Fehler beim Beitreten der Gruppe");
      return false;
    }
  };

  const leaveGroup = async () => {
    if (!profile?.id) {
      toast.error("Du musst angemeldet sein, um eine Gruppe zu verlassen");
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', profile.id)
        .eq('group_id', groupId);
        
      if (error) throw error;
      
      // Aktualisiere das updated_at Feld der Gruppe
      await updateGroupTimestamp(groupId);
      
      toast.success("Du hast die Gruppe verlassen");
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error("Fehler beim Verlassen der Gruppe");
      return false;
    }
  };

  // Helper-Funktion zum Aktualisieren des updated_at Timestamps der Gruppe
  const updateGroupTimestamp = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);
        
      if (error) {
        console.error('Error updating group timestamp:', error);
      }
    } catch (error) {
      console.error('Exception updating group timestamp:', error);
    }
  };

  // Fix the type errors by safely accessing the properties with optional chaining
  // and providing default values when the data might be false
  const membershipData = isUserMember.data || { isMember: false, role: null };

  return {
    members: getGroupMembers.data || [],
    isLoading: getGroupMembers.isLoading,
    error: getGroupMembers.error,
    isMember: membershipData.isMember,
    userRole: membershipData.role,
    isAdmin: membershipData.role === 'admin',
    isModerator: membershipData.role === 'moderator',
    joinGroup,
    leaveGroup,
    updateGroupTimestamp
  };
};
