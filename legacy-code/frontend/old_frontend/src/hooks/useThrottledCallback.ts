
import { useCallback, useRef } from 'react';

export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    } else {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a new timeout
      return new Promise<ReturnType<T>>((resolve) => {
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          resolve(callback(...args));
        }, delay - (now - lastCall.current));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, delay, ...deps]);
}
