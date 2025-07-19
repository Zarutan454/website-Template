import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WS_CONFIG } from '../config/env';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: 'message_received' | 'typing_indicator' | 'read_receipt' | 'reaction_update' | 'connection_established' | 'error' | 'pong' | 'new_post' | 'post_liked' | 'post_commented' | 'user_followed' | 'story_created' | 'feed_preferences_updated' | 'feed_subscribed' | 'feed_preferences';
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
  error?: string;
  post?: unknown;
  post_id?: number;
  username?: string;
  comment?: unknown;
  follower_username?: string;
  followed_username?: string;
  story?: unknown;
  preferences?: unknown;
  feed_type?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  sendMessage: (data: unknown) => boolean;
  sendTyping: (conversationId: number, isTyping: boolean) => void;
  sendReadReceipt: (conversationId: number, messageId: number) => void;
  sendReaction: (messageId: number, reactionType: string, action: 'add' | 'remove') => void;
  connect: () => void;
  disconnect: () => void;
  forceReconnect: () => void;
}

export const useWebSocket = (
  onMessageReceived?: (message: WebSocketMessage['message']) => void,
  onTypingIndicator?: (data: { conversationId: number; userId: number; userName: string; isTyping: boolean }) => void,
  onReadReceipt?: (data: { conversationId: number; messageId: number; readById: number; readByName: string }) => void,
  onReactionUpdate?: (data: { messageId: number; reactionType: string; action: 'add' | 'remove'; userId: number; userName: string }) => void
): UseWebSocketReturn => {
  const { user, getAccessToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3; // Reduced from 10 to prevent spam

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Start heartbeat with longer interval
  const startHeartbeat = useCallback(() => {
    heartbeatTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
        startHeartbeat(); // Restart heartbeat
      }
    }, 60000); // 60 seconds instead of 30
  }, []);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!user) {
      setLastError('Nicht authentifiziert');
      return;
    }

    if (isConnected || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setLastError(null);

    try {
      // Get access token for authentication
      const token = await getAccessToken();
      if (!token) {
        setLastError('Kein gültiger Token verfügbar');
        setIsConnecting(false);
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000${WS_CONFIG.ENDPOINTS.CHAT}?token=${token}`;
      
      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        setLastError(null);
        startHeartbeat();
        console.log('✅ WebSocket verbunden');
        // Entfernt: Senden von 'connection_established' nach Verbindungsaufbau
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Handle heartbeat response
          if (data.type === 'pong') {
            return;
          }

          switch (data.type) {
            case 'connection_established':
              console.log('✅ WebSocket-Verbindung hergestellt');
              break;
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
            case 'error': {
              let errorMsg: string = 'Unbekannter WebSocket Fehler';
              if (typeof data.error === 'string') {
                errorMsg = data.error;
              } else if (typeof data.message === 'string') {
                errorMsg = data.message;
              }
              console.error('WebSocket Fehler:', errorMsg);
              setLastError(errorMsg);
              break;
            }
            default:
              console.log('Unbekannter WebSocket Nachrichtentyp:', data.type);
          }
        } catch (error) {
          console.error('WebSocket Nachrichten-Parse-Fehler:', error);
          setLastError('Ungültiges Nachrichtenformat');
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();
        
        console.log('🔌 WebSocket getrennt:', event.code, event.reason);

        // Gentle auto-reconnect with limited attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const backoffDelay = Math.min(5000 * reconnectAttemptsRef.current, 15000); // Max 15 seconds
          
          console.log(`🔄 Versuche Wiederverbindung (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${backoffDelay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn('⚠️ Maximale Wiederverbindungsversuche erreicht. WebSocket deaktiviert.');
          setLastError('Verbindung nach mehreren Versuchen fehlgeschlagen');
        }
      };

      wsRef.current.onerror = (error) => {
        setIsConnecting(false);
        setLastError('WebSocket Verbindungsfehler');
        console.error('❌ WebSocket Fehler:', error);
      };
    } catch (error) {
      setIsConnecting(false);
      setLastError('Fehler beim Erstellen der WebSocket-Verbindung');
      console.error('❌ Fehler beim Erstellen der WebSocket-Verbindung:', error);
    }
  }, [user, isConnected, isConnecting, getAccessToken, onMessageReceived, onTypingIndicator, onReadReceipt, onReactionUpdate, startHeartbeat, stopHeartbeat, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manuelle Trennung');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
    setLastError(null);
  }, [clearTimeouts]);

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('❌ Fehler beim Senden der WebSocket-Nachricht:', error);
        setLastError('Fehler beim Senden der Nachricht');
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket ist nicht verbunden');
      setLastError('WebSocket nicht verbunden');
      return false;
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

  const forceReconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Auto-connect with delay to prevent immediate connection attempts
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        connect();
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    lastError,
    sendMessage,
    sendTyping,
    sendReadReceipt,
    sendReaction,
    connect,
    disconnect,
    forceReconnect
  };
};

