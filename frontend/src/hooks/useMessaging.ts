import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from './useWebSocket';
import { api } from '../services/api';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  message_type: 'text' | 'voice';
  voice_url?: string;
  timestamp: string;
  is_read: boolean;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  id: number;
  reaction_type: string;
  user_id: number;
  user_name: string;
}

export interface Conversation {
  id: number;
  participants: ConversationParticipant[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get('/chat/conversations/');
      setConversations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const updateConversationLastMessage = useCallback((conversationId: number, message: Message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, last_message: message, unread_count: conv.unread_count + 1 }
          : conv
      )
    );
  }, []);

  const markConversationAsRead = useCallback((conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  }, []);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    updateConversationLastMessage,
    markConversationAsRead
  };
};

export const useMessages = (conversationId: number | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      const response = await api.get(`/chat/conversations/${conversationId}/messages/`, {
        params: { page: pageNum }
      });
      
      const newMessages = response.data.results || response.data;
      
      if (pageNum === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMore(newMessages.length === 20); // Assuming page size is 20
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
    }
  }, [conversationId, fetchMessages]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessageReaction = useCallback((messageId: number, reactionType: string, action: 'add' | 'remove', userId: number, userName: string) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          let reactions = [...msg.reactions];
          
          if (action === 'add') {
            // Remove existing reaction from this user if exists
            reactions = reactions.filter(r => !(r.user_id === userId && r.reaction_type === reactionType));
            // Add new reaction
            reactions.push({
              id: Date.now(), // Temporary ID
              reaction_type: reactionType,
              user_id: userId,
              user_name: userName
            });
          } else {
            // Remove reaction
            reactions = reactions.filter(r => !(r.user_id === userId && r.reaction_type === reactionType));
          }
          
          return { ...msg, reactions };
        }
        return msg;
      })
    );
  }, []);

  const markMessageAsRead = useCallback((messageId: number) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );
  }, []);

  return {
    messages,
    loading,
    error,
    hasMore,
    fetchMessages,
    addMessage,
    updateMessageReaction,
    markMessageAsRead,
    loadMore: () => fetchMessages(page + 1)
  };
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    conversationId: number, 
    content: string, 
    messageType: 'text' | 'voice' = 'text',
    voiceUrl?: string
  ) => {
    if (!user || !content.trim()) return null;

    try {
      setSending(true);
      setError(null);
      
      const response = await api.post(`/chat/conversations/${conversationId}/messages/`, {
        content,
        message_type: messageType,
        voice_url: voiceUrl
      });
      
      return response.data;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return null;
    } finally {
      setSending(false);
    }
  }, [user]);

  return {
    sendMessage,
    sending,
    error
  };
};

export const useTypingIndicator = (conversationId: number | null) => {
  const [typingUsers, setTypingUsers] = useState<{ [key: number]: string }>({});
  const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const { sendTyping } = useWebSocket(
    undefined, // onMessageReceived
    (data) => {
      if (data.conversationId === conversationId) {
        if (data.isTyping) {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: data.userName
          }));
        } else {
          setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[data.userId];
            return newState;
          });
        }
      }
    }
  );

  const startTyping = useCallback(() => {
    if (conversationId) {
      sendTyping(conversationId, true);
    }
  }, [conversationId, sendTyping]);

  const stopTyping = useCallback(() => {
    if (conversationId) {
      sendTyping(conversationId, false);
    }
  }, [conversationId, sendTyping]);

  const handleTyping = useCallback((userId: number) => {
    startTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current[userId]) {
      clearTimeout(typingTimeoutRef.current[userId]);
    }
    
    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current[userId] = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [startTyping, stopTyping]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    handleTyping
  };
};

export const useReadReceipts = (conversationId: number | null) => {
  const { sendReadReceipt } = useWebSocket(
    undefined, // onMessageReceived
    undefined, // onTypingIndicator
    (data) => {
      // Handle read receipt received
      console.log('Read receipt received:', data);
    }
  );

  const markAsRead = useCallback((messageId: number) => {
    if (conversationId) {
      sendReadReceipt(conversationId, messageId);
    }
  }, [conversationId, sendReadReceipt]);

  return {
    markAsRead
  };
};

export const useReactions = () => {
  const { sendReaction } = useWebSocket(
    undefined, // onMessageReceived
    undefined, // onTypingIndicator
    undefined, // onReadReceipt
    (data) => {
      // Handle reaction update received
      console.log('Reaction update received:', data);
    }
  );

  const addReaction = useCallback((messageId: number, reactionType: string) => {
    sendReaction(messageId, reactionType, 'add');
  }, [sendReaction]);

  const removeReaction = useCallback((messageId: number, reactionType: string) => {
    sendReaction(messageId, reactionType, 'remove');
  }, [sendReaction]);

  return {
    addReaction,
    removeReaction
  };
}; 