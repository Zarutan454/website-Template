import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import djangoApi from '@/lib/django-api-new';
import { useAuth } from '@/hooks/useAuth';
import { groupEventsAPI, GroupEvent } from '@/lib/django-api-new';
import { groupMediaAPI } from '@/lib/django-api-new';
import { groupFilesAPI, GroupFile } from '@/lib/django-api-new';
import { groupMemberAdminAPI } from '@/lib/django-api-new';
import { groupAnalyticsAPI } from '@/lib/django-api-new';
import { moderationAPI } from '@/lib/django-api-new';
import { groupReportsAPI } from '@/lib/django-api-new';
import { groupEventRSVPAPI, GroupEventRSVP } from '@/lib/django-api-new';
import * as React from 'react';

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
  guidelines?: string;
  type?: string;
  tags?: string[];
  token_gated?: boolean;
  required_token_contract?: string;
  ai_summary?: string;
  ai_recommendations?: string[];
  last_post_preview?: string | null;
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

export interface ContentReport {
  id: string;
  content_type: string;
  content_id: number;
  report_type: string;
  reason: string;
  status: string;
  reporter: { id: string; username: string };
  created_at: string;
  content_text?: string;
  author_username?: string;
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
      console.log('[useGroups] Fetching groups for tab:', activeTab);
      const response = await djangoApi.getGroups(activeTab);
      console.log('[useGroups] API response:', response);
      // Korrigiert: Extrahiere Gruppen aus results/data
      const groups = Array.isArray(response)
        ? response
        : (response?.results || response?.data || []);
      console.log('[useGroups] Processed groups:', groups);
      return groups;
    },
    enabled: !!profile, // Only run query if user is logged in
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });
};


