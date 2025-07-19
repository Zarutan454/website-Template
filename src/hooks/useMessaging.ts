import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.utils';
import { api } from '../utils/api';

export interface Message {
  id: number;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice' | 'location';
  media_url?: string;
  voice_duration?: number;
  voice_waveform?: number[];
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  is_own_message: boolean;
  reactions?: Array<{
    reaction_type: string;
    count: number;
  }>;
}

export interface Conversation {
  id: number;
  conversation_type: 'direct' | 'group';
  name?: string;
  participants: Array<{
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
    is_online?: boolean;
  }>;
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

export interface ConversationStats {
  conversation_id: number;
  total_messages: number;
  unread_messages: number;
  participants: Array<{
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
    is_online: boolean;
  }>;
  last_updated: string;
}

export interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  typingUsers: string[];
  hasMoreMessages: boolean;
  error: string | null;
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [state, setState] = useState<MessagingState>({
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    isTyping: false,
    typingUsers: [],
    hasMoreMessages: true,
    error: null,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Message handling - moved before connectWebSocket
  const handleNewMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.concat(message),
      currentConversation: prev.currentConversation ? {
        ...prev.currentConversation,
        last_message: message,
        unread_count: message.is_own_message ? prev.currentConversation.unread_count : prev.currentConversation.unread_count + 1,
        updated_at: message.created_at,
      } : null,
    }));
  }, []);

  const handleTypingIndicator = useCallback((data: { is_typing: boolean; username: string }) => {
    setState(prev => ({
      ...prev,
      typingUsers: data.is_typing 
        ? [...prev.typingUsers.filter(user => user !== data.username), data.username]
        : prev.typingUsers.filter(user => user !== data.username),
    }));
  }, []);

  const handleReadReceipt = useCallback((data: { message_ids: number[] }) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        data.message_ids.includes(msg.id) 
          ? { ...msg, is_read: true }
          : msg
      ),
    }));
  }, []);

  const handleReactionUpdate = useCallback((data: { message_id: number; action: string; reaction_type: string }) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === data.message_id 
          ? {
              ...msg,
              reactions: data.action === 'add'
                ? [...(msg.reactions || []), { reaction_type: data.reaction_type, count: 1 }]
                : (msg.reactions || []).filter(r => r.reaction_type !== data.reaction_type),
            }
          : msg
      ),
    }));
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback((conversationId: number) => {
    if (!user) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/messaging/${conversationId}/`;
    
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = () => {
      console.log('WebSocket connected for messaging');
    };

    websocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          handleNewMessage(data.message);
          break;
        case 'typing':
          handleTypingIndicator(data);
          break;
        case 'read':
          handleReadReceipt(data);
          break;
        case 'reaction':
          handleReactionUpdate(data);
          break;
        case 'connection_established':
          console.log('Messaging WebSocket connected');
          break;
        case 'error':
          setState(prev => ({ ...prev, error: data.message }));
          break;
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState(prev => ({ ...prev, error: 'WebSocket connection error' }));
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }, [user, handleNewMessage, handleTypingIndicator, handleReadReceipt, handleReactionUpdate]);

  const disconnectWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  }, []);

  // API calls
  const getConversations = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get('/messaging/conversations/');
      setState(prev => ({
        ...prev,
        conversations: response.data.conversations,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load conversations',
        isLoading: false,
      }));
    }
  }, [user]);

  const getMessages = useCallback(async (conversationId: number, limit = 50, offset = 0) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/messages/`, {
        params: { limit, offset, decrypt: true }
      });

      const newMessages = response.data.messages;
      
      setState(prev => ({
        ...prev,
        messages: offset === 0 ? newMessages : [...prev.messages, ...newMessages],
        hasMoreMessages: newMessages.length === limit,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load messages',
        isLoading: false,
      }));
    }
  }, [user]);

  const sendMessage = useCallback(async (
    conversationId: number,
    content: string,
    messageType: string = 'text',
    mediaUrl?: string,
    voiceDuration?: number,
    voiceWaveform?: number[],
    encrypt: boolean = true
  ) => {
    if (!user) return;

    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/messages/`, {
        content,
        message_type: messageType,
        media_url: mediaUrl,
        voice_duration: voiceDuration,
        voice_waveform: voiceWaveform,
        encrypt,
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
      }));
      throw error;
    }
  }, [user]);

  const sendVoiceMessage = useCallback(async (
    conversationId: number,
    voiceFile: File,
    duration: number,
    waveform?: number[]
  ) => {
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append('voice_file', voiceFile);
      formData.append('duration', duration.toString());
      if (waveform) {
        formData.append('waveform', JSON.stringify(waveform));
      }

      const response = await api.post(`/messaging/conversations/${conversationId}/voice-message/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending voice message:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send voice message',
      }));
      throw error;
    }
  }, [user]);

  const markMessagesRead = useCallback(async (conversationId: number, messageIds?: number[]) => {
    if (!user) return;

    try {
      await api.post(`/messaging/conversations/${conversationId}/mark-read/`, {
        message_ids: messageIds || [],
      });

      // Update local state
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          !messageIds || messageIds.includes(msg.id)
            ? { ...msg, is_read: true }
            : msg
        ),
        currentConversation: prev.currentConversation ? {
          ...prev.currentConversation,
          unread_count: 0,
        } : null,
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  const sendTypingIndicator = useCallback(async (conversationId: number, isTyping: boolean) => {
    if (!user || !websocketRef.current) return;

    try {
      websocketRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping,
      }));
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [user]);

  const addReaction = useCallback(async (messageId: number, reactionType: string) => {
    if (!user) return;

    try {
      await api.post(`/messaging/messages/${messageId}/reactions/`, {
        reaction_type: reactionType,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to add reaction',
      }));
    }
  }, [user]);

  const removeReaction = useCallback(async (messageId: number, reactionType: string) => {
    if (!user) return;

    try {
      await api.delete(`/messaging/messages/${messageId}/reactions/`, {
        data: { reaction_type: reactionType },
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to remove reaction',
      }));
    }
  }, [user]);

  const getConversationStats = useCallback(async (conversationId: number): Promise<ConversationStats | null> => {
    if (!user) return null;

    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return null;
    }
  }, [user]);

  // Typing indicator management
  const startTyping = useCallback((conversationId: number) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setState(prev => ({ ...prev, isTyping: true }));
    sendTypingIndicator(conversationId, true);

    typingTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isTyping: false }));
      sendTypingIndicator(conversationId, false);
    }, 3000);
  }, [sendTypingIndicator]);

  const stopTyping = useCallback((conversationId: number) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setState(prev => ({ ...prev, isTyping: false }));
    sendTypingIndicator(conversationId, false);
  }, [sendTypingIndicator]);

  // Conversation management
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setState(prev => ({ ...prev, currentConversation: conversation }));
    
    // Disconnect from previous WebSocket
    disconnectWebSocket();
    
    // Connect to new conversation WebSocket
    connectWebSocket(conversation.id);
    
    // Load messages
    await getMessages(conversation.id);
    
    // Mark messages as read
    if (conversation.unread_count > 0) {
      await markMessagesRead(conversation.id);
    }
  }, [connectWebSocket, disconnectWebSocket, getMessages, markMessagesRead]);

  // Cleanup
  useEffect(() => {
    return () => {
      const timeoutRef = typingTimeoutRef.current;
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  // --- Gruppenchat-spezifische Methoden ---

  /**
   * Hole Mitglieder einer Gruppe
   */
  const getGroupMembers = useCallback(async (groupId: string) => {
    if (!user) return [];
    try {
      const response = await api.get(`/groups/${groupId}/members/`);
      return response.data.members;
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  }, [user]);

  /**
   * Promote/Demote/Kick Member (Admin Controls)
   */
  const promoteGroupMember = useCallback(async (groupId: string, userId: string) => {
    if (!user) return;
    try {
      await api.post(`/groups/${groupId}/promote/${userId}/`);
    } catch (error) {
      console.error('Error promoting member:', error);
      throw error;
    }
  }, [user]);

  const demoteGroupMember = useCallback(async (groupId: string, userId: string) => {
    if (!user) return;
    try {
      await api.post(`/groups/${groupId}/demote/${userId}/`);
    } catch (error) {
      console.error('Error demoting member:', error);
      throw error;
    }
  }, [user]);

  const kickGroupMember = useCallback(async (groupId: string, userId: string) => {
    if (!user) return;
    try {
      await api.post(`/groups/${groupId}/kick/${userId}/`);
    } catch (error) {
      console.error('Error kicking member:', error);
      throw error;
    }
  }, [user]);

  /**
   * File Sharing: Datei in Gruppe hochladen
   */
  const uploadGroupFile = useCallback(async (groupId: string, file: File) => {
    if (!user) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/groups/${groupId}/file-upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading group file:', error);
      throw error;
    }
  }, [user]);

  /**
   * Datei aus Gruppennachricht herunterladen
   */
  const downloadGroupFile = useCallback(async (messageId: string) => {
    if (!user) return null;
    try {
      const response = await api.get(`/groups/messages/${messageId}/file-download/`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Error downloading group file:', error);
      throw error;
    }
  }, [user]);

  /**
   * Nachrichtensuche in Gruppe
   */
  const searchGroupMessages = useCallback(async (groupId: string, query: string) => {
    if (!user) return [];
    try {
      const response = await api.get(`/groups/${groupId}/search/`, { params: { q: query } });
      return response.data.messages;
    } catch (error) {
      console.error('Error searching group messages:', error);
      return [];
    }
  }, [user]);

  /**
   * Nachrichten einer Gruppe holen
   */
  const getGroupMessages = useCallback(async (groupId: string, limit = 50, offset = 0) => {
    if (!user) return [];
    try {
      const response = await api.get(`/groups/${groupId}/messages/`, { params: { limit, offset } });
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }
  }, [user]);

  /**
   * Nachricht in Gruppe senden
   */
  const sendGroupMessage = useCallback(async (
    groupId: string,
    content: string,
    messageType: string = 'text',
    attachmentUrl?: string,
    attachmentName?: string,
    attachmentSize?: number,
    attachmentType?: string
  ) => {
    if (!user) return;
    try {
      const response = await api.post(`/groups/${groupId}/messages/`, {
        content,
        message_type: messageType,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_size: attachmentSize,
        attachment_type: attachmentType,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }, [user]);

  // Advanced Messaging Features
  const createGroupConversation = useCallback(async (
    name: string,
    participantIds: number[],
    description?: string,
    isPrivate: boolean = false
  ) => {
    if (!user) return;

    try {
      const response = await api.post('/messaging/groups/create/', {
        name,
        participant_ids: participantIds,
        description,
        is_private: isPrivate,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating group conversation:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to create group conversation',
      }));
      throw error;
    }
  }, [user]);

  const addGroupParticipant = useCallback(async (
    conversationId: number,
    participantId: number
  ) => {
    if (!user) return;

    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/participants/add/`, {
        participant_id: participantId,
      });

      return response.data;
    } catch (error) {
      console.error('Error adding group participant:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to add participant',
      }));
      throw error;
    }
  }, [user]);

  const removeGroupParticipant = useCallback(async (
    conversationId: number,
    participantId: number
  ) => {
    if (!user) return;

    try {
      const response = await api.delete(`/messaging/conversations/${conversationId}/participants/${participantId}/remove/`);

      return response.data;
    } catch (error) {
      console.error('Error removing group participant:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to remove participant',
      }));
      throw error;
    }
  }, [user]);

  const promoteGroupParticipant = useCallback(async (
    conversationId: number,
    participantId: number,
    newRole: 'moderator' | 'admin'
  ) => {
    if (!user) return;

    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/participants/${participantId}/promote/`, {
        new_role: newRole,
      });

      return response.data;
    } catch (error) {
      console.error('Error promoting group participant:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to promote participant',
      }));
      throw error;
    }
  }, [user]);

  const getGroupInfo = useCallback(async (conversationId: number) => {
    if (!user) return;

    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/group-info/`);
      return response.data;
    } catch (error) {
      console.error('Error getting group info:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get group info',
      }));
      throw error;
    }
  }, [user]);

  const searchMessages = useCallback(async (
    conversationId: number,
    query: string,
    limit: number = 20,
    offset: number = 0
  ) => {
    if (!user) return;

    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/search/`, {
        params: { q: query, limit, offset },
      });

      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to search messages',
      }));
      throw error;
    }
  }, [user]);

  const getMessageAnalytics = useCallback(async (
    conversationId: number,
    days: number = 30
  ) => {
    if (!user) return;

    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/analytics/`, {
        params: { days },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting message analytics:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get message analytics',
      }));
      throw error;
    }
  }, [user]);

  const getConversationStatsAdvanced = useCallback(async (conversationId: number) => {
    if (!user) return;

    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get conversation stats',
      }));
      throw error;
    }
  }, [user]);

  return {
    ...state,
    getConversations,
    getMessages,
    sendMessage,
    sendVoiceMessage,
    markMessagesRead,
    sendTypingIndicator,
    addReaction,
    removeReaction,
    getConversationStats: getConversationStatsAdvanced,
    startTyping,
    stopTyping,
    selectConversation,
    connectWebSocket,
    disconnectWebSocket,
    // --- Gruppenchat-Features ---
    getGroupMembers,
    promoteGroupMember,
    demoteGroupMember,
    kickGroupMember,
    uploadGroupFile,
    downloadGroupFile,
    searchGroupMessages,
    getGroupMessages,
    sendGroupMessage,
    // --- Advanced Messaging Features ---
    createGroupConversation,
    addGroupParticipant,
    removeGroupParticipant,
    promoteGroupParticipant,
    getGroupInfo,
    searchMessages,
    getMessageAnalytics,
  };
}; 