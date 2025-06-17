
import { useState, useCallback, useEffect } from 'react';

export const useMiningControls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [miningRate, setMiningRate] = useState(0.1); // Tokens per minute
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  
  // Calculate if mining is currently healthy based on heartbeat
  const isMiningHealthy = useCallback(() => {
    if (!isMining || !lastHeartbeat) return false;
    
    const now = new Date();
    const timeSinceLastHeartbeat = now.getTime() - lastHeartbeat.getTime();
    const maxHeartbeatDelay = 60000; // 1 minute
    
    return timeSinceLastHeartbeat < maxHeartbeatDelay;
  }, [isMining, lastHeartbeat]);
  
  // Update heartbeat timestamp
  const updateHeartbeat = useCallback(() => {
    setLastHeartbeat(new Date());
  }, []);
  
  // Set the heartbeat automatically when mining is active
  useEffect(() => {
    if (isMining) {
      updateHeartbeat();
      
      const heartbeatInterval = setInterval(() => {
        updateHeartbeat();
      }, 30000); // Update heartbeat every 30 seconds
      
      return () => clearInterval(heartbeatInterval);
    }
  }, [isMining, updateHeartbeat]);
  
  return {
    isLoading,
    setIsLoading,
    isMining,
    setIsMining,
    miningRate,
    setMiningRate,
    lastHeartbeat,
    updateHeartbeat,
    isMiningHealthy: isMiningHealthy()
  };
};
