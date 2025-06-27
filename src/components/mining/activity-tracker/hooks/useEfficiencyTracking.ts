
import { useState, useEffect, useRef } from 'react';

export const useEfficiencyTracking = (isMining: boolean, lastInteraction: Date | null) => {
  const [efficiency, setEfficiency] = useState<number>(100);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  
  const decayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isMining) {
      setEfficiency(100);
      setComboMultiplier(1);
      
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
        decayIntervalRef.current = null;
      }
    }
  }, [isMining]);

  useEffect(() => {
    if (decayIntervalRef.current) {
      clearInterval(decayIntervalRef.current);
      decayIntervalRef.current = null;
    }
    
    if (!isMining) return;

    console.log('Setting up efficiency decay interval');
    
    decayIntervalRef.current = setInterval(() => {
      if (lastInteraction) {
        const now = new Date();
        const timeSinceInteraction = (now.getTime() - lastInteraction.getTime()) / 1000 / 60; // minutes
        
        if (timeSinceInteraction > 2) {
          setEfficiency(prev => {
            const newValue = Math.max(50, prev - 1); // Minimum 50% efficiency
            if (prev !== newValue) {
              console.log(`Efficiency decayed to ${newValue}% after ${timeSinceInteraction.toFixed(1)} minutes`);
            }
            return newValue;
          });
          
          if (timeSinceInteraction > 5) {
            setComboMultiplier(prev => {
              if (prev > 1) {
                console.log(`Combo multiplier reset to 1 after ${timeSinceInteraction.toFixed(1)} minutes of inactivity`);
                return 1;
              }
              return prev;
            });
          }
        }
      }
    }, 30 * 1000); // Check every 30 seconds
    
    return () => {
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
        decayIntervalRef.current = null;
      }
    };
  }, [isMining, lastInteraction]);

  return {
    efficiency,
    setEfficiency,
    comboMultiplier,
    setComboMultiplier
  };
};
