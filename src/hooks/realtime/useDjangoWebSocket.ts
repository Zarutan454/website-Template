import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { realtimeAPI, type WebSocketMessage, type RealTimeEvent } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface UseDjangoWebSocketProps {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;
}

export type EventHandler = (event: RealTimeEvent) => void;

/**
 * Django-basierter WebSocket Hook - Migriert von Supabase Real-time
 * 
 * ALT (Supabase):
 * const channel = supabase.channel('notifications').on('postgres_changes', callback);
 * 
 * NEU (Django):
 * const { connect, subscribe, sendMessage } = useDjangoWebSocket();
 */
export const useDjangoWebSocket = ({
  autoConnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5
}: UseDjangoWebSocketProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastMessage: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, EventHandler[]>>(new Map());
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const subscribedUsersRef = useRef<Set<string>>(new Set());

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, error: 'Nicht authentifiziert' }));
      return false;
    }

    if (state.isConnected || state.isConnecting) {
      return true;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Get connection info from Django
      const response = await realtimeAPI.getConnectionInfo();
      const { ws_url, token } = response.data;

      // Create WebSocket connection
      const ws = new WebSocket(`${ws_url}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }));

        // Re-subscribe to previous rooms and users
        subscribedRoomsRef.current.forEach(room => {
          ws.send(JSON.stringify({
            type: 'join_room',
            room
          }));
        });

        subscribedUsersRef.current.forEach(userId => {
          ws.send(JSON.stringify({
            type: 'subscribe_user',
            target_user_id: userId
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          setState(prev => ({ ...prev, lastMessage: message }));

          // Handle different message types
          switch (message.type) {
            case 'notification':
              handleEvent('notification', message.data);
              break;
            case 'message':
              handleEvent('message', message.data);
              break;
            case 'post_update':
              handleEvent('post_update', message.data);
              break;
            case 'mining_update':
              handleEvent('mining_update', message.data);
              break;
            case 'like':
              handleEvent('like', message.data);
              break;
            case 'comment':
              handleEvent('comment', message.data);
              break;
            case 'follow':
              handleEvent('follow', message.data);
              break;
            case 'error':
              console.error('WebSocket error:', message.data);
              toast.error(message.data.message || 'WebSocket Fehler');
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && state.reconnectAttempts < maxReconnectAttempts) {
          const nextAttempt = state.reconnectAttempts + 1;
          setState(prev => ({ ...prev, reconnectAttempts: nextAttempt }));
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${nextAttempt}/${maxReconnectAttempts}`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'WebSocket Verbindungsfehler',
          isConnecting: false
        }));
      };

      return true;
    } catch (error: unknown) {
      console.error('Error connecting to WebSocket:', error);
      
      let errorMessage = 'Fehler beim Verbinden mit WebSocket';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string } } };
        errorMessage = apiError.response?.data?.detail || errorMessage;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isConnecting: false
      }));
      return false;
    }
  }, [isAuthenticated, user, state.isConnected, state.isConnecting, state.reconnectAttempts, maxReconnectAttempts, reconnectInterval]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    }));
  }, []);

  // Send message
  const sendMessage = useCallback((message: {
    type: string;
    data: Record<string, unknown>;
    target_user_id?: string;
    room?: string;
  }) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Fallback to HTTP API
      return realtimeAPI.sendMessage(message);
    }

    wsRef.current.send(JSON.stringify(message));
  }, []);

  // Join room
  const joinRoom = useCallback(async (room: string) => {
    if (subscribedRoomsRef.current.has(room)) {
      return true;
    }

    try {
      // Add to local set
      subscribedRoomsRef.current.add(room);

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'join_room',
          room
        }));
      } else {
        // Fallback to HTTP API
        await realtimeAPI.joinRoom(room);
      }

      return true;
    } catch (error: unknown) {
      console.error('Error joining room:', error);
      subscribedRoomsRef.current.delete(room);
      return false;
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback(async (room: string) => {
    try {
      // Remove from local set
      subscribedRoomsRef.current.delete(room);

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'leave_room',
          room
        }));
      } else {
        // Fallback to HTTP API
        await realtimeAPI.leaveRoom(room);
      }

      return true;
    } catch (error: unknown) {
      console.error('Error leaving room:', error);
      return false;
    }
  }, []);

  // Subscribe to user events
  const subscribeToUser = useCallback(async (targetUserId: string) => {
    if (subscribedUsersRef.current.has(targetUserId)) {
      return true;
    }

    try {
      // Add to local set
      subscribedUsersRef.current.add(targetUserId);

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'subscribe_user',
          target_user_id: targetUserId
        }));
      } else {
        // Fallback to HTTP API
        await realtimeAPI.subscribeToUser(targetUserId);
      }

      return true;
    } catch (error: unknown) {
      console.error('Error subscribing to user:', error);
      subscribedUsersRef.current.delete(targetUserId);
      return false;
    }
  }, []);

  // Unsubscribe from user events
  const unsubscribeFromUser = useCallback(async (targetUserId: string) => {
    try {
      // Remove from local set
      subscribedUsersRef.current.delete(targetUserId);

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'unsubscribe_user',
          target_user_id: targetUserId
        }));
      } else {
        // Fallback to HTTP API
        await realtimeAPI.unsubscribeFromUser(targetUserId);
      }

      return true;
    } catch (error: unknown) {
      console.error('Error unsubscribing from user:', error);
      return false;
    }
  }, []);

  // Subscribe to events
  const subscribe = useCallback((eventType: string, handler: EventHandler) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, []);
    }
    eventHandlersRef.current.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }, []);

  // Handle events
  const handleEvent = useCallback((eventType: string, data: unknown) => {
    const handlers = eventHandlersRef.current.get(eventType);
    if (handlers) {
      const event: RealTimeEvent = {
        event_type: eventType as RealTimeEvent['event_type'],
        data,
        timestamp: new Date().toISOString(),
        user_id: user?.id
      };

      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }, [user]);

  // Get subscription status
  const getSubscriptionStatus = useCallback(async () => {
    try {
      const response = await realtimeAPI.getSubscriptionStatus();
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, connect, disconnect]);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,
    lastMessage: state.lastMessage,

    // Actions
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    subscribeToUser,
    unsubscribeFromUser,
    subscribe,
    getSubscriptionStatus,

    // Utility
    subscribedRooms: Array.from(subscribedRoomsRef.current),
    subscribedUsers: Array.from(subscribedUsersRef.current)
  };
}; 
