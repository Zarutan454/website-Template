import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WebSocketMessage {
  type: 'message_received' | 'typing_indicator' | 'read_receipt' | 'reaction_update';
  message?: {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_name: string;
    content: string;
    message_type: string;
    voice_url?: string;
    timestamp: string;
  };
  conversation_id?: number;
  user_id?: number;
  user_name?: string;
  is_typing?: boolean;
  message_id?: number;
  read_by_id?: number;
  read_by_name?: string;
  reaction_type?: string;
  action?: 'add' | 'remove';
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (data: any) => void;
  sendTyping: (conversationId: number, isTyping: boolean) => void;
  sendReadReceipt: (conversationId: number, messageId: number) => void;
  sendReaction: (messageId: number, reactionType: string, action: 'add' | 'remove') => void;
}

export const useWebSocket = (
  onMessageReceived?: (message: WebSocketMessage['message']) => void,
  onTypingIndicator?: (data: { conversationId: number; userId: number; userName: string; isTyping: boolean }) => void,
  onReadReceipt?: (data: { conversationId: number; messageId: number; readById: number; readByName: string }) => void,
  onReactionUpdate?: (data: { messageId: number; reactionType: string; action: 'add' | 'remove'; userId: number; userName: string }) => void
): UseWebSocketReturn => {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/`;
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };
      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          switch (data.type) {
            case 'message_received':
              if (data.message && onMessageReceived) onMessageReceived(data.message);
              break;
            case 'typing_indicator':
              if (onTypingIndicator && data.conversation_id && data.user_id && data.user_name !== undefined && data.is_typing !== undefined) {
                onTypingIndicator({
                  conversationId: data.conversation_id,
                  userId: data.user_id,
                  userName: data.user_name,
                  isTyping: data.is_typing
                });
              }
              break;
            case 'read_receipt':
              if (onReadReceipt && data.conversation_id && data.message_id && data.read_by_id && data.read_by_name) {
                onReadReceipt({
                  conversationId: data.conversation_id,
                  messageId: data.message_id,
                  readById: data.read_by_id,
                  readByName: data.read_by_name
                });
              }
              break;
            case 'reaction_update':
              if (onReactionUpdate && data.message_id && data.reaction_type && data.action && data.user_id && data.user_name) {
                onReactionUpdate({
                  messageId: data.message_id,
                  reactionType: data.reaction_type,
                  action: data.action,
                  userId: data.user_id,
                  userName: data.user_name
                });
              }
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };
      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };
      wsRef.current.onerror = () => {
        console.error('WebSocket connection error');
      };
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  }, [user, onMessageReceived, onTypingIndicator, onReadReceipt, onReactionUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    sendMessage({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping
    });
  }, [sendMessage]);

  const sendReadReceipt = useCallback((conversationId: number, messageId: number) => {
    sendMessage({
      type: 'read_receipt',
      conversation_id: conversationId,
      message_id: messageId
    });
  }, [sendMessage]);

  const sendReaction = useCallback((messageId: number, reactionType: string, action: 'add' | 'remove') => {
    sendMessage({
      type: 'reaction',
      message_id: messageId,
      reaction_type: reactionType,
      action: action
    });
  }, [sendMessage]);

  useEffect(() => {
    if (user) connect(); else disconnect();
    return () => { disconnect(); };
  }, [user, connect, disconnect]);

  useEffect(() => { 
    return () => { disconnect(); }; 
  }, [disconnect]);

  return {
    isConnected,
    sendMessage,
    sendTyping,
    sendReadReceipt,
    sendReaction
  };
}; 