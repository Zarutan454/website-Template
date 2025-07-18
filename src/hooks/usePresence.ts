import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePresence() {
  const { getAccessToken, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
    }
    heartbeatRef.current = setTimeout(sendHeartbeat, 30000);
  }, []);

  const connect = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = await getAccessToken();
    if (!token) {
      setLastError('Kein Token für Presence-WS');
      console.warn('[Presence] Kein Token verfügbar');
      return;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/presence/?token=${token}`;
    console.log('[Presence] Verbinde zu:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onopen = () => {
      setIsConnected(true);
      setLastError(null);
      console.log('[Presence] ✅ Verbunden');
      sendHeartbeat();
    };
    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('[Presence] ❌ Verbindung geschlossen');
      if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
      // Reconnect nach 5s
      reconnectRef.current = setTimeout(connect, 5000);
    };
    wsRef.current.onerror = (e) => {
      setLastError('Presence-WS Fehler');
      console.error('[Presence] ❌ WebSocket Fehler:', e);
      wsRef.current?.close();
    };
    wsRef.current.onmessage = (event) => {
      console.log('[Presence] 📨 Nachricht erhalten:', event.data);
      // Optional: handle heartbeat_ack
    };
  }, [getAccessToken, isAuthenticated, sendHeartbeat]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
  }, []);

  return { isConnected, lastError, disconnect };
} 