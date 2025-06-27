
import { MiningStats, MiningActivity } from '../types';
import { formatDateForDatabase, normalizeMiningStats } from '../types';

// Calculate efficiency multiplier based on streak days and other factors
export function calculateEfficiencyMultiplier(stats: Partial<MiningStats>): number {
  let multiplier = 1.0;
  
  // Add streak bonus
  if (stats.streak_days && stats.streak_days > 0) {
    multiplier += Math.min(0.5, stats.streak_days * 0.05);
  }
  
  // Add achievement bonus
  if (stats.achievement_bonus && stats.achievement_bonus > 0) {
    multiplier += stats.achievement_bonus;
  }
  
  return parseFloat(multiplier.toFixed(2));
}

/**
 * Calculate total tokens earned from a list of activities
 */
export const calculateTotalTokens = (activities: MiningActivity[]): number => {
  return activities.reduce((sum, activity) => sum + (activity.tokens_earned || 0), 0);
};

/**
 * Calculate total points earned from a list of activities
 */
export const calculateTotalPoints = (activities: MiningActivity[]): number => {
  return activities.reduce((sum, activity) => sum + (activity.points || 0), 0);
};

/**
 * Get the most recent activity
 */
export const getMostRecentActivity = (activities: MiningActivity[]): MiningActivity | null => {
  if (!activities || activities.length === 0) return null;
  
  const sorted = [...activities].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
  
  return sorted[0];
};

// Fix the function signature for the function with the error
export function resetDailyStats(stats: MiningStats): MiningStats {
  const resetStats = {
    ...stats,
    daily_points: 0,
    daily_tokens_earned: 0,
    daily_posts_count: 0,
    daily_comments_count: 0,
    daily_likes_count: 0,
    daily_shares_count: 0,
    daily_invites_count: 0,
    daily_nft_likes_count: 0,
    daily_nft_shares_count: 0,
    daily_token_likes_count: 0,
    daily_token_shares_count: 0,
    daily_nft_purchases_count: 0,
    daily_reset_at: new Date().toISOString()
  };
  
  // Make sure to return a properly formatted MiningStats object
  return normalizeMiningStats(resetStats);
}