// Feed-specific WebSocket hook with improved error handling
export const useFeedWebSocket = (feedType: string = 'following') => {
  const { user, getAccessToken } = useAuth();
  const [newPosts, setNewPosts] = useState<unknown[]>([]);
  const [postUpdates, setPostUpdates] = useState<unknown[]>([]);
  const [storyUpdates, setStoryUpdates] = useState<unknown[]>([]);
  const [feedPreferences, setFeedPreferences] = useState<Record<string, unknown>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3; // Reduced attempts

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Start heartbeat with longer interval
  const startHeartbeat = useCallback(() => {
    heartbeatTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
        startHeartbeat(); // Restart heartbeat
      }
    }, 60000); // 60 seconds
  }, []);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_post':
        setNewPosts(prev => [message.post, ...prev]);
        toast.success(`📝 Neuer Beitrag von ${(message.post as { author?: { username?: string } })?.author?.username || 'Unbekannt'}`);
        break;
        
      case 'post_liked':
        setPostUpdates(prev => [...prev, {
          type: 'like',
          post_id: message.post_id,
          user_id: message.user_id,
          username: message.username
        }]);
        break;
        
      case 'post_commented':
        setPostUpdates(prev => [...prev, {
          type: 'comment',
          post_id: message.post_id,
          comment: message.comment
        }]);
        toast.success(`💬 Neuer Kommentar von ${(message.comment as { author?: { username?: string } })?.author?.username || 'Unbekannt'}`);
        break;
        
      case 'user_followed':
        toast.success(`👥 ${message.follower_username} folgt jetzt ${message.followed_username}`);
        break;
        
      case 'story_created':
        setStoryUpdates(prev => [message.story, ...prev]);
        toast.success(`📸 Neue Story von ${(message.story as { author?: { username?: string } })?.author?.username || 'Unbekannt'}`);
        break;
        
      case 'feed_preferences_updated':
        setFeedPreferences(message.preferences as Record<string, unknown>);
        break;
        
      case 'connection_established':
        console.log('✅ Feed WebSocket connected');
        break;
        
      case 'feed_subscribed':
        console.log('✅ Subscribed to feed:', message.feed_type);
        break;
        
      case 'error':
        console.error('❌ Feed WebSocket error:', message.error);
        setLastError(`Feed Fehler: ${message.error}`);
        break;
        
      default:
        console.log('ℹ️ Unknown WebSocket message type:', message.type);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!user) {
      setLastError('Nicht authentifiziert');
      return;
    }

    if (isConnected || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setLastError(null);

    try {
      // Get access token for authentication
      const token = await getAccessToken();
      if (!token) {
        setLastError('Kein gültiger Token verfügbar');
        setIsConnecting(false);
        return;
      }

      const wsUrl = `${WS_CONFIG.BASE_URL}${WS_CONFIG.ENDPOINTS.FEED}?token=${token}`;
      console.log('🔌 Attempting Feed WebSocket connection to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        setLastError(null);
        startHeartbeat();
        console.log('✅ Feed WebSocket verbunden');
        
        // Subscribe to feed updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe_feed',
          feed_type: feedType
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle heartbeat response
          if (message.type === 'pong') {
            return;
          }
          
          handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          setLastError('Invalid message format');
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();
        
        console.log('🔌 Feed WebSocket disconnected:', event.code, event.reason);

        // Gentle auto-reconnect with limited attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const backoffDelay = Math.min(5000 * reconnectAttemptsRef.current, 15000);
          
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${backoffDelay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn('⚠️ Max reconnection attempts reached. Disabling WebSocket.');
          setLastError('Connection failed after multiple attempts');
        }
      };

      wsRef.current.onerror = (error) => {
        setIsConnecting(false);
        setLastError('WebSocket connection error');
        console.error('❌ Feed WebSocket error:', error);
      };

    } catch (error) {
      setIsConnecting(false);
      setLastError('Failed to create WebSocket connection');
      console.error('❌ Error creating Feed WebSocket connection:', error);
    }
  }, [user, isConnected, isConnecting, getAccessToken, feedType, handleMessage, startHeartbeat, stopHeartbeat, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
    setLastError(null);
  }, [clearTimeouts]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
        setLastError('Failed to send message');
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket is not connected');
      setLastError('WebSocket not connected');
      return false;
    }
  }, []);

  const updateFeedPreferences = useCallback((preferences: Record<string, unknown>) => {
    sendMessage({
      type: 'feed_preferences',
      preferences
    });
  }, [sendMessage]);

  const clearNewPosts = useCallback(() => {
    setNewPosts([]);
  }, []);

  const clearPostUpdates = useCallback(() => {
    setPostUpdates([]);
  }, []);

  const clearStoryUpdates = useCallback(() => {
    setStoryUpdates([]);
  }, []);

  const forceReconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Auto-connect with delay to prevent immediate connection attempts
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        connect();
      }, 2000); // 2 second delay for feed
      
      return () => clearTimeout(timer);
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  return {
    isConnected,
    lastError,
    newPosts,
    postUpdates,
    storyUpdates,
    feedPreferences,
    updateFeedPreferences,
    clearNewPosts,
    clearPostUpdates,
    clearStoryUpdates,
    forceReconnect
  };
}; 