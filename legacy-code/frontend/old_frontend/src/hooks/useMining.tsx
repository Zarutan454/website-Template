
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useProfile } from './useProfile';
import { supabase } from '@/lib/supabase';
import { useMiningStats } from './mining/useMiningStats';
import { useMiningActivities } from './mining/useMiningActivities';
import { useMiningControls } from './mining/useMiningControls';
import { useMiningEffects } from './mining/useMiningEffects';
import { 
  MiningStats, 
  MiningActivity, 
  MINING_LIMITS,
  ActivityType,
  ActivityResult,
  isActivityResult,
  normalizeMiningStats
} from './mining/types';
import { miningRepository } from '@/repositories/MiningRepository';

export const useMining = () => {
  const { profile } = useProfile();
  const { miningStats, setMiningStats, fetchMiningStats } = useMiningStats();
  const { miningActivities, setMiningActivities, fetchMiningActivities } = useMiningActivities();
  const { isLoading, setIsLoading, isMining, setIsMining, miningRate, setMiningRate, isMiningHealthy } = useMiningControls();
  
  // Use miningEffects to handle continuous mining updates
  useMiningEffects(isMining, miningRate, setMiningStats);

  // Queue for batching activities
  const [activityQueue, setActivityQueue] = useState<Array<{type: ActivityType, points: number, tokens: number}>>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Sync with server on mount and when mining state changes
  useEffect(() => {
    if (profile?.id) {
      syncMiningState();
    }
  }, [profile?.id]);

  // Periodically sync with server to ensure consistency
  useEffect(() => {
    if (!profile?.id) return;
    
    const syncInterval = setInterval(() => {
      syncMiningState().then(success => {
        console.log('Periodic mining sync completed, status:', success);
      });
    }, 30000); // Sync every 30 seconds
    
    return () => clearInterval(syncInterval);
  }, [profile?.id]);

  // Process activity queue
  useEffect(() => {
    const processQueue = async () => {
      if (activityQueue.length === 0 || isProcessingQueue || !profile?.id || !isMining) return;
      
      try {
        setIsProcessingQueue(true);
        
        // Only process if we have multiple items or the oldest item is more than 2 seconds old
        const oldestItem = activityQueue[0];
        const now = Date.now();
        const oldestTimestamp = (oldestItem as any).timestamp || 0;
        
        if (activityQueue.length >= 5 || (now - oldestTimestamp > 2000)) {
          console.log(`Processing batch of ${activityQueue.length} activities`);
          
          // Clone the queue for processing and clear the state queue
          const queueToProcess = [...activityQueue];
          setActivityQueue([]);
          
          // Strip timestamp from activities
          const activitiesToProcess = queueToProcess.map(({ type, points, tokens }) => ({ type, points, tokens }));
          
          // Use batch processing
          const result = await miningRepository.batchRecordActivities(
            profile.id,
            activitiesToProcess
          );
          
          if (result?.success) {
            console.log(`Successfully processed ${result.count} activities`);
            
            // Update mining stats based on the processed activities
            fetchMiningStats(profile.id);
            fetchMiningActivities(profile.id);
            
            // Show single toast for batch instead of multiple toasts
            const totalTokens = activitiesToProcess.reduce((sum, act) => sum + act.tokens, 0);
            if (totalTokens > 0) {
              toast.success(`+${totalTokens.toFixed(2)} BSN für Aktivitäten`);
            }
          } else {
            console.error('Failed to process activity batch:', result?.error);
          }
        }
      } catch (error) {
        console.error('Error processing activity queue:', error);
      } finally {
        setIsProcessingQueue(false);
      }
    };
    
    processQueue();
    
    // Set up interval to process the queue regularly
    const interval = setInterval(processQueue, 2000);
    return () => clearInterval(interval);
  }, [activityQueue, isProcessingQueue, profile?.id, isMining, fetchMiningStats, fetchMiningActivities]);

  // Sync mining state with server
  const syncMiningState = useCallback(async () => {
    if (!profile?.id) {
      console.log('Cannot sync mining state: No user ID available');
      return false;
    }
    
    try {
      console.log('Syncing mining state with backend');
      
      // Check actual mining status in database
      const serverMiningStatus = await miningRepository.checkMiningStatus(profile.id);
      
      // If there's a mismatch, update local state to match server
      if (serverMiningStatus !== undefined && serverMiningStatus !== isMining) {
        console.log(`Mining state mismatch: local=${isMining}, server=${serverMiningStatus}. Updating local state.`);
        setIsMining(serverMiningStatus);
        
        // Send heartbeat if mining is active
        if (serverMiningStatus) {
          await miningRepository.sendHeartbeat(profile.id);
        }
      }
      
      // Aktualisiere Mining-Stats und -Aktivitäten, um diese mit dem Server zu synchronisieren
      await fetchMiningStats(profile.id);
      await fetchMiningActivities(profile.id);
      
      return true;
    } catch (err) {
      console.error('Error syncing mining state:', err);
      return false;
    }
  }, [profile?.id, isMining, setIsMining, fetchMiningStats, fetchMiningActivities]);

  // Start mining function with server integration
  const startMining = useCallback(async () => {
    if (isMining || !profile?.id) return false;
    
    try {
      setIsLoading(true);
      console.log('Starting mining for user:', profile.id);
      
      // Start mining on the server
      const result = await miningRepository.startMining(profile.id);
      
      // Handle the result directly without accessing .success property
      if (result === true) {
        setIsMining(true);
        toast.success('Mining gestartet');
        console.log('Mining started, rate:', miningRate, 'tokens/hour');
        return true;
      } else {
        toast.error('Fehler beim Starten des Minings');
        return false;
      }
    } catch (error) {
      console.error('Error starting mining:', error);
      toast.error('Fehler beim Starten des Minings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isMining, miningRate, profile?.id, setIsMining, setIsLoading]);

  // Stop mining function with server integration
  const stopMining = useCallback(async () => {
    if (!isMining || !profile?.id) return false;
    
    try {
      setIsLoading(true);
      console.log('Stopping mining for user:', profile.id);
      
      // Stop mining on the server
      const result = await miningRepository.stopMining(profile.id);
      
      // Handle the result directly without accessing .success property
      if (result === true) {
        setIsMining(false);
        toast.info('Mining gestoppt');
        console.log('Mining stopped');
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
  }, [isMining, profile?.id, setIsMining, setIsLoading]);

  // Record activity with improved batch processing
  const recordActivity = useCallback(async (type: ActivityType, points?: number, tokensEarned?: number): Promise<ActivityResult | boolean> => {
    if (!profile?.id || !isMining) {
      console.log('Cannot record activity: User not logged in or mining inactive');
      return false;
    }
    
    // Use provided points or defaults based on activity type
    let activityPoints = points;
    let activityTokens = tokensEarned;
    
    if (activityPoints === undefined) {
      const limits = MINING_LIMITS[type];
      activityPoints = typeof limits === 'object' ? limits.points : 5;
    }
    
    if (activityTokens === undefined) {
      activityTokens = activityPoints * 0.1;
    }
    
    // Check if activity limit is reached
    if (isActivityLimitReached(type)) {
      console.log(`Daily limit reached for activity type: ${type}`);
      return {
        success: true,
        rewarded: false,
        debounced: false,
        message: 'Tägliches Limit erreicht'
      };
    }
    
    // Add to queue for batch processing
    setActivityQueue(prev => [...prev, { 
      type, 
      points: activityPoints!, 
      tokens: activityTokens!,
      timestamp: Date.now() // Add timestamp for age checking
    }]);
    
    // For immediate feedback, update local state
    setMiningStats(prev => {
      const newStats = { ...prev };
      
      // Update both formats
      newStats.totalPoints = (prev.totalPoints || 0) + activityPoints!;
      newStats.totalTokensEarned = (prev.totalTokensEarned || 0) + activityTokens!;
      newStats.dailyPoints = (prev.dailyPoints || 0) + activityPoints!;
      newStats.dailyTokensEarned = (prev.dailyTokensEarned || 0) + activityTokens!;
      newStats.lastActivityAt = new Date();
      
      newStats.total_points = (prev.total_points || 0) + activityPoints!;
      newStats.total_tokens_earned = (prev.total_tokens_earned || 0) + activityTokens!;
      newStats.daily_points = (prev.daily_points || 0) + activityPoints!;
      newStats.daily_tokens_earned = (prev.daily_tokens_earned || 0) + activityTokens!;
      newStats.last_activity_at = new Date();
      
      // Update appropriate counter based on activity type
      if (type === 'post') {
        newStats.daily_posts_count = (prev.daily_posts_count || 0) + 1;
        newStats.dailyPostsCount = (prev.dailyPostsCount || 0) + 1;
      } else if (type === 'comment') {
        newStats.daily_comments_count = (prev.daily_comments_count || 0) + 1;
        newStats.dailyCommentsCount = (prev.dailyCommentsCount || 0) + 1;
      } else if (type === 'like') {
        newStats.daily_likes_count = (prev.daily_likes_count || 0) + 1;
        newStats.dailyLikesCount = (prev.dailyLikesCount || 0) + 1;
      } else if (type === 'share') {
        newStats.daily_shares_count = (prev.daily_shares_count || 0) + 1;
        newStats.dailySharesCount = (prev.dailySharesCount || 0) + 1;
      } else if (type === 'invite') {
        newStats.daily_invites_count = (prev.daily_invites_count || 0) + 1;
        newStats.dailyInvitesCount = (prev.dailyInvitesCount || 0) + 1;
      }
      
      return newStats;
    });
    
    // Create a dummy activity for immediate response
    const dummyActivity: MiningActivity = {
      id: Date.now().toString(),
      user_id: profile.id,
      activity_type: type,
      points: activityPoints!,
      tokens_earned: activityTokens!,
      created_at: new Date(),
      efficiency_at_time: miningStats.efficiency_multiplier || 1.0,
      mining_rate_at_time: miningStats.mining_rate || 0.1
    };
    
    // Add to activities
    setMiningActivities(prev => [dummyActivity, ...prev]);
    
    return {
      success: true,
      rewarded: true,
      debounced: false,
      points: activityPoints!,
      tokens: activityTokens!,
      newActivity: dummyActivity
    };
  }, [profile?.id, isMining, miningStats, setMiningStats, setMiningActivities, isActivityLimitReached]);

  // Check remaining activity allowance
  const getRemainingCount = useCallback((type: string) => {
    if (!miningStats) return 0;
    
    const limit = MINING_LIMITS[type as keyof typeof MINING_LIMITS];
    if (!limit || typeof limit !== 'object') return 0;
    
    // Check both camelCase and snake_case versions
    let dailyCount = 0;
    const camelCaseKey = `daily${type.charAt(0).toUpperCase() + type.slice(1)}sCount` as keyof MiningStats;
    const snakeCaseKey = `daily_${type.toLowerCase()}_count` as keyof MiningStats;
    
    if (camelCaseKey in miningStats) {
      dailyCount = Number(miningStats[camelCaseKey] || 0);
    } else if (snakeCaseKey in miningStats) {
      dailyCount = Number(miningStats[snakeCaseKey] || 0);
    }
    
    return Math.max(0, limit.count - dailyCount);
  }, [miningStats]);

  // Check if activity limit is reached
  const isActivityLimitReached = useCallback((type: string) => {
    return getRemainingCount(type) <= 0;
  }, [getRemainingCount]);

  // Archive old data as a maintenance task
  const cleanupOldData = useCallback(async (daysToKeep: number = 90) => {
    if (!profile?.id) return 0;
    
    try {
      return await miningRepository.archiveOldActivities(daysToKeep);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return 0;
    }
  }, [profile?.id]);

  // Create an object with both formats of mining statistics
  const normalizedMiningStats: MiningStats = normalizeMiningStats({
    // Make sure all stats are available in both formats
    ...miningStats,
    // Add user_id explicitly
    user_id: profile?.id || '',
    userId: profile?.id || ''
  });

  return {
    miningStats: normalizedMiningStats,
    miningActivities,
    recentActivities: miningActivities,
    isLoading,
    isMining: miningStats.is_mining,
    isMiningHealthy,
    miningRate: miningStats.mining_rate,
    pendingActivities: activityQueue.length, // Add this to fix the error
    startMining,
    stopMining,
    recordActivity,
    syncMiningState,
    cleanupOldData,
    isActivityLimitReached,
    getRemainingCount
  };
};

export type { MiningStats, MiningActivity, ActivityResult, ActivityType };
export { MINING_LIMITS, isActivityResult, normalizeMiningStats };
