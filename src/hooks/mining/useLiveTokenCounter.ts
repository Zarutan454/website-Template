import { useState, useEffect } from 'react';
import { useMiningStore } from '@/store/useMiningStore';

/**
 * A specialized hook to provide a smooth, real-time animated token counter.
 * It reads the authoritative state from `useMiningStore` and runs a local
 * ticker to animate the balance between server updates.
 * This isolates high-frequency re-renders to only the components that use this hook.
 *
 * @returns {number} The live, animated token balance.
 */
export const useLiveTokenCounter = (): number => {
  const { miningStats } = useMiningStore();
  const { is_mining, accumulated_tokens, current_rate_per_minute, last_heartbeat } = miningStats || {};

  const [displayTokens, setDisplayTokens] = useState(accumulated_tokens || 0);

  useEffect(() => {
    // Set the display to the authoritative value whenever it changes
    setDisplayTokens(accumulated_tokens || 0);

    if (!is_mining || !current_rate_per_minute || current_rate_per_minute <= 0) {
      return; // No need to run a ticker if not mining
    }

    const ratePerSecond = current_rate_per_minute / 60;
    
    // Use the last heartbeat as a reference, or now if unavailable
    const lastUpdate = last_heartbeat ? new Date(last_heartbeat).getTime() : Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdate) / 1000;
      const earnedSinceLastUpdate = elapsedSeconds * ratePerSecond;
      setDisplayTokens((accumulated_tokens || 0) + earnedSinceLastUpdate);
    }, 200); // Update 5 times per second, less aggressive but still smooth

    return () => clearInterval(interval);

  }, [is_mining, accumulated_tokens, current_rate_per_minute, last_heartbeat]);

  return displayTokens;
}; 