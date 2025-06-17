import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useProfile } from './useProfile';
import { toast } from 'sonner';
import { Message } from './useMessages';

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  members_count?: number;
  creator_username?: string;
  creator_display_name?: string;
  creator_avatar_url?: string;
  creator?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useGroupChat = (groupId?: string) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { 
    data: groups, 
    isLoading: isLoadingGroups, 
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['chat_groups', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];
        
        console.log('Fetching groups for user ID:', profile.id);
        
        const { data, error } = await supabase
          .from('group_members')
          .select(`
            group_id,
            chat_groups:group_id(
              id, 
              name, 
              description, 
              creator_id, 
              avatar_url, 
              created_at, 
              updated_at,
              creator:creator_id(id, username, display_name, avatar_url)
            )
          `)
          .eq('user_id', profile.id);
          
        if (error) {
          console.error('Error fetching groups:', error);
          throw error;
        }
        
        const groupsWithLastMessage = await Promise.all(
          data.map(async (item) => {
            const group = item.chat_groups as unknown as ChatGroup;
            
            const { data: lastMessageData, error: lastMessageError } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('group_id', group.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (lastMessageError && lastMessageError.code !== 'PGRST116') {
              console.error('Error fetching last message:', lastMessageError);
            }
            
            const { count, error: countError } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('group_id', group.id)
              .eq('read', false)
              .neq('sender_id', profile.id);
              
            if (countError) {
              console.error('Error fetching unread count:', countError);
            }
            
            const { count: membersCount, error: membersCountError } = await supabase
              .from('group_members')
              .select('id', { count: 'exact', head: true })
              .eq('group_id', group.id);
              
            if (membersCountError) {
              console.error('Error fetching members count:', membersCountError);
            }
            
            return {
              ...group,
              last_message: lastMessageData?.content,
              last_message_at: lastMessageData?.created_at || group.created_at,
              unread_count: count || 0,
              members_count: membersCount || 0,
              creator_username: group.creator?.username,
              creator_display_name: group.creator?.display_name,
              creator_avatar_url: group.creator?.avatar_url
            };
          })
        );
        
        return groupsWithLastMessage.sort((a, b) => {
          const dateA = new Date(a.last_message_at || a.created_at);
          const dateB = new Date(b.last_message_at || b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (error) {
        console.error('Error in groups query:', error);
        toast.error('Fehler beim Laden der Gruppen');
        return [];
      }
    },
    enabled: !!profile,
  });

  const { 
    data: messages, 
    isLoading: isLoadingMessages, 
    error: messagesError 
  } = useQuery({
    queryKey: ['group_messages', groupId],
    queryFn: async () => {
      try {
        if (!groupId || !profile) return [];
        
        console.log('Fetching messages for group:', groupId);
        
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(id, username, avatar_url, display_name)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching group messages:', error);
          throw error;
        }
        
        return data.map(message => ({
          ...message,
          sender_username: message.sender?.username,
          sender_avatar_url: message.sender?.avatar_url,
          sender_display_name: message.sender?.display_name,
        })) as Message[];
      } catch (error) {
        console.error('Error fetching group messages:', error);
        toast.error('Fehler beim Laden der Nachrichten');
        return [];
      }
    },
    enabled: !!groupId && !!profile,
  });

  const { 
    data: members, 
    isLoading: isLoadingMembers, 
    error: membersError,
    refetch: refetchMembers
  } = useQuery({
    queryKey: ['group_members', groupId],
    queryFn: async () => {
      try {
        if (!groupId || !profile) return [];
        
        console.log('Fetching members for group:', groupId);
        
        const { data, error } = await supabase
          .from('group_members')
          .select(`
            *,
            user:user_id(id, username, avatar_url, display_name)
          `)
          .eq('group_id', groupId);
          
        if (error) {
          console.error('Error fetching group members:', error);
          throw error;
        }
        
        return data.map(member => ({
          ...member,
          username: member.user?.username,
          display_name: member.user?.display_name,
          avatar_url: member.user?.avatar_url,
        })) as GroupMember[];
      } catch (error) {
        console.error('Error fetching group members:', error);
        toast.error('Fehler beim Laden der Gruppenmitglieder');
        return [];
      }
    },
    enabled: !!groupId && !!profile,
  });

  const createGroup = useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      avatar_url 
    }: { 
      name: string; 
      description?: string; 
      avatar_url?: string;
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um eine Gruppe zu erstellen');
        }
        
        console.log('Creating new group:', name);
        
        const { data: groupData, error: groupError } = await supabase
          .from('chat_groups')
          .insert({
            name,
            description,
            creator_id: profile.id,
            avatar_url
          })
          .select()
          .single();
          
        if (groupError) {
          console.error('Error creating group:', groupError);
          throw groupError;
        }
        
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupData.id,
            user_id: profile.id,
            role: 'admin'
          });
          
        if (memberError) {
          console.error('Error adding creator as admin:', memberError);
          throw memberError;
        }
        
        console.log('Group created successfully:', groupData);
        
        return groupData as ChatGroup;
      } catch (error) {
        console.error('Error creating group:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_groups'] });
      toast.success('Gruppe erfolgreich erstellt');
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen der Gruppe');
      console.error(error);
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ 
      groupId, 
      userId, 
      role = 'member' 
    }: { 
      groupId: string; 
      userId: string; 
      role?: 'admin' | 'member';
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Mitglieder hinzuzufügen');
        }
        
        console.log('Adding member to group:', groupId, userId, role);
        
        const { data: existingMember, error: checkError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking existing member:', checkError);
          throw checkError;
        }
        
        if (existingMember) {
          console.log('User is already a member of this group');
          return existingMember;
        }
        
        const { data, error } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: userId,
            role
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error adding member:', error);
          throw error;
        }
        
        console.log('Member added successfully:', data);
        
        return data;
      } catch (error) {
        console.error('Error adding member:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group_members', groupId] });
      toast.success('Mitglied erfolgreich hinzugefügt');
    },
    onError: (error) => {
      toast.error('Fehler beim Hinzufügen des Mitglieds');
      console.error(error);
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ 
      groupId, 
      userId 
    }: { 
      groupId: string; 
      userId: string;
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Mitglieder zu entfernen');
        }
        
        console.log('Removing member from group:', groupId, userId);
        
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', userId);
          
        if (error) {
          console.error('Error removing member:', error);
          throw error;
        }
        
        console.log('Member removed successfully');
        
        return { success: true };
      } catch (error) {
        console.error('Error removing member:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group_members', groupId] });
      toast.success('Mitglied erfolgreich entfernt');
    },
    onError: (error) => {
      toast.error('Fehler beim Entfernen des Mitglieds');
      console.error(error);
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ 
      groupId, 
      userId, 
      role 
    }: { 
      groupId: string; 
      userId: string; 
      role: 'admin' | 'member';
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Rollen zu ändern');
        }
        
        console.log('Updating member role:', groupId, userId, role);
        
        const { data, error } = await supabase
          .from('group_members')
          .update({ role })
          .eq('group_id', groupId)
          .eq('user_id', userId)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating member role:', error);
          throw error;
        }
        
        console.log('Member role updated successfully:', data);
        
        return data;
      } catch (error) {
        console.error('Error updating member role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group_members', groupId] });
      toast.success('Rolle erfolgreich aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren der Rolle');
      console.error(error);
    },
  });

  const sendGroupMessage = useMutation({
    mutationFn: async ({ 
      content, 
      attachment_url, 
      message_type = 'text',
      attachment_name,
      attachment_size,
      attachment_type
    }: { 
      content: string; 
      attachment_url?: string;
      message_type?: 'text' | 'image' | 'video' | 'audio' | 'file';
      attachment_name?: string;
      attachment_size?: number;
      attachment_type?: string;
    }) => {
      try {
        if (!groupId || !profile) {
          throw new Error('Gruppe oder Benutzer nicht gefunden');
        }
        
        console.log('Sending message to group:', groupId);
        
        const messageData: any = {
          group_id: groupId,
          sender_id: profile.id,
          content,
          message_type
        };
        
        if (attachment_url) {
          messageData.attachment_url = attachment_url;
          messageData.attachment_name = attachment_name;
          messageData.attachment_size = attachment_size;
          messageData.attachment_type = attachment_type;
        }
        
        const { data, error } = await supabase
          .from('messages')
          .insert(messageData)
          .select()
          .single();
          
        if (error) {
          console.error('Error sending group message:', error);
          throw error;
        }
        
        console.log('Group message sent successfully:', data);
        
        return data as Message;
      } catch (error) {
        console.error('Error sending group message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group_messages', groupId] });
      queryClient.invalidateQueries({ queryKey: ['chat_groups'] });
    },
    onError: (error) => {
      toast.error('Fehler beim Senden der Nachricht');
      console.error(error);
    },
  });

  const markGroupMessagesAsRead = useCallback(async () => {
    try {
      if (!groupId || !profile) return;
      
      console.log('Marking group messages as read:', groupId);
      
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('group_id', groupId)
        .eq('read', false)
        .neq('sender_id', profile.id);
        
      if (fetchError) {
        console.error('Error fetching unread group messages:', fetchError);
        throw fetchError;
      }
      
      if (!unreadMessages || unreadMessages.length === 0) {
        console.log('No unread group messages to mark as read');
        return;
      }
      
      const messageIds = unreadMessages.map(msg => msg.id);
      console.log('Marking as read message IDs:', messageIds);
      
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
        
      if (updateError) {
        console.error('Error marking group messages as read:', updateError);
        throw updateError;
      }
      
      console.log('Group messages marked as read successfully');
      
      queryClient.invalidateQueries({ queryKey: ['group_messages', groupId] });
      queryClient.invalidateQueries({ queryKey: ['chat_groups'] });
    } catch (error) {
      console.error('Error marking group messages as read:', error);
    }
  }, [groupId, profile, queryClient]);

  useEffect(() => {
    if (!groupId || !profile) return;

    console.log('Setting up group message subscription for:', groupId);

    const groupChannel = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('New group message:', payload);
          
          if (payload.new && payload.new.sender_id !== profile.id) {
            markGroupMessagesAsRead();
          }
          
          queryClient.invalidateQueries({ queryKey: ['group_messages', groupId] });
          queryClient.invalidateQueries({ queryKey: ['chat_groups'] });
        }
      )
      .subscribe(status => {
        console.log('Group channel subscription status:', status);
      });

    markGroupMessagesAsRead();

    return () => {
      console.log('Removing group channel');
      supabase.removeChannel(groupChannel);
    };
  }, [groupId, profile, queryClient, markGroupMessagesAsRead]);

  const getUserRole = useCallback(() => {
    if (!members || !profile) return null;
    
    const member = members.find(m => m.user_id === profile.id);
    return member?.role || null;
  }, [members, profile]);

  const isAdmin = useCallback(() => {
    const role = getUserRole();
    return role === 'admin';
  }, [getUserRole]);

  return {
    groups,
    isLoadingGroups,
    groupsError,
    messages,
    isLoadingMessages,
    messagesError,
    members,
    isLoadingMembers,
    membersError,
    createGroup,
    addMember,
    removeMember,
    updateMemberRole,
    sendGroupMessage,
    markGroupMessagesAsRead,
    refetchGroups,
    refetchMembers,
    getUserRole,
    isAdmin
  };
};
