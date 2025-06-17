
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  sender_username?: string;
  sender_avatar_url?: string;
  sender_display_name?: string;
  attachment_url?: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  group_id?: string;
}

export interface Conversation {
  id: string;
  creator_id: string;
  recipient_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  recipient_username?: string;
  recipient_avatar_url?: string;
  recipient_display_name?: string;
  creator_username?: string;
  creator_avatar_url?: string;
  creator_display_name?: string;
  last_message?: string;
  unread_count?: number;
}

export const useUserSearch = () => {
  const [users, setUsers] = useState<{id: string; username: string; display_name?: string; avatar_url?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return [];
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
      return data || [];
    } catch (error) {
      setUsers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findRelatedUsers = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // Find users that the current user is following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
        .limit(10);

      if (followingError) throw followingError;

      if (followingData && followingData.length > 0) {
        const followingIds = followingData.map(f => f.following_id);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url')
          .in('id', followingIds)
          .limit(10);

        if (userError) throw userError;
        return userData || [];
      }
      
      // Fallback to recent users if no followings
      const { data: recentUsers, error: recentError } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url')
        .neq('id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;
      return recentUsers || [];
    } catch (error) {
      console.error('Error finding related users:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    searchUsers,
    findRelatedUsers
  };
};

const useConversations = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['conversations', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];
        
        console.log('Fetching conversations for user ID:', profile.id);
        
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            creator:creator_id(id, username, avatar_url, display_name),
            recipient:recipient_id(id, username, avatar_url, display_name)
          `)
          .or(`creator_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
          .order('last_message_at', { ascending: false });
          
        if (error) {
          console.error('Error in conversation query:', error);
          throw error;
        }
        
        // Debug log to check the returned data
        console.log('Fetched conversations:', data);
        
        // Transform data to include partner information
        return data.map(conv => {
          const isCreator = conv.creator_id === profile.id;
          const partner = isCreator ? conv.recipient : conv.creator;
          
          if (!partner) {
            console.warn('Partner information missing for conversation:', conv.id);
          }
          
          // Debug log to check partner information
          console.log('Partner for conversation:', conv.id, partner);
          
          return {
            ...conv,
            recipient_username: isCreator ? partner?.username : conv.creator?.username,
            recipient_avatar_url: isCreator ? partner?.avatar_url : conv.creator?.avatar_url,
            recipient_display_name: isCreator ? partner?.display_name : conv.creator?.display_name,
            creator_username: isCreator ? conv.creator?.username : partner?.username,
            creator_avatar_url: isCreator ? conv.creator?.avatar_url : partner?.avatar_url,
            creator_display_name: isCreator ? conv.creator?.display_name : partner?.display_name
          };
        });
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Fehler beim Laden der Konversationen');
        return [];
      }
    },
    enabled: !!profile,
  });

  const createConversation = async (recipientId: string): Promise<Conversation | null> => {
    try {
      if (!profile) {
        toast.error('Du musst angemeldet sein, um Nachrichten zu senden');
        return null;
      }
      
      console.log('Creating conversation between', profile.id, 'and', recipientId);
      
      // Check if conversation already exists
      const { data: existingConversations, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(
          `and(creator_id.eq.${profile.id},recipient_id.eq.${recipientId}),` +
          `and(creator_id.eq.${recipientId},recipient_id.eq.${profile.id})`
        );
      
      if (checkError) {
        console.error('Error checking existing conversations:', checkError);
        throw checkError;
      }
        
      if (existingConversations && existingConversations.length > 0) {
        console.log('Found existing conversation:', existingConversations[0]);
        return existingConversations[0] as Conversation;
      }
      
      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          creator_id: profile.id,
          recipient_id: recipientId,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
      
      console.log('Created new conversation:', data);
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      return data as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Fehler beim Erstellen der Konversation');
      return null;
    }
  };

  return {
    conversations,
    isLoading,
    error,
    createConversation,
  };
};

