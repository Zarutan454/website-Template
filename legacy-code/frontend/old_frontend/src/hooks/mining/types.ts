/**
 * Types related to mining functionality
 */

export type ActivityType = 
  | 'login'
  | 'post'
  | 'comment'
  | 'like'
  | 'share'
  | 'invite'
  | 'profile_update'
  | 'follow'
  | 'achievement_unlocked'
  | 'streak_bonus'
  | 'daily_bonus'
  | 'mining'       // Adding mining type
  | 'nft_like'     // Adding NFT related types
  | 'nft_share'
  | 'nft_purchase'
  | 'token_like'
  | 'token_share';

export interface MiningStats {
  user_id: string;
  total_points: number;
  total_tokens_earned: number;
  daily_points: number;
  daily_tokens_earned: number;
  is_mining: boolean;
  last_activity_at: string;         // Must be string type for DB compatibility
  last_heartbeat?: string;
  efficiency_multiplier: number;
  mining_rate: number;              // Base mining rate in tokens per hour
  achievement_bonus: number;
  streak_days: number;
  last_streak_update?: string;
  
  current_speed_boost: number;      // Current speed boost percentage (0-95%)
  max_speed_boost: number;          // Maximum possible speed boost percentage
  effective_mining_rate: number;    // Actual mining rate with boosts applied
  
  // Optional activity counts for various types
  daily_posts_count?: number;
  daily_comments_count?: number;
  daily_likes_count?: number;
  daily_shares_count?: number;
  daily_invites_count?: number;
  daily_nft_likes_count?: number;
  daily_nft_shares_count?: number;
  daily_nft_purchases_count?: number;
  daily_token_likes_count?: number;
  daily_token_shares_count?: number;
  daily_reset_at?: string;
  mining_sessions_count?: number;
  total_mining_time?: number;
  last_inactive_check?: string;     // Last time inactivity was checked
  
  // Camel case alternatives for better compatibility
  totalPoints?: number;
  totalTokensEarned?: number;
  dailyPoints?: number;
  dailyTokensEarned?: number;
  lastActivityAt?: string;          // Keep as string for compatibility
  isMining?: boolean;
  efficiencyMultiplier?: number;
  achievementBonus?: number;
  streakDays?: number;
  miningRate?: number;
  currentSpeedBoost?: number;
  maxSpeedBoost?: number;
  effectiveMiningRate?: number;
  lastInactiveCheck?: string;
  dailyPostsCount?: number;
  dailyCommentsCount?: number;
  dailyLikesCount?: number;
  dailySharesCount?: number;
  dailyInvitesCount?: number;
  dailyNftLikesCount?: number;
  dailyNftSharesCount?: number;
  dailyNftPurchasesCount?: number;
  dailyTokenLikesCount?: number;
  dailyTokenSharesCount?: number;
  miningSessionsCount?: number;
  totalMiningTime?: number;
  dailyResetAt?: string;
}

export interface MiningActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  points: number;
  tokens_earned: number;
  created_at: string;
  efficiency_at_time?: number;
  mining_rate_at_time?: number;
}

export interface MiningSessionData {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'expired' | 'auto_terminated';
  created_at: string;
}

export interface MiningInterval {
  id: string;
  user_id: string;
  session_id?: string;
  start_time: string;
  end_time?: string;
  interval_length_seconds: number;
  points_earned: number;
  tokens_earned: number;
  interval_type: 'standard' | 'boosted' | 'achievement';
  created_at: string;
}

export interface ActivityLimit {
  count: number;
  speedBoost: number;
  description: string;
  cooldown?: number;
}

export interface ActivityResult {
  success: boolean;
  rewarded: boolean;
  debounced?: boolean;
  message?: string;
  points?: number;
  tokens?: number;
  speedBoost?: number;
  newSpeedBoost?: number;
  newActivity?: MiningActivity;
}

// Utility functions for type checking
export const isActivityResult = (value: unknown): value is ActivityResult => {
  return value !== null && typeof value === 'object' && 'success' in (value as Record<string, unknown>);
};

