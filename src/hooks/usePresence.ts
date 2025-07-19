import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePresence() {
  const { getAccessToken, isAuthenticated, user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  // Nur auf userId und isAuthenticated achten, nicht auf das ganze user-Objekt
  const userId = user?.id;

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
        console.log('[Presence] 💓 Heartbeat gesendet');
      } catch (error) {
        console.error('[Presence] ❌ Fehler beim Senden des Heartbeats:', error);
      }
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearTimeout(heartbeatRef.current);
    }
    heartbeatRef.current = setTimeout(() => {
      sendHeartbeat();
      startHeartbeat(); // Rekursive Wiederholung
    }, 30000); // 30 Sekunden
  }, [sendHeartbeat]);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (heartbeatRef.current) {
      clearTimeout(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    reconnectAttempts.current = 0;
    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    // Prüfe ob User authentifiziert ist und eine userId hat
    if (!isAuthenticated || !userId) {
      console.log('[Presence] User not authenticated, skipping connection');
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      setLastError('Kein Token für Presence-WS');
      console.warn('[Presence] Kein Token verfügbar');
      return;
    }
    console.log('[Presence] User authenticated, attempting connection');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    const wsUrl = `${protocol}//${hostname}:8000/ws/presence/?token=${token}`;
    console.log('[Presence] Verbinde zu:', wsUrl);
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setLastError(null);
        reconnectAttempts.current = 0; // Reset reconnect attempts
        console.log('[Presence] ✅ Verbunden');
        startHeartbeat();
      };
      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log('[Presence] ❌ Verbindung geschlossen, code:', event.code, 'reason:', event.reason);
        if (heartbeatRef.current) {
          clearTimeout(heartbeatRef.current);
          heartbeatRef.current = null;
        }
        // Reconnect nur wenn User noch authentifiziert ist und nicht zu viele Versuche
        if (isAuthenticated && userId && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff
          console.log(`[Presence] 🔄 Reconnect Versuch ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);
          reconnectRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('[Presence] ❌ Maximale Reconnect-Versuche erreicht');
          setLastError('Verbindung verloren - maximale Reconnect-Versuche erreicht');
        }
      };
      wsRef.current.onerror = (e) => {
        setLastError('Presence-WS Fehler');
        console.error('[Presence] ❌ WebSocket Fehler:', e);
        console.error('[Presence] WebSocket readyState:', wsRef.current?.readyState);
      };
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Presence] 📨 Nachricht erhalten:', data);
          if (data.type === 'heartbeat_ack') {
            console.log('[Presence] 💓 Heartbeat bestätigt');
          }
        } catch (error) {
          console.log('[Presence] 📨 Raw Nachricht erhalten:', event.data);
        }
      };
    } catch (error) {
      console.error('[Presence] ❌ Fehler beim Erstellen der WebSocket-Verbindung:', error);
      setLastError('Fehler beim Erstellen der WebSocket-Verbindung');
    }
  }, [getAccessToken, isAuthenticated, userId, startHeartbeat]);

  // Nur auf userId und isAuthenticated achten, nicht auf das ganze user-Objekt
  useEffect(() => {
    if (isAuthenticated && userId) {
      connect();
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isAuthenticated, userId, connect, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return { isConnected, lastError, disconnect };
} 