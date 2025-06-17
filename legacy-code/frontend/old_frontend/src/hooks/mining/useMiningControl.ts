
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MiningHealthStatus {
  active: boolean;
  healthy: boolean;
  lastHeartbeat?: string | null;
}

export const useMiningControls = (userId?: string) => {
  const [isMining, setIsMining] = useState(false);
  const [isMiningHealthy, setIsMiningHealthy] = useState(true);
  const [miningRate, setMiningRate] = useState(0.1); // Tokens pro Stunde

  // Mining-Heartbeat-Funktion
  const sendHeartbeat = useCallback(async (): Promise<boolean> => {
    if (!userId || !isMining) return false;

    try {
      const { data, error } = await supabase
        .from('mining_stats')
        .update({
          last_heartbeat: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_mining', true)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Senden des Heartbeats:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Senden des Heartbeats:', error);
      return false;
    }
  }, [userId, isMining]);

  // Prüfe den Gesundheitszustand des Minings
  const checkMiningHealth = useCallback(async (): Promise<MiningHealthStatus> => {
    if (!userId) return { active: false, healthy: false };

    try {
      const { data, error } = await supabase
        .from('mining_stats')
        .select('is_mining, last_heartbeat')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Fehler beim Prüfen des Mining-Status:', error);
        return { active: false, healthy: false };
      }

      const isActive = !!data?.is_mining;
      let isHealthy = true;
      
      if (isActive && data?.last_heartbeat) {
        const lastHeartbeat = new Date(data.last_heartbeat);
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
        
        // Wenn der letzte Heartbeat mehr als 5 Minuten zurückliegt, ist das Mining nicht mehr gesund
        isHealthy = diffInMinutes < 5;
      }

      return { 
        active: isActive, 
        healthy: isHealthy,
        lastHeartbeat: data?.last_heartbeat
      };
    } catch (error) {
      console.error('Unerwarteter Fehler beim Prüfen des Mining-Status:', error);
      return { active: false, healthy: false };
    }
  }, [userId]);

  // Mining starten
  const startMining = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Mining starten
      
      // Aktualisiere die Statistiken
      const { data, error } = await supabase
        .from('mining_stats')
        .update({
          is_mining: true,
          last_heartbeat: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Fehler beim Starten des Minings:', error);
        return false;
      }

      // Erstelle einen neuen Mining-Session-Eintrag
      const { error: sessionError } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: userId,
          start_time: new Date().toISOString(),
          status: 'active'
        });

      if (sessionError) {
        console.error('Fehler beim Erstellen der Mining-Session:', sessionError);
        // Trotzdem fortfahren, da das ein nicht-kritischer Fehler ist
      }

      setIsMining(true);
      setIsMiningHealthy(true);
      
      // Hole die Mining-Rate aus den Daten
      if (data && data.length > 0) {
        setMiningRate(data[0].mining_rate || 0.1);
      }

      return true;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Starten des Minings:', error);
      return false;
    }
  }, [userId]);

  // Mining stoppen
  const stopMining = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      console.log('Mining stoppen für Benutzer:', userId);
      
      // Aktualisiere die Statistiken
      const { error } = await supabase
        .from('mining_stats')
        .update({
          is_mining: false,
          last_activity_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Fehler beim Stoppen des Minings:', error);
        return false;
      }

      // Aktualisiere die aktive Mining-Session
      const { data: sessions, error: sessionsError } = await supabase
        .from('mining_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1);

      if (sessionsError) {
        console.error('Fehler beim Suchen der aktiven Mining-Session:', sessionsError);
        // Trotzdem fortfahren
      } else if (sessions && sessions.length > 0) {
        const { error: updateError } = await supabase
          .from('mining_sessions')
          .update({
            end_time: new Date().toISOString(),
            status: 'completed'
          })
          .eq('id', sessions[0].id);

        if (updateError) {
          console.error('Fehler beim Aktualisieren der Mining-Session:', updateError);
          // Trotzdem fortfahren
        }
      }

      setIsMining(false);
      return true;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Stoppen des Minings:', error);
      return false;
    }
  }, [userId]);

  // Initialisiere den Mining-Status beim Laden
  useEffect(() => {
    if (!userId) return;

    const initializeMiningState = async () => {
      const healthStatus = await checkMiningHealth();
      setIsMining(healthStatus.active);
      setIsMiningHealthy(healthStatus.healthy);

      // Wenn mining aktiv ist, aber nicht gesund, setze es zurück
      if (healthStatus.active && !healthStatus.healthy) {
        console.warn('Ungesundes Mining erkannt, wird zurückgesetzt...');
        await stopMining();
      }
    };

    initializeMiningState();
  }, [userId, checkMiningHealth, stopMining]);

  // Starte einen Heartbeat-Intervall
  useEffect(() => {
    if (!userId || !isMining) return;

    const heartbeatInterval = setInterval(() => {
      sendHeartbeat().then(success => {
        if (!success) {
          console.warn('Heartbeat fehlgeschlagen');
          setIsMiningHealthy(false);
        } else {
          setIsMiningHealthy(true);
        }
      });
    }, 60000); // 1 Minute

    return () => clearInterval(heartbeatInterval);
  }, [userId, isMining, sendHeartbeat]);

  return {
    isMining,
    setIsMining,
    isMiningHealthy,
    miningRate,
    startMining,
    stopMining,
    checkMiningHealth,
    sendHeartbeat
  };
};
