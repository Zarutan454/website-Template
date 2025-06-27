
import { useState, useCallback } from 'react';
import { MiningActivity, ActivityResult } from '../types';
import { supabase } from '@/lib/supabase';

/**
 * Hook für das Debugging von Mining-Aktivitäten
 * Ermöglicht das Protokollieren und Überwachen von Mining-Aktivitäten
 */
export const useActivityDebugger = (userId: string | undefined) => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  
  // Aktivität protokollieren
  const logActivity = useCallback((action: string, details: unknown) => {
    if (!isDebugMode) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action}: ${JSON.stringify(details)}`;
    
    setDebugLogs(prevLogs => [logEntry, ...prevLogs].slice(0, 100)); // Max 100 Einträge
  }, [isDebugMode]);
  
  // Datenbankfehler protokollieren
  const logDbError = useCallback((operation: string, error: any) => {
    if (!isDebugMode) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] DB ERROR in ${operation}: ${error.message || JSON.stringify(error)}`;
    
    setDebugLogs(prevLogs => [logEntry, ...prevLogs].slice(0, 100));
    console.error(`[ActivityDebug] ${logEntry}`);
  }, [isDebugMode]);
  
  // Aktivitäten direkt aus der Datenbank abrufen (umgeht Transformationen)
  const getRawActivityData = useCallback(async (limit = 10) => {
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('mining_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        logDbError('getRawActivityData', error);
        return [];
      }
      
      return data;
    } catch (err) {
      logDbError('getRawActivityData', err);
      return [];
    }
  }, [userId, logDbError]);
  
  // Aktivitätsverarbeitung überwachen
  const monitorActivityResult = useCallback((result: MiningActivity | ActivityResult | null, activityType: string) => {
    if (!isDebugMode || !result) return;
    
    logActivity('ActivityProcessed', { 
      type: activityType, 
      success: !!result,
      result 
    });
    
    return result;
  }, [isDebugMode, logActivity]);
  
  return {
    debugLogs,
    isDebugMode,
    setIsDebugMode,
    logActivity,
    logDbError,
    getRawActivityData,
    monitorActivityResult
  };
};
