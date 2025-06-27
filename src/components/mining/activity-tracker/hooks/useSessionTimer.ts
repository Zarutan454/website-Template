
import { useState, useEffect, useCallback } from 'react';

interface UseSessionTimerOptions {
  maxDurationMinutes?: number; // Maximum session duration in minutes
  warningThresholdPercent?: number; // Percentage threshold for warning 
}

/**
 * Hook that manages a mining session timer with a maximum duration
 * And tracks progress toward that maximum duration
 */
export const useSessionTimer = (
  isActive: boolean,
  startTime: Date | null,
  onSessionEnd: () => void,
  options: UseSessionTimerOptions = {}
) => {
  // Default options
  const maxDuration = (options.maxDurationMinutes || 240) * 60; // Default: 4 hours in seconds
  const warningThreshold = options.warningThresholdPercent || 75; // Default: 75% of max time
  
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  
  // Calculate remaining time
  const formatRemainingTime = useCallback(() => {
    const remainingSeconds = maxDuration - elapsedSeconds;
    
    if (remainingSeconds <= 0) return "00:00:00";
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsedSeconds, maxDuration]);
  
  // Update timer at regular intervals
  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsedSeconds(0);
      setProgress(0);
      return;
    }
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
      setElapsedSeconds(elapsed);
      
      // Calculate progress percentage (0-100)
      const progressPercentage = Math.min(100, (elapsed / maxDuration) * 100);
      setProgress(progressPercentage);
      
      // Check if session should end
      if (elapsed >= maxDuration) {
        clearInterval(intervalId);
        onSessionEnd();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isActive, startTime, maxDuration, onSessionEnd]);
  
  return {
    elapsedSeconds,
    progress,
    formatRemainingTime,
    isWarning: progress >= warningThreshold,
    isNearEnd: progress >= 90
  };
};

export default useSessionTimer;
