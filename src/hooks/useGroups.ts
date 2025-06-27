import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import djangoApi from '@/lib/django-api-new';
import { useAuth } from '@/context/AuthContext';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  creator: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  privacy: 'public' | 'private';
  member_count: number;
  is_member: boolean;
  created_at: string;
  posts_count?: number;
  // Optional fields that may not always be present
  avatar_url?: string | null;
  banner_url?: string | null;
}

export interface GroupMember {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  group: string;
  role: 'admin' | 'member' | 'moderator';
  joined_at: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

// Hook to fetch a list of groups based on a filter
export const useGroups = (activeTab: 'all' | 'my-groups' | 'suggested') => {
  const { user: profile } = useAuth();

  return useQuery<Group[]>({
    queryKey: ['groups', activeTab],
    queryFn: async () => {
      const response = await djangoApi.getGroups(activeTab);
      return response.data;
    },
    enabled: !!profile, // Only run query if user is logged in
  });
};


// Hook for all interactions with a single group (details, members, joining, leaving)
export const useGroup = (groupId: string) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Fetching group details
  const { data: group, isLoading: isLoadingDetails, error: detailsError } = useQuery<Group>({
    queryKey: ['group', groupId],
    queryFn: async () => (await djangoApi.getGroupDetails(groupId)).data,
    enabled: !!groupId,
  });
  
  // Fetching group members
  const { data: members, isLoading: isLoadingMembers, error: membersError } = useQuery<GroupMember[]>({
    queryKey: ['group-members', groupId],
    queryFn: async () => (await djangoApi.getGroupMembers(groupId)).data,
    enabled: !!groupId,
  });

  // Mutation for joining a group
  const { mutate: joinGroup, isPending: isJoining } = useMutation({
    mutationFn: () => djangoApi.joinGroup(groupId),
    onSuccess: () => {
      toast.success(`Du bist der Gruppe "${group?.name || 'dieser Gruppe'}" beigetreten.`);
      // Invalidate queries to refetch group data and lists
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.error || "Fehler beim Beitreten der Gruppe";
      toast.error(errorMessage);
    }
  });

  // Mutation for leaving a group
  const { mutate: leaveGroup, isPending: isLeaving } = useMutation({
    mutationFn: () => djangoApi.leaveGroup(groupId),
    onSuccess: () => {
      toast.success(`Du hast die Gruppe "${group?.name || 'diese Gruppe'}" verlassen.`);
      // Invalidate queries to refetch group data and lists
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.error || "Fehler beim Verlassen der Gruppe";
      toast.error(errorMessage);
    }
  });

  const isMember = group?.is_member ?? false;
  const isAdmin = members?.find(m => String(m.user.id) === String(currentUser?.id))?.role === 'admin';

  return {
    group,
    members: members || [],
    isMember,
    isAdmin,
    isLoading: isLoadingDetails || isLoadingMembers,
    isJoining,
    isLeaving,
    error: detailsError || membersError,
    joinGroup,
    leaveGroup
  };
};