export const isActivityLimit = (value: unknown): value is ActivityLimit => {
  return value !== null && typeof value === 'object' && 'count' in (value as Record<string, unknown>);
};

export const isLimitReached = (type: ActivityType, stats: MiningStats): boolean => {
  if (!stats || !type || !MINING_LIMITS) return false;
  
  const limit = MINING_LIMITS[type];
  if (!isActivityLimit(limit)) return false;
  
  let count = 0;
  switch (type) {
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
    case 'nft_purchase':
      count = stats.daily_nft_purchases_count || 0;
      break;
    case 'token_like':
      count = stats.daily_token_likes_count || 0;
      break;
    case 'token_share':
      count = stats.daily_token_shares_count || 0;
      break;
    default:
      return false;
  }
  
  return count >= limit.count;
};

export const MINING_LIMITS: Record<string, ActivityLimit> = {
  post: { count: 3, speedBoost: 5, description: 'Erstelle einen Beitrag' },
  comment: { count: 5, speedBoost: 3, description: 'Kommentiere einen Beitrag' },
  like: { count: 5, speedBoost: 2, description: 'Like einen Beitrag' },
  share: { count: 5, speedBoost: 4, description: 'Teile einen Beitrag' },
  invite: { count: 2, speedBoost: 10, description: 'Lade einen Freund ein' },
  mining: { count: 1, speedBoost: 0, description: 'Mining-Aktivität' },
  nft_like: { count: 3, speedBoost: 5, description: 'Like ein NFT' },
  nft_share: { count: 3, speedBoost: 5, description: 'Teile ein NFT' },
  nft_purchase: { count: 1, speedBoost: 15, description: 'Kaufe ein NFT' },
  token_like: { count: 3, speedBoost: 5, description: 'Like einen Token' },
  token_share: { count: 3, speedBoost: 5, description: 'Teile einen Token' },
  mining_start: { count: 1, speedBoost: 0, description: 'Starte Mining' },
  heartbeat: { count: 1, speedBoost: 0, description: 'Heartbeat' },
  login: { count: 1, speedBoost: 0, description: 'Login' }
};

