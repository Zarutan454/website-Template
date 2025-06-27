/**
 * Types related to mining functionality
 */

export type ActivityType = 
  | 'post' 
  | 'comment' 
  | 'like' 
  | 'share' 
  | 'invite'
  | 'nft_like'
  | 'nft_share'
  | 'nft_purchase'
  | 'token_like'
  | 'token_share'
  | 'login';

export interface MiningBoost {
  id: number;
  boost_type: string;
  multiplier: number; // Changed from string to number
  expires_at: string;
  remaining_time?: string;
}

export interface MiningStats {
  is_mining: boolean;
  mining_power: number;
  current_rate_per_minute: number;
  accumulated_tokens: number;
  daily_mined: number;
  daily_limit: number;
  streak_days: number;
  last_heartbeat: string | null;
  active_boosts: MiningBoost[];
  total_points?: number;
  total_tokens_earned?: number;
  daily_points?: number;
  daily_tokens_earned?: number;
  efficiency_multiplier?: number;
  current_rate?: number; // Legacy, can be mapped from current_rate_per_minute
  mining_rate?: number;
  current_speed_boost?: number;
  max_speed_boost?: number;
  effective_mining_rate?: number;
  last_activity_at?: string | Date;
  last_inactive_check?: string | Date;
  daily_reset_at?: string | Date;
  user_id?: string;
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

export interface ActivityRecord {
  timestamp: string;
  count: number;
}

export type DailyActivity = {
  [key in ActivityType]?: ActivityRecord;
};

// Function to normalize mining stats - ensures all numeric fields are numbers
export function normalizeMiningStats(stats: Partial<MiningStats>): MiningStats {
  return {
    is_mining: stats.is_mining ?? false,
    mining_power: typeof stats.mining_power === 'string' ? parseFloat(stats.mining_power) || 0 : (stats.mining_power ?? 0),
    current_rate_per_minute: typeof stats.current_rate_per_minute === 'string' ? parseFloat(stats.current_rate_per_minute) || 0 : (stats.current_rate_per_minute ?? 0),
    accumulated_tokens: typeof stats.accumulated_tokens === 'string' ? parseFloat(stats.accumulated_tokens) || 0 : (stats.accumulated_tokens ?? 0),
    daily_mined: typeof stats.daily_mined === 'string' ? parseFloat(stats.daily_mined) || 0 : (stats.daily_mined ?? 0),
    daily_limit: typeof stats.daily_limit === 'string' ? parseFloat(stats.daily_limit) || 0 : (stats.daily_limit ?? 0),
    streak_days: typeof stats.streak_days === 'string' ? parseInt(stats.streak_days) || 0 : (stats.streak_days ?? 0),
    last_heartbeat: stats.last_heartbeat ? (typeof stats.last_heartbeat === 'string' ? stats.last_heartbeat : stats.last_heartbeat.toISOString()) : null,
    active_boosts: stats.active_boosts?.map(boost => ({
      ...boost,
      multiplier: typeof boost.multiplier === 'string' ? parseFloat(boost.multiplier) || 1 : boost.multiplier
    })) ?? [],
    daily_posts_count: typeof stats.daily_posts_count === 'string' ? parseInt(stats.daily_posts_count) || 0 : (stats.daily_posts_count ?? 0),
    daily_comments_count: typeof stats.daily_comments_count === 'string' ? parseInt(stats.daily_comments_count) || 0 : (stats.daily_comments_count ?? 0),
    daily_likes_count: typeof stats.daily_likes_count === 'string' ? parseInt(stats.daily_likes_count) || 0 : (stats.daily_likes_count ?? 0),
    daily_shares_count: typeof stats.daily_shares_count === 'string' ? parseInt(stats.daily_shares_count) || 0 : (stats.daily_shares_count ?? 0),
    daily_invites_count: typeof stats.daily_invites_count === 'string' ? parseInt(stats.daily_invites_count) || 0 : (stats.daily_invites_count ?? 0),
    daily_nft_likes_count: typeof stats.daily_nft_likes_count === 'string' ? parseInt(stats.daily_nft_likes_count) || 0 : (stats.daily_nft_likes_count ?? 0),
    daily_nft_shares_count: typeof stats.daily_nft_shares_count === 'string' ? parseInt(stats.daily_nft_shares_count) || 0 : (stats.daily_nft_shares_count ?? 0),
    daily_nft_purchases_count: typeof stats.daily_nft_purchases_count === 'string' ? parseInt(stats.daily_nft_purchases_count) || 0 : (stats.daily_nft_purchases_count ?? 0),
    daily_token_likes_count: typeof stats.daily_token_likes_count === 'string' ? parseInt(stats.daily_token_likes_count) || 0 : (stats.daily_token_likes_count ?? 0),
    daily_token_shares_count: typeof stats.daily_token_shares_count === 'string' ? parseInt(stats.daily_token_shares_count) || 0 : (stats.daily_token_shares_count ?? 0),
    total_points: typeof stats.total_points === 'string' ? parseFloat(stats.total_points) || 0 : (stats.total_points ?? 0),
    total_tokens_earned: typeof stats.total_tokens_earned === 'string' ? parseFloat(stats.total_tokens_earned) || 0 : (stats.total_tokens_earned ?? 0),
    daily_points: typeof stats.daily_points === 'string' ? parseFloat(stats.daily_points) || 0 : (stats.daily_points ?? 0),
    daily_tokens_earned: typeof stats.daily_tokens_earned === 'string' ? parseFloat(stats.daily_tokens_earned) || 0 : (stats.daily_tokens_earned ?? 0),
    efficiency_multiplier: typeof stats.efficiency_multiplier === 'string' ? parseFloat(stats.efficiency_multiplier) || 1 : (stats.efficiency_multiplier ?? 1),
    current_rate: typeof stats.current_rate === 'string' ? parseFloat(stats.current_rate) || 0 : (stats.current_rate ?? 0),
    mining_rate: typeof stats.mining_rate === 'string' ? parseFloat(stats.mining_rate) || 0.1 : (stats.mining_rate ?? 0.1),
    current_speed_boost: typeof stats.current_speed_boost === 'string' ? parseFloat(stats.current_speed_boost) || 1 : (stats.current_speed_boost ?? 1),
    max_speed_boost: typeof stats.max_speed_boost === 'string' ? parseFloat(stats.max_speed_boost) || 1 : (stats.max_speed_boost ?? 1),
    effective_mining_rate: typeof stats.effective_mining_rate === 'string' ? parseFloat(stats.effective_mining_rate) || 0.1 : (stats.effective_mining_rate ?? 0.1),
    last_activity_at: stats.last_activity_at ? (typeof stats.last_activity_at === 'string' ? stats.last_activity_at : stats.last_activity_at.toISOString()) : undefined,
    last_inactive_check: stats.last_inactive_check ? (typeof stats.last_inactive_check === 'string' ? stats.last_inactive_check : stats.last_inactive_check.toISOString()) : undefined,
    daily_reset_at: stats.daily_reset_at ? (typeof stats.daily_reset_at === 'string' ? stats.daily_reset_at : stats.daily_reset_at.toISOString()) : undefined,
    user_id: stats.user_id
  };
}