// Hook for all interactions with a single group (details, members, joining, leaving)
export const useGroup = (groupId: string) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Fetching group details
  const { data: group, isLoading: isLoadingDetails, error: detailsError } = useQuery<Group>({
    queryKey: ['group', groupId],
    queryFn: async () => {
      console.log('[useGroup] Fetching group details for ID:', groupId);
      const response = await djangoApi.getGroupDetails(groupId);
      console.log('[useGroup] Group details response:', response);
      return response;
    },
    enabled: !!groupId,
  });
  
  // Fetching group members
  const enabled = !!groupId;
  console.log('[useGroup] useQuery setup: groupId:', groupId, 'enabled:', enabled);

  const { data: members, isLoading: isLoadingMembers, error: membersError } = useQuery<GroupMember[]>({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      console.log('[useGroup] Query-Funktion wird ausgeführt! groupId:', groupId);
      try {
        const response = await djangoApi.getGroupMembers(groupId);
        console.log('[useGroup] API-Response für group members:', response);
        let members: GroupMember[] = [];
        if (Array.isArray(response)) {
          members = response;
        } else if (response && Array.isArray(response.results)) {
          members = response.results;
        } else {
          console.error('[useGroup] FEHLER: group members response ist kein Array und hat kein results-Array!', response);
          members = [];
        }
        console.log('[useGroup] Query resolved, members:', members);
        return members;
      } catch (err) {
        console.error('[useGroup] Query rejected/Fehler beim Laden der Mitglieder:', err);
        throw err;
      }
    },
    enabled,
  });

  // Mutation for joining a group
  const { mutate: joinGroup, isPending: isJoining } = useMutation({
    mutationFn: () => djangoApi.joinGroup(groupId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['group', groupId] });
      await queryClient.cancelQueries({ queryKey: ['group-members', groupId] });
      await queryClient.cancelQueries({ queryKey: ['groups'] });

      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(['group', groupId]);
      const previousMembers = queryClient.getQueryData(['group-members', groupId]);
      const previousGroups = queryClient.getQueryData(['groups']);

      // Optimistically update group data
      queryClient.setQueryData(['group', groupId], (old: Group | undefined) => ({
        ...old,
        is_member: true,
        member_count: (old?.member_count || 0) + 1
      }));

      // Optimistically update members list
      if (currentUser && previousMembers) {
        queryClient.setQueryData(['group-members', groupId], (old: GroupMember[] | undefined) => [
          ...(old || []),
          {
            id: `temp-${Date.now()}`,
            user: {
              id: currentUser.id,
              username: currentUser.username,
              avatar_url: currentUser.avatar_url
            },
            group: groupId,
            role: 'member',
            joined_at: new Date().toISOString()
          }
        ]);
      }

      // Optimistically update groups list
      queryClient.setQueryData(['groups'], (old: Group[] | undefined) => {
        if (!old) return old;
        return old.map((g: Group) => 
          String(g.id) === groupId 
            ? { ...g, is_member: true, member_count: (g.member_count || 0) + 1 }
            : g
        );
      });

      return { previousGroup, previousMembers, previousGroups };
    },
    onError: (error: ApiError, variables, context) => {
      // Rollback on error
      if (context?.previousGroup) {
        queryClient.setQueryData(['group', groupId], context.previousGroup);
      }
      if (context?.previousMembers) {
        queryClient.setQueryData(['group-members', groupId], context.previousMembers);
      }
      if (context?.previousGroups) {
        queryClient.setQueryData(['groups'], context.previousGroups);
      }
      
      const errorMessage = error?.response?.data?.error || "Fehler beim Beitreten der Gruppe";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onSuccess: () => {
      toast.success(`Du bist der Gruppe "${group?.name || 'dieser Gruppe'}" beigetreten.`);
    }
  });

  // Mutation for leaving a group
  const { mutate: leaveGroup, isPending: isLeaving } = useMutation({
    mutationFn: () => djangoApi.leaveGroup(groupId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['group', groupId] });
      await queryClient.cancelQueries({ queryKey: ['group-members', groupId] });
      await queryClient.cancelQueries({ queryKey: ['groups'] });

      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(['group', groupId]);
      const previousMembers = queryClient.getQueryData(['group-members', groupId]);
      const previousGroups = queryClient.getQueryData(['groups']);

      // Optimistically update group data
      queryClient.setQueryData(['group', groupId], (old: Group | undefined) => ({
        ...old,
        is_member: false,
        member_count: Math.max((old?.member_count || 1) - 1, 0)
      }));

      // Optimistically update members list
      if (currentUser && previousMembers) {
        queryClient.setQueryData(['group-members', groupId], (old: GroupMember[] | undefined) => 
          (old || []).filter((m: GroupMember) => String(m.user.id) !== String(currentUser.id))
        );
      }

      // Optimistically update groups list
      queryClient.setQueryData(['groups'], (old: Group[] | undefined) => {
        if (!old) return old;
        return old.map((g: Group) => 
          String(g.id) === groupId 
            ? { ...g, is_member: false, member_count: Math.max((g.member_count || 1) - 1, 0) }
            : g
        );
      });

      return { previousGroup, previousMembers, previousGroups };
    },
    onError: (error: ApiError, variables, context) => {
      // Rollback on error
      if (context?.previousGroup) {
        queryClient.setQueryData(['group', groupId], context.previousGroup);
      }
      if (context?.previousMembers) {
        queryClient.setQueryData(['group-members', groupId], context.previousMembers);
      }
      if (context?.previousGroups) {
        queryClient.setQueryData(['groups'], context.previousGroups);
      }
      
      const errorMessage = error?.response?.data?.error || "Fehler beim Verlassen der Gruppe";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onSuccess: () => {
      toast.success(`Du hast die Gruppe "${group?.name || 'diese Gruppe'}" verlassen.`);
    }
  });

  const isMember = group?.is_member ?? false;
  
  // Improved admin detection with multiple checks
  const isAdmin = React.useMemo(() => {
    if (!currentUser?.id || !Array.isArray(members)) return false;
    const currentUserId = String(currentUser.id);
    const membership = members.find(m => String(m.user.id) === currentUserId);
    return membership?.role === 'admin';
  }, [currentUser?.id, members]);

  // Additional role checks for better UX
  const isModerator = React.useMemo(() => {
    if (!currentUser?.id || !Array.isArray(members)) return false;
    const currentUserId = String(currentUser.id);
    const membership = members.find(m => String(m.user.id) === currentUserId);
    return membership?.role === 'moderator' || membership?.role === 'admin';
  }, [currentUser?.id, members]);

  const canManageMembers = isAdmin || isModerator;

  return {
    group,
    members: members || [],
    isMember,
    isAdmin,
    isModerator,
    canManageMembers,
    isLoading: isLoadingDetails || isLoadingMembers,
    isJoining,
    isLeaving,
    error: detailsError || membersError,
    joinGroup,
    leaveGroup
  };
};

