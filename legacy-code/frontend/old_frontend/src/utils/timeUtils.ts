
/**
 * Formats a time elapsed in seconds into a human-readable string
 * @param seconds Number of seconds elapsed
 * @returns Formatted string (e.g., "5m 30s")
 */
export function formatTimeElapsed(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return `${days}d ${remainingHours}h`;
}

/**
 * Formats a duration in seconds into a human-readable string
 * with appropriate time units (seconds, minutes, hours, days)
 */
export function formatDuration(seconds: number): string {
  return formatTimeElapsed(seconds);
}

/**
 * Calculates the time difference between the current time and a given date
 * @param date The date to calculate the time difference from
 * @returns Number of seconds elapsed since the given date
 */
export function getTimeElapsedInSeconds(date: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / 1000);
}