export const useMessages = (conversationId: string | null) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      try {
        if (!conversationId || !profile) return [];
        
        console.log('Fetching messages for conversation:', conversationId);
        
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(id, username, avatar_url, display_name)
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching messages:', error);
          throw error;
        }
        
        console.log('Fetched messages:', data);
        
        return data.map(message => ({
          ...message,
          sender_username: message.sender?.username,
          sender_avatar_url: message.sender?.avatar_url,
          sender_display_name: message.sender?.display_name,
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Fehler beim Laden der Nachrichten');
        return [];
      }
    },
    enabled: !!conversationId && !!profile,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ 
      content, 
      attachment_url, 
      message_type = 'text',
      attachment_name,
      attachment_size,
      attachment_type,
      group_id
    }: { 
      content: string; 
      attachment_url?: string;
      message_type?: 'text' | 'image' | 'video' | 'audio' | 'file';
      attachment_name?: string;
      attachment_size?: number;
      attachment_type?: string;
      group_id?: string;
    }) => {
      try {
        if ((!conversationId && !group_id) || !profile) {
          throw new Error('Konversation, Gruppe oder Benutzer nicht gefunden');
        }
        
        console.log('Sending message in conversation:', conversationId || 'group: ' + group_id);
        
        const messageData: any = {
          sender_id: profile.id,
          content,
          message_type
        };
        
        if (conversationId) {
          messageData.conversation_id = conversationId;
        }
        
        if (group_id) {
          messageData.group_id = group_id;
        }
        
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
          console.error('Error sending message:', error);
          throw error;
        }
        
        console.log('Message sent successfully:', data);
        
        return data as Message;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error('Fehler beim Senden der Nachricht');
      console.error(error);
    },
  });

  const markAsRead = useCallback(async () => {
    try {
      if (!conversationId || !profile) return;
      
      console.log('Marking messages as read in conversation:', conversationId);
      
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .neq('sender_id', profile.id);
        
      if (fetchError) {
        console.error('Error fetching unread messages:', fetchError);
        throw fetchError;
      }
      
      if (!unreadMessages || unreadMessages.length === 0) {
        console.log('No unread messages to mark as read');
        return;
      }
      
      const messageIds = unreadMessages.map(msg => msg.id);
      console.log('Marking as read message IDs:', messageIds);
      
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
        
      if (updateError) {
        console.error('Error marking messages as read:', updateError);
        throw updateError;
      }
      
      console.log('Messages marked as read successfully');
      
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [conversationId, profile, queryClient]);

  useEffect(() => {
    if (!profile) return;

    console.log('Setting up global message listener for user:', profile.id);

    const globalChannel = supabase
      .channel('global-new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${profile.id}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          try {
            // Fetch conversation details
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', newMessage.conversation_id)
              .or(`creator_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
              .single();
              
            if (convError) {
              console.error('Error fetching conversation:', convError);
              return;
            }
            
            if (!conversation) {
              console.log('Conversation not found or not related to current user');
              return;
            }
            
            // Fetch sender details
            const { data: sender, error: senderError } = await supabase
              .from('users')
              .select('username, display_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();
              
            if (senderError) {
              console.error('Error fetching sender:', senderError);
            }
            
            const isCurrentConversation = conversationId === newMessage.conversation_id;
            
            // Show notification if not in current conversation
            if (!isCurrentConversation) {
              toast(
                sender?.display_name || sender?.username || 'Neuer Kontakt',
                {
                  description: newMessage.content.length > 60 
                    ? newMessage.content.substring(0, 60) + '...' 
                    : newMessage.content,
                  position: 'top-right',
                  duration: 5000,
                  action: {
                    label: 'Anzeigen',
                    onClick: () => {
                      window.location.href = `/messages/${newMessage.conversation_id}`;
                    }
                  }
                }
              );
            } else {
              // Automatically mark as read if in current conversation
              markAsRead();
            }
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            
            if (isCurrentConversation) {
              queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe(status => {
        console.log('Global channel subscription status:', status);
      });

    return () => {
      console.log('Removing global channel');
      supabase.removeChannel(globalChannel);
    };
  }, [profile, conversationId, queryClient, markAsRead]);

  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up conversation specific channel for:', conversationId);

    const conversationChannel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('New message in conversation:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          
          // Mark messages as read if the message is from another user
          if (payload.new && payload.new.sender_id !== profile?.id) {
            markAsRead();
          }
        }
      )
      .subscribe(status => {
        console.log('Conversation channel subscription status:', status);
      });

    // Mark messages as read when first entering conversation
    markAsRead();

    return () => {
      console.log('Removing conversation channel');
      supabase.removeChannel(conversationChannel);
    };
  }, [conversationId, profile, queryClient, markAsRead]);

  const { conversations, isLoading: conversationsLoading, createConversation } = useConversations();

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    conversations,
    conversationsLoading,
    createConversation
  };
};

export { useConversations };
