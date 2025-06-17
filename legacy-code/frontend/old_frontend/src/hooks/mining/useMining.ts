import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { 
  MiningStats, 
  MiningActivity, 
  ActivityType, 
  MINING_LIMITS, 
  ActivityLimit,
  ActivityResult,
  isActivityResult,
  isActivityLimit,
  formatDateForDatabase
} from './types';
import { miningRepository } from '@/repositories/MiningRepository';
import { sendMiningHeartbeat, checkInactivity } from './services/heartbeat';
import { HEARTBEAT_INTERVAL, INACTIVITY_TIMEOUT } from './constants';

export const useMining = () => {
  const { profile } = useProfile();
  const [miningStats, setMiningStats] = useState<MiningStats>({
    user_id: profile?.id || '', // Initialize with profile id or empty string
    total_points: 0,
    total_tokens_earned: 0,
    daily_points: 0,
    daily_tokens_earned: 0,
    last_activity_at: new Date().toISOString(), // Use toISOString() to convert Date to string
    is_mining: false,
    mining_rate: 0.3, // Updated to 0.3 tokens/hour
    efficiency_multiplier: 1.0,
    achievement_bonus: 0,
    streak_days: 0,
    current_speed_boost: 0, // Initialize speed boost at 0%
    max_speed_boost: 95, // Maximum speed boost is 95%
    effective_mining_rate: 0.3, // Initial effective rate equals base rate
    last_inactive_check: new Date().toISOString() // Initialize inactive check timestamp
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMiningHealthy, setIsMiningHealthy] = useState(true);
  const [recentActivities, setRecentActivities] = useState<MiningActivity[]>([]);
  const [dailyLimits, setDailyLimits] = useState<Record<string, boolean>>({});
  const [pendingActivities, setPendingActivities] = useState<number>(0);
  
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isActivityLimitReached = useCallback((type: ActivityType): boolean => {
    if (!miningStats) return false;
    
    const limit = MINING_LIMITS[type];
    if (!limit) return false;
    
    if (isActivityLimit(limit)) {
      switch (type) {
        case 'post':
          return (miningStats.daily_posts_count || 0) >= limit.count;
        case 'comment':
          return (miningStats.daily_comments_count || 0) >= limit.count;
        case 'like':
          return (miningStats.daily_likes_count || 0) >= limit.count;
        case 'share':
          return (miningStats.daily_shares_count || 0) >= limit.count;
        case 'invite':
          return (miningStats.daily_invites_count || 0) >= limit.count;
        default:
          return false;
      }
    }
    
    return false;
  }, [miningStats]);
  
  const getRemainingCount = useCallback((type: ActivityType): number => {
    if (!miningStats) return 0;
    
    const limit = MINING_LIMITS[type];
    if (!limit || !isActivityLimit(limit)) return 0;
    
    let current = 0;
    switch (type) {
      case 'post':
        current = miningStats.daily_posts_count || 0;
        break;
      case 'comment':
        current = miningStats.daily_comments_count || 0;
        break;
      case 'like':
        current = miningStats.daily_likes_count || 0;
        break;
      case 'share':
        current = miningStats.daily_shares_count || 0;
        break;
      case 'invite':
        current = miningStats.daily_invites_count || 0;
        break;
    }
    
    return Math.max(0, limit.count - current);
  }, [miningStats]);

  const startMining = useCallback(async () => {
    if (!profile?.id) {
      toast.error('Du musst angemeldet sein, um Mining zu starten');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Call repository to start mining
      const success = await miningRepository.startMining(profile.id);
      
      if (success) {
        // Update local state
        setMiningStats(prevStats => ({
          ...prevStats,
          user_id: profile.id, // Ensure user_id is set
          is_mining: true,
          last_activity_at: new Date().toISOString() // Convert Date to string
        }));
        
        // Poll status to confirm changes applied
        await syncMiningState();
        
        toast.success('Mining gestartet!');
        return true;
      } else {
        toast.error('Fehler beim Starten des Minings');
        return false;
      }
    } catch (error) {
      toast.error('Fehler beim Starten des Minings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const stopMining = useCallback(async () => {
    if (!profile?.id) {
      toast.error('Du musst angemeldet sein, um Mining zu stoppen');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Call repository to stop mining
      const success = await miningRepository.stopMining(profile.id);
      
      if (success) {
        // Update local state
        setMiningStats(prevStats => ({
          ...prevStats,
          is_mining: false
        }));
        
        // Poll status to confirm changes applied
        await syncMiningState();
        
        toast.success('Mining gestoppt!');
        return true;
      } else {
        toast.error('Fehler beim Stoppen des Minings');
        return false;
      }
    } catch (error) {
      console.error('Error stopping mining:', error);
      toast.error('Fehler beim Stoppen des Minings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const recordActivity = useCallback(async (type: ActivityType) => {
    if (!profile?.id) {
      toast.error('Du musst angemeldet sein, um Mining-Aktivitäten aufzuzeichnen');
      return false;
    }
    
    if (!miningStats.is_mining) {
      toast.error('Mining muss aktiv sein, um Geschwindigkeitsboosts zu erhalten');
      return false;
    }
    
    try {
      // Check if activity type has reached its daily limit
      if (isActivityLimitReached(type)) {
        // No error toast for limits, just return false
        return {
          success: true,
          rewarded: false,
          debounced: false,
          message: 'Tägliches Limit erreicht'
        };
      }
      
      const limit = MINING_LIMITS[type];
      if (!limit || !isActivityLimit(limit)) {
        return {
          success: false,
          rewarded: false,
          message: 'Ungültiger Aktivitätstyp'
        };
      }
      
      const speedBoost = limit.speedBoost;
      
      const currentBoost = miningStats.current_speed_boost || 0;
      const maxBoost = miningStats.max_speed_boost || 95;
      const newBoost = Math.min(currentBoost + speedBoost, maxBoost);
      
      const activity = await miningRepository.recordActivity(
        profile.id, 
        type, 
        speedBoost, // Store speed boost in points parameter
        0 // No direct tokens
      );
      
      if (activity) {
        // Add efficiency_at_time if missing
        const completeActivity: MiningActivity = {
          ...activity,
          efficiency_at_time: activity.efficiency_at_time || miningStats.efficiency_multiplier || 1.0,
          mining_rate_at_time: activity.mining_rate_at_time || miningStats.mining_rate || 0.3
        };
        
        // Update local state with new activity
        setRecentActivities(prev => [completeActivity, ...prev].slice(0, 20));
        
        const boostMultiplier = 1 + (newBoost / 100);
        const newEffectiveRate = parseFloat((miningStats.mining_rate * boostMultiplier).toFixed(4));
        
        setMiningStats(prev => ({
          ...prev,
          current_speed_boost: newBoost,
          effective_mining_rate: newEffectiveRate,
          last_activity_at: new Date().toISOString() // Convert Date to string
        }));
        
        // Update daily activity counts
        updateActivityCounts(type);
        
        // Sync state to ensure everything is updated
        setTimeout(() => {
          syncMiningState();
        }, 500);
        
        return {
          success: true,
          rewarded: true,
          debounced: false,
          speedBoost: speedBoost,
          newSpeedBoost: newBoost,
          points: 0, // No direct points
          tokens: 0, // No direct tokens
          newActivity: completeActivity
        };
      }
      
      return false;
    } catch (error) {
      console.error(`Error recording ${type} activity:`, error);
      toast.error('Fehler beim Aufzeichnen der Aktivität');
      return false;
    }
  }, [profile, miningStats, isActivityLimitReached]);

  const updateActivityCounts = useCallback((type: ActivityType) => {
    setMiningStats(prev => {
      const newStats = { ...prev };
      
      // Update the appropriate counter based on activity type
      switch (type) {
        case 'post':
          newStats.daily_posts_count = (prev.daily_posts_count || 0) + 1;
          break;
        case 'comment':
          newStats.daily_comments_count = (prev.daily_comments_count || 0) + 1;
          break;
        case 'like':
          newStats.daily_likes_count = (prev.daily_likes_count || 0) + 1;
          break;
        case 'share':
          newStats.daily_shares_count = (prev.daily_shares_count || 0) + 1;
          break;
        case 'invite':
          newStats.daily_invites_count = (prev.daily_invites_count || 0) + 1;
          break;
      }
      
      return newStats;
    });
  }, []);

  const syncMiningState = useCallback(async (): Promise<boolean> => {
    if (!profile?.id) return false;
    
    try {
      // Check mining status via repository
      const stats = await miningRepository.getMiningStats(profile.id);
      const activities = await miningRepository.getMiningActivities(profile.id, 20);
      
      if (stats) {
        setMiningStats(stats);
        setIsMiningHealthy(true);
      }
      
      if (activities) {
        setRecentActivities(activities);
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error syncing mining state:', error);
      setIsMiningHealthy(false);
      setIsLoading(false);
      return false;
    }
  }, [profile]);
  
  const setupHeartbeat = useCallback(() => {
    if (!profile?.id || !miningStats.is_mining) return;
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (profile?.id) {
        await sendMiningHeartbeat(profile.id);
      }
    }, HEARTBEAT_INTERVAL);
    
    if (inactivityCheckIntervalRef.current) {
      clearInterval(inactivityCheckIntervalRef.current);
    }
    
    inactivityCheckIntervalRef.current = setInterval(async () => {
      if (profile?.id && miningStats.is_mining) {
        await checkInactivity(profile.id, miningStats.last_activity_at);
        await syncMiningState();
      }
    }, HEARTBEAT_INTERVAL * 2); // Check inactivity less frequently than heartbeat
    
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
    };
  }, [profile, miningStats.is_mining, miningStats.last_activity_at]);
  
  useEffect(() => {
    if (profile?.id && !isLoading) {
      syncMiningState().then(success => {
        if (success && !miningStats.is_mining) {
          startMining().then(started => {
            if (started) {
              console.log('Mining automatically started for user:', profile.id);
            }
          });
        } else if (success && miningStats.is_mining) {
          setupHeartbeat();
        }
      });
    }
    
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
    };
  }, [profile, isLoading]);
  
  useEffect(() => {
    if (miningStats.is_mining) {
      setupHeartbeat();
    } else {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
        inactivityCheckIntervalRef.current = null;
      }
    }
  }, [miningStats.is_mining, setupHeartbeat]);

  return {
    miningStats,
    recentActivities,
    isLoading,
    isMining: miningStats.is_mining,
    isMiningHealthy,
    miningRate: miningStats.mining_rate,
    currentSpeedBoost: miningStats.current_speed_boost,
    effectiveMiningRate: miningStats.effective_mining_rate,
    pendingActivities,
    startMining,
    stopMining,
    recordActivity,
    syncMiningState,
    isActivityLimitReached,
    getRemainingCount
  };
};

export type { MiningStats, MiningActivity, ActivityLimit, ActivityResult, ActivityType };
export { MINING_LIMITS, isActivityResult };
