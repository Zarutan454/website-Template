
import { useCallback, useRef } from 'react';

/**
 * Helper function to debounce function calls
 * @param func The function to debounce
 * @param delay Delay in milliseconds
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Helper function to throttle function calls
 * @param func The function to throttle
 * @param limit Minimum time between calls in milliseconds
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      func(...args);
      lastCall = now;
    }
  };
};

/**
 * Hook to batch multiple state updates for better performance
 */
export const useBatchedUpdates = () => {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const batchUpdates = useCallback((callback: () => void) => {
    pendingUpdates.current.push(callback);
    
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        // Process all updates in one batch
        const updates = [...pendingUpdates.current];
        pendingUpdates.current = [];
        
        // Execute all updates
        requestAnimationFrame(() => {
          updates.forEach(update => update());
        });
        
        timeoutRef.current = null;
      }, 16); // One frame at 60fps
    }
  }, []);
  
  return batchUpdates;
};

/**
 * Cache for expensive calculations
 */
export class ComputationCache<T> {
  private cache: Map<string, { value: T, timestamp: number }> = new Map();
  private ttl: number;
  
  constructor(timeToLiveMs: number = 30000) { // Default 30 seconds
    this.ttl = timeToLiveMs;
  }
  
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export default {
  debounce,
  throttle,
  useBatchedUpdates,
  ComputationCache
};
