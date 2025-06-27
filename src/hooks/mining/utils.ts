/**
 * Utility functions for mining operations
 */

import { MiningStats, ActivityType, isActivityLimit, MINING_LIMITS } from './types';

// Format a date for display with options
export function formatDate(date: Date | string | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('de-DE', mergedOptions).format(dateObj);
}

// Format a duration in seconds to a readable string
export function formatDuration(seconds: number): string {
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
  
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

// Format a number to a readable string with a specified number of decimal places
export function formatNumber(num: number, decimals: number = 2): string {
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}

// Calculate estimated earnings based on mining rate, time, and efficiency
export function calculateEstimatedEarnings(
  miningRate: number,
  seconds: number,
  efficiencyMultiplier: number = 1.0
): number {
  const hours = seconds / 3600;
  const earnings = miningRate * hours * efficiencyMultiplier;
  return earnings;
}

// Check if an activity has reached its daily limit
export function isActivityLimitReached(
  stats: MiningStats,
  activityType: ActivityType,
  limits: Record<string, { count: number }>
): boolean {
  if (!stats || !activityType) return false;
  
  const limit = limits[activityType];
  if (!limit) return false;
  
  // Map activity types to their counter properties
  let count = 0;
  switch (activityType) {
    case 'post':
      count = stats.daily_posts_count || 0;
      break;
    case 'comment':
      count = stats.daily_comments_count || 0;
      break;
    case 'like':
      count = stats.daily_likes_count || 0;
      break;
    case 'share':
      count = stats.daily_shares_count || 0;
      break;
    case 'invite':
      count = stats.daily_invites_count || 0;
      break;
    case 'mining':
      count = 0;  // Mining doesn't have a daily limit
      break;
    case 'login':
      count = 0; // Login doesn't have a daily limit
      break;
    case 'follow':
      count = 0; // Follow doesn't have a limit tracked here
      break;
    case 'nft_like': 
      count = stats.daily_nft_likes_count || 0;
      break;
    case 'nft_share': 
      count = stats.daily_nft_shares_count || 0;
      break;
    case 'token_like': 
      count = stats.daily_token_likes_count || 0;
      break;
    case 'token_share': 
      count = stats.daily_token_shares_count || 0;
      break;
    case 'nft_purchase':
      count = stats.daily_nft_purchases_count || 0;
      break;
    case 'achievement_unlocked':
      count = 0; // Achievement unlocked doesn't have a daily limit
      break;
    default:
      return false;
  }
  
  return count >= limit.count;
}

// Get the remaining count for a specific activity type
export function getRemainingCount(
  stats: MiningStats,
  activityType: ActivityType,
  limits: Record<string, { count: number }>
): number {
  if (!stats || !activityType) return 0;
  
  const limit = limits[activityType];
  if (!limit) return 0;
  
  // Map activity types to their counter properties
  let count = 0;
  switch (activityType) {
    case 'post':
      count = stats.daily_posts_count || 0;
      break;
    case 'comment':
      count = stats.daily_comments_count || 0;
      break;
    case 'like':
      count = stats.daily_likes_count || 0;
      break;
    case 'share':
      count = stats.daily_shares_count || 0;
      break;
    case 'invite':
      count = stats.daily_invites_count || 0;
      break;
    case 'nft_like':
      count = stats.daily_nft_likes_count || 0;
      break;
    case 'nft_share':
      count = stats.daily_nft_shares_count || 0;
      break;
    default:
      return 0;
  }
  
  return Math.max(0, limit.count - count);
}

// Format a token amount with the appropriate symbol
export function formatTokenAmount(amount: number, symbol: string = 'BSN'): string {
  return `${formatNumber(amount)} ${symbol}`;
}

// Re-export some functions from types for easier access
export { calculateEfficiencyMultiplier, formatDateForDatabase } from './types';
