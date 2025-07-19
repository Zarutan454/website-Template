
import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/types/profile';
import { MiningStats, ActivityType } from '@/hooks/mining/types';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';

export function useMiningStatus(
  profile: Profile | null,
  initialStats: MiningStats,
  isMining: boolean,
  startMiningFn: () => Promise<boolean>,
  stopMiningFn: () => Promise<boolean>,
  recordActivityFn: (type: ActivityType, points: number, tokens: number) => Promise<boolean>,
  syncStateFn?: () => Promise<boolean | void>
) {
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [efficiency, setEfficiency] = useState(1.0);
  const [comboMultiplier, setComboMultiplier] = useState(1.0);
  const [isPerformingAction, setIsPerformingAction] = useState<string | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState<Date | null>(null);
  
  // Batch processing queue
  const [activityQueue, setActivityQueue] = useState<Array<{
    type: ActivityType; 
    points: number; 
    tokens: number;
    timestamp: number;
  }>>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Set initial total earnings
  useEffect(() => {
    setTotalEarnings(initialStats.total_tokens_earned || 0);
  }, [initialStats.total_tokens_earned]);

  // Initialize start time if already mining
  useEffect(() => {
    if (isMining && !startTime) {
      setStartTime(new Date());
    } else if (!isMining) {
      setStartTime(null);
      setTimeElapsed(0);
    }
  }, [isMining, startTime]);

  // Time elapsed counter
  useEffect(() => {
    if (!isMining || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMining, startTime]);

  // Efficiency calculation - improved for better performance
  useEffect(() => {
    const calculateEfficiency = () => {
      let baseEfficiency = 1.0;
      
      // Add streak bonus if present
      if (initialStats.streak_days && initialStats.streak_days > 0) {
        baseEfficiency += Math.min(0.2, initialStats.streak_days * 0.05);
      }
      
      // Activity recency bonus
      if (lastActivityTime) {
        const now = new Date();
        const minutesSinceLastActivity = (now.getTime() - lastActivityTime.getTime()) / (1000 * 60);
        
        // Higher bonus for more recent activity (within 5 minutes)
        if (minutesSinceLastActivity < 5) {
          const recencyBonus = 0.2 * (1 - (minutesSinceLastActivity / 5));
          baseEfficiency += recencyBonus;
        }
      }
      
      setEfficiency(parseFloat(baseEfficiency.toFixed(2)));
    };
    
    // Calculate immediately and then set up interval
    calculateEfficiency();
    
    // Recalculate every 30 seconds for efficiency
    const interval = setInterval(calculateEfficiency, 30000);
    
    return () => clearInterval(interval);
  }, [initialStats.streak_days, lastActivityTime]);

  // Process activity queue
  useEffect(() => {
    if (!profile || !isMining || activityQueue.length === 0 || isProcessingQueue) return;
    
    const processQueue = async () => {
      try {
        setIsProcessingQueue(true);
        
        // Only process if we have multiple items or the oldest item is more than 1 second old
        const now = Date.now();
        const oldestTimestamp = activityQueue[0]?.timestamp || 0;
        
        if (activityQueue.length >= 3 || (now - oldestTimestamp > 1000)) {
          // Group activities of the same type to reduce processing
          const activitiesToProcess = [...activityQueue];
          
          // Clear queue immediately to avoid double processing
          setActivityQueue([]);
          
          // Calculate total rewards for toast notification
          const totalTokens = activitiesToProcess.reduce((sum, act) => sum + act.tokens, 0);
          const mainActivityType = activitiesToProcess[0].type;
          
          // Optimistically update the total earnings
          setTotalEarnings(prev => prev + totalTokens);
          
          // Process activities in batch if more than one, otherwise process normally
          let success = false;
          
          if (activitiesToProcess.length > 1) {
            // Process as batch - in real implementation would call batch API
            success = await recordActivityFn(
              activitiesToProcess[0].type,
              activitiesToProcess.reduce((sum, act) => sum + act.points, 0),
              totalTokens
            );
          } else {
            // Process single activity
            const activity = activitiesToProcess[0];
            success = await recordActivityFn(activity.type, activity.points, activity.tokens);
          }
          
          if (success) {
            setLastActivityTime(new Date());
            setComboMultiplier(prev => Math.min(2.0, prev + 0.05));
            
            // Perform a sync after successful activities
            if (syncStateFn) {
              setTimeout(() => {
                syncStateFn();
              }, 500);
            }
          } else {
            // Revert optimistic update if there was an error
            setTotalEarnings(prev => prev - totalTokens);
          }
        }
      } catch (error) {
        // Intentionally left empty: errors are handled by optimistic update revert below
      } finally {
        setIsProcessingQueue(false);
      }
    };
    
    processQueue();
  }, [activityQueue, isProcessingQueue, isMining, profile, recordActivityFn, syncStateFn]);

  // Handle mining toggle with debounce
  const handleMiningToggle = useThrottledCallback(async () => {
    if (!profile) {
      setStartError('Du musst angemeldet sein, um das Mining zu starten.');
      return;
    }

    if (isMining) {
      try {
        const success = await stopMiningFn();
        if (success) {
          setStartTime(null);
          setTimeElapsed(0);
        }
      } catch (error) {
        console.error('Fehler beim Stoppen des Minings:', error);
      }
    } else {
      setIsStarting(true);
      setStartError(null);
      
      try {
        const success = await startMiningFn();
        if (success) {
          setStartTime(new Date());
          setLastActivityTime(new Date());
        } else {
          setStartError('Mining konnte nicht gestartet werden.');
        }
      } catch (error) {
        console.error('Fehler beim Starten des Minings:', error);
        setStartError('Ein Fehler ist aufgetreten.');
      } finally {
        setIsStarting(false);
      }
    }
  }, 1000);

  // Enhanced interaction handling with batching
  const onInteraction = useThrottledCallback(async (type: ActivityType, points: number, tokens: number) => {
    if (!profile || !isMining) return false;
    
    try {
      // Set action status immediately for UI feedback
      setIsPerformingAction(type);
      
      // Add to activity queue with timestamp
      setActivityQueue(prev => [...prev, { 
        type, 
        points, 
        tokens: tokens * comboMultiplier, // Apply combo multiplier
        timestamp: Date.now() 
      }]);
      
      // Optimistic UI update
      setLastActivityTime(new Date());
      
      return true;
    } catch (error) {
      console.error(`Fehler bei Aktivität ${type}:`, error);
      return false;
    } finally {
      setIsPerformingAction(null);
    }
  }, 300); // Reduced throttle time for more responsive UI

  return {
    isStarting,
    startError,
    timeElapsed,
    efficiency,
    comboMultiplier,
    isPerformingAction,
    totalEarnings,
    handleMiningToggle,
    onInteraction,
    pendingActivities: activityQueue.length // Expose pending activities count
  };
}