// Hook for admin actions on group members (promote, demote, kick)
export const useGroupMemberAdminActions = (groupId: string) => {
  const queryClient = useQueryClient();
  const promote = useMutation({
    mutationFn: (userId: string) => groupMemberAdminAPI.promote(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
  const demote = useMutation({
    mutationFn: (userId: string) => groupMemberAdminAPI.demote(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
  const kick = useMutation({
    mutationFn: (userId: string) => groupMemberAdminAPI.kick(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
  return { promote, demote, kick };
};

// Hook to fetch events for a group
export const useGroupEvents = (groupId: string) => {
  return useQuery<GroupEvent[]>({
    queryKey: ['group-events', groupId],
    queryFn: async () => {
      console.log('[useGroupEvents] Fetching events for group ID:', groupId);
      const response = await groupEventsAPI.getEvents(groupId);
      console.log('[useGroupEvents] Events response:', response);
      // Handle both direct array and results property
      const events = Array.isArray(response) ? response : (response?.results || []);
      console.log('[useGroupEvents] Processed events:', events);
      return events;
    },
    enabled: !!groupId,
  });
};

// Hook to fetch paginated media for a group
export const useGroupMedia = (groupId: string, page: number = 1) => {
  return useQuery({
    queryKey: ['group-media', groupId, page],
    queryFn: async () => {
      const response = await groupMediaAPI.getMedia(groupId, page);
      return response;
    },
    enabled: !!groupId,
    keepPreviousData: true,
  });
};

// Hook to fetch paginated files for a group
export const useGroupFiles = (groupId: string, page: number = 1) => {
  return useQuery<{ results: GroupFile[]; count: number }>({
    queryKey: ['group-files', groupId, page],
    queryFn: async () => {
      return await groupFilesAPI.getFiles(groupId, page);
    },
    enabled: !!groupId,
    keepPreviousData: true,
  });
};

export const useGroupAnalytics = (groupId: string) => {
  return useQuery({
    queryKey: ['group-analytics', groupId],
    queryFn: async () => {
      console.log('[useGroupAnalytics] Fetching analytics for group ID:', groupId);
      const response = await groupAnalyticsAPI.getAnalytics(groupId);
      console.log('[useGroupAnalytics] Analytics response:', response);
      return response;
    },
    enabled: !!groupId,
  });
};

export const useGroupReports = (groupId: string) => {
  return useQuery<ContentReport[]>({
    queryKey: ['group-reports', groupId],
    queryFn: async () => {
      console.log('[useGroupReports] Fetching reports for group ID:', groupId);
      const reports = await groupReportsAPI.getReports(groupId);
      console.log('[useGroupReports] Reports response:', reports);
      return reports || [];
    },
    enabled: !!groupId,
  });
};

export const useGroupEventRSVP = (eventId: string) => {
  const queryClient = useQueryClient();
  // Eigener RSVP-Status
  const { data: myRSVP, refetch: refetchMyRSVP, isLoading: isLoadingMyRSVP } = useQuery(['event-my-rsvp', eventId], async () => {
    console.log('[useGroupEventRSVP] Fetching my RSVP for event ID:', eventId);
    const response = await groupEventRSVPAPI.getMyRSVP(eventId);
    console.log('[useGroupEventRSVP] My RSVP response:', response);
    return response;
  }, { enabled: !!eventId });
  // Alle RSVPs für das Event
  const { data: rsvpsData, refetch: refetchRSVPs, isLoading: isLoadingRSVPs } = useQuery(['event-rsvps', eventId], async () => {
    console.log('[useGroupEventRSVP] Fetching RSVPs for event ID:', eventId);
    const response = await groupEventRSVPAPI.getRSVPs(eventId);
    console.log('[useGroupEventRSVP] RSVPs response:', response);
    return response;
  }, { enabled: !!eventId });
  // RSVP setzen
  const { mutate: setRSVP, isLoading: isSettingRSVP } = useMutation(
    (status: 'going' | 'interested' | 'declined') => groupEventRSVPAPI.setRSVP(eventId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['event-my-rsvp', eventId]);
        queryClient.invalidateQueries(['event-rsvps', eventId]);
      },
    }
  );
  // Teilnehmer nach Status filtern
  const rsvps = rsvpsData?.results || [];
  const getByStatus = (status: 'going' | 'interested' | 'declined') => rsvps.filter(r => r.status === status);
  return {
    myRSVP,
    setRSVP,
    rsvps,
    getByStatus,
    refetch: () => { refetchMyRSVP(); refetchRSVPs(); },
    isLoading: isLoadingMyRSVP || isLoadingRSVPs,
    isSettingRSVP,
  };
};
