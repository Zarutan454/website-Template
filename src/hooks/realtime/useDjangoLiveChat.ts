import { useState, useEffect, useCallback } from 'react';
import { useDjangoWebSocket } from './useDjangoWebSocket';
import { useAuth } from '@/context/AuthContext.utils';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  sender_avatar_url?: string;
  conversation_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  attachment_url?: string;
  attachment_name?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  participants: string[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface UseDjangoLiveChatProps {
  conversationId?: string;
  autoJoin?: boolean;
}

/**
 * Django-basierter Live Chat Hook - Migriert von Supabase Real-time
 * 
 * ALT (Supabase):
 * const channel = supabase.channel(`conversation-${conversationId}`);
 * 
 * NEU (Django):
 * const { messages, sendMessage, joinConversation } = useDjangoLiveChat();
 */
export const useDjangoLiveChat = ({ conversationId, autoJoin = true }: UseDjangoLiveChatProps) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage: wsSendMessage,
    subscribe
  } = useDjangoWebSocket({ autoConnect: true });

  // Subscribe to chat events
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribeMessage = subscribe('message', (event) => {
      const message = event.data as ChatMessage;
      
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        return [...prev, message];
      });

      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === message.conversation_id 
            ? { ...conv, last_message: message, updated_at: message.created_at }
            : conv
        )
      );

      // Show notification if message is from another user
      if (message.sender_id !== user?.id) {
        toast.info(`Neue Nachricht von ${message.sender_username}`);
      }
    });

    const unsubscribeNotification = subscribe('notification', (event) => {
      const notification = event.data;
      if (notification.type === 'message') {
        // Handle message-related notifications
        console.log('Message notification:', notification);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeNotification();
    };
  }, [isAuthenticated, user, subscribe]);

  // Join conversation room
  const joinConversation = useCallback(async (convId: string) => {
    if (!isConnected) {
      toast.error('WebSocket nicht verbunden');
      return false;
    }

    try {
      await joinRoom(`conversation-${convId}`);
      console.log(`Joined conversation room: ${convId}`);
      return true;
    } catch (error) {
      console.error('Error joining conversation:', error);
      toast.error('Fehler beim Beitreten der Konversation');
      return false;
    }
  }, [isConnected, joinRoom]);

  // Leave conversation room
  const leaveConversation = useCallback(async (convId: string) => {
    try {
      await leaveRoom(`conversation-${convId}`);
      console.log(`Left conversation room: ${convId}`);
      return true;
    } catch (error) {
      console.error('Error leaving conversation:', error);
      return false;
    }
  }, [leaveRoom]);

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' = 'text', attachmentUrl?: string) => {
    if (!conversationId || !isAuthenticated) {
      toast.error('Keine Konversation ausgewählt oder nicht angemeldet');
      return false;
    }

    try {
      const message = {
        type: 'chat_message',
        data: {
          content,
          conversation_id: conversationId,
          message_type: messageType,
          attachment_url: attachmentUrl,
          timestamp: new Date().toISOString()
        }
      };

      await wsSendMessage(message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
      return false;
    }
  }, [conversationId, isAuthenticated, wsSendMessage]);

  // Mark messages as read
  const markAsRead = useCallback(async (convId: string) => {
    try {
      await wsSendMessage({
        type: 'mark_read',
        data: {
          conversation_id: convId,
          timestamp: new Date().toISOString()
        }
      });

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === convId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }, [wsSendMessage]);

  // Create new conversation
  const createConversation = useCallback(async (participants: string[], name?: string, isGroup = false) => {
    try {
      const result = await wsSendMessage({
        type: 'create_conversation',
        data: {
          participants,
          name,
          is_group: isGroup,
          timestamp: new Date().toISOString()
        }
      });

      if (result) {
        toast.success('Konversation erstellt');
      }

      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Fehler beim Erstellen der Konversation');
      return false;
    }
  }, [wsSendMessage]);

  // Add participant to conversation
  const addParticipant = useCallback(async (convId: string, userId: string) => {
    try {
      await wsSendMessage({
        type: 'add_participant',
        data: {
          conversation_id: convId,
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Teilnehmer hinzugefügt');
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Fehler beim Hinzufügen des Teilnehmers');
      return false;
    }
  }, [wsSendMessage]);

  // Remove participant from conversation
  const removeParticipant = useCallback(async (convId: string, userId: string) => {
    try {
      await wsSendMessage({
        type: 'remove_participant',
        data: {
          conversation_id: convId,
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Teilnehmer entfernt');
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Fehler beim Entfernen des Teilnehmers');
      return false;
    }
  }, [wsSendMessage]);

  // Auto-join conversation when conversationId changes
  useEffect(() => {
    if (conversationId && autoJoin && isConnected) {
      joinConversation(conversationId);
      
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, autoJoin, isConnected, joinConversation, leaveConversation]);

  return {
    // State
    messages,
    conversations,
    isLoading,
    error,
    isConnected,

    // Actions
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    createConversation,
    addParticipant,
    removeParticipant
  };
}; 

