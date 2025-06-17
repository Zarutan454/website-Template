
import { MiningStats, ActivityLimit, isActivityLimit } from '../types';
import { MINING_LIMITS } from '../types';

/**
 * Calculate the speed boost for an activity
 */
export function calculateSpeedBoost(
  activityType: string, 
  stats: MiningStats
): { speedBoost: number; description: string } {
  const limits = MINING_LIMITS[activityType as keyof typeof MINING_LIMITS];
  
  if (!limits) {
    return { speedBoost: 0, description: 'Unbekannte Aktivität' };
  }
  
  let boost = 0;
  let description = '';
  
  if (isActivityLimit(limits)) {
    boost = limits.speedBoost;
    description = limits.description;
  } else {
    // Fallback if it's a simple number
    boost = 0;
    description = 'Basis-Aktivität';
  }
  
  return { speedBoost: boost, description };
}

/**
 * Check if an activity limit has been reached
 */
export function isActivityLimitReached(
  activityType: string,
  stats: MiningStats
): boolean {
  if (!stats) return false;
  
  const limits = MINING_LIMITS[activityType as keyof typeof MINING_LIMITS];
  if (!limits) return false;
  
  let limitCount = 0;
  if (isActivityLimit(limits)) {
    limitCount = limits.count;
  }
  
  // Check the corresponding activity limit
  switch (activityType) {
    case 'post':
      return (stats.daily_posts_count || 0) >= limitCount;
    case 'comment':
      return (stats.daily_comments_count || 0) >= limitCount;
    case 'like':
      return (stats.daily_likes_count || 0) >= limitCount;
    case 'share':
      return (stats.daily_shares_count || 0) >= limitCount;
    case 'invite':
      return (stats.daily_invites_count || 0) >= limitCount;
    case 'nft_like':
      return (stats.daily_nft_likes_count || 0) >= limitCount;
    case 'nft_share':
      return (stats.daily_nft_shares_count || 0) >= limitCount;
    case 'token_like':
      return (stats.daily_token_likes_count || 0) >= limitCount;
    case 'token_share':
      return (stats.daily_token_shares_count || 0) >= limitCount;
    case 'nft_purchase':
      return (stats.daily_nft_purchases_count || 0) >= limitCount;
    default:
      return false;
  }
}

/**
 * Get the remaining count for an activity type
 */
export function getRemainingCount(
  activityType: string,
  stats: MiningStats
): number {
  if (!stats) return 0;
  
  const limits = MINING_LIMITS[activityType as keyof typeof MINING_LIMITS];
  if (!limits) return 0;
  
  let limitCount = 0;
  if (isActivityLimit(limits)) {
    limitCount = limits.count;
  }
  
  // Calculate the remaining count
  switch (activityType) {
    case 'post':
      return Math.max(0, limitCount - (stats.daily_posts_count || 0));
    case 'comment':
      return Math.max(0, limitCount - (stats.daily_comments_count || 0));
    case 'like':
      return Math.max(0, limitCount - (stats.daily_likes_count || 0));
    case 'share':
      return Math.max(0, limitCount - (stats.daily_shares_count || 0));
    case 'invite':
      return Math.max(0, limitCount - (stats.daily_invites_count || 0));
    case 'nft_like':
      return Math.max(0, limitCount - (stats.daily_nft_likes_count || 0));
    case 'nft_share':
      return Math.max(0, limitCount - (stats.daily_nft_shares_count || 0));
    case 'token_like':
      return Math.max(0, limitCount - (stats.daily_token_likes_count || 0));
    case 'token_share':
      return Math.max(0, limitCount - (stats.daily_token_shares_count || 0));
    case 'nft_purchase':
      return Math.max(0, limitCount - (stats.daily_nft_purchases_count || 0));
    default:
      return 0;
  }
}