// Utility function to normalize stats to ensure both camelCase and snake_case properties
export function normalizeMiningStats(stats: Partial<MiningStats>): MiningStats {
  if (!stats) return {} as MiningStats;
  
  const normalized = { ...stats } as MiningStats;
  
  // Ensure required fields have default values
  normalized.user_id = stats.user_id || '';
  normalized.total_points = stats.total_points || 0;
  normalized.total_tokens_earned = stats.total_tokens_earned || 0;
  normalized.daily_points = stats.daily_points || 0;
  normalized.daily_tokens_earned = stats.daily_tokens_earned || 0;
  normalized.is_mining = stats.is_mining ?? false;
  normalized.efficiency_multiplier = stats.efficiency_multiplier || 1.0;
  normalized.achievement_bonus = stats.achievement_bonus || 0;
  normalized.streak_days = stats.streak_days || 0;
  normalized.mining_rate = stats.mining_rate || 0.3; // Updated default to 0.3 tokens/hour
  
  normalized.current_speed_boost = stats.current_speed_boost || 0;
  normalized.max_speed_boost = stats.max_speed_boost || 95; // Default max boost is 95%
  
  const boostMultiplier = 1 + (normalized.current_speed_boost / 100);
  normalized.effective_mining_rate = parseFloat((normalized.mining_rate * boostMultiplier).toFixed(4));
  
  // For Date objects, ensure they're converted to strings for DB compatibility
  if (stats.last_activity_at) {
    normalized.last_activity_at = typeof stats.last_activity_at === 'string' 
      ? stats.last_activity_at 
      : (stats.last_activity_at as Date).toISOString();
  } else {
    normalized.last_activity_at = new Date().toISOString();
  }
  
  if (stats.last_inactive_check) {
    normalized.last_inactive_check = typeof stats.last_inactive_check === 'string'
      ? stats.last_inactive_check
      : (stats.last_inactive_check as Date).toISOString();
  } else {
    normalized.last_inactive_check = new Date().toISOString();
  }
  
  // Ensure camelCase alternatives exist
  normalized.totalPoints = normalized.total_points;
  normalized.totalTokensEarned = normalized.total_tokens_earned;
  normalized.dailyPoints = normalized.daily_points;
  normalized.dailyTokensEarned = normalized.daily_tokens_earned;
  normalized.lastActivityAt = normalized.last_activity_at;
  normalized.isMining = normalized.is_mining;
  normalized.efficiencyMultiplier = normalized.efficiency_multiplier;
  normalized.achievementBonus = normalized.achievement_bonus;
  normalized.streakDays = normalized.streak_days;
  normalized.miningRate = normalized.mining_rate;
  normalized.currentSpeedBoost = normalized.current_speed_boost;
  normalized.maxSpeedBoost = normalized.max_speed_boost;
  normalized.effectiveMiningRate = normalized.effective_mining_rate;
  normalized.lastInactiveCheck = normalized.last_inactive_check;
  
  // Handle activity counts
  normalized.daily_posts_count = stats.daily_posts_count || 0;
  normalized.daily_comments_count = stats.daily_comments_count || 0;
  normalized.daily_likes_count = stats.daily_likes_count || 0;
  normalized.daily_shares_count = stats.daily_shares_count || 0;
  normalized.daily_invites_count = stats.daily_invites_count || 0;
  normalized.daily_nft_likes_count = stats.daily_nft_likes_count || 0;
  normalized.daily_nft_shares_count = stats.daily_nft_shares_count || 0;
  normalized.daily_nft_purchases_count = stats.daily_nft_purchases_count || 0;
  normalized.daily_token_likes_count = stats.daily_token_likes_count || 0;
  normalized.daily_token_shares_count = stats.daily_token_shares_count || 0;
  
  // Also set camelCase versions
  normalized.dailyPostsCount = normalized.daily_posts_count;
  normalized.dailyCommentsCount = normalized.daily_comments_count;
  normalized.dailyLikesCount = normalized.daily_likes_count;
  normalized.dailySharesCount = normalized.daily_shares_count;
  normalized.dailyInvitesCount = normalized.daily_invites_count;
  normalized.dailyNftLikesCount = normalized.daily_nft_likes_count;
  normalized.dailyNftSharesCount = normalized.daily_nft_shares_count;
  normalized.dailyNftPurchasesCount = normalized.daily_nft_purchases_count;
  normalized.dailyTokenLikesCount = normalized.daily_token_likes_count;
  normalized.dailyTokenSharesCount = normalized.daily_token_shares_count;
  
  // If daily_reset_at exists, normalize it
  if (stats.daily_reset_at) {
    normalized.daily_reset_at = typeof stats.daily_reset_at === 'string'
      ? stats.daily_reset_at
      : (stats.daily_reset_at as Date).toISOString();
    normalized.dailyResetAt = normalized.daily_reset_at;
  }
  
  return normalized;
}

// Helper to convert Date to database-friendly format
export function formatDateForDatabase(date: Date | string | undefined): string {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  return date.toISOString();
}

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

// Function to normalize activity object
export function normalizeActivity(activity: MiningActivity): MiningActivity {
  return {
    ...activity,
    efficiency_at_time: activity.efficiency_at_time || 1.0,
    mining_rate_at_time: activity.mining_rate_at_time || 0.1
  };
}

// Additional utility functions that were missing
export function transformMiningActivity(activity: MiningActivity): MiningActivity {
  return normalizeActivity(activity);
}

export function transformMiningActivities(activities: MiningActivity[]): MiningActivity[] {
  return activities.map(transformMiningActivity);
}

export function normalizeActivityType(type: string): ActivityType {
  if (Object.keys(MINING_LIMITS).includes(type)) {
    return type as ActivityType;
  }
  // Default to login if type is invalid
  return 'login';
}
