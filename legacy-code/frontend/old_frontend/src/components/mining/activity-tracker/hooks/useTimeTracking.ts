
import { useState, useEffect } from 'react';

export const useTimeTracking = (isMining: boolean, lastActivityTime: Date | null) => {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  
  useEffect(() => {
    if (!isMining || !lastActivityTime) {
      setTimeElapsed(0);
      return;
    }
    
    const calculateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - lastActivityTime.getTime()) / 1000);
      setTimeElapsed(elapsed);
    };
    
    // Initial calculation
    calculateElapsed();
    
    // Set up interval to update elapsed time every second
    const interval = setInterval(calculateElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [isMining, lastActivityTime]);

  return { timeElapsed };
};
