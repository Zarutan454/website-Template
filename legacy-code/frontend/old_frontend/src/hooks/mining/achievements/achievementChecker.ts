import { MiningStats } from '../types';
import { Achievement, UserAchievement } from './types';

// Result interface for achievement checks
interface AchievementCheckResult {
  achievementId: string;
  achieved: boolean;
  progress: number;
  title?: string;
  description?: string;
}

/**
 * Check all achievements against current mining stats
 */
export function checkAchievements(
  stats: MiningStats,
  achievements: Achievement[],
  userAchievements: UserAchievement[]
): AchievementCheckResult[] {
  return achievements.map(achievement => {
    const result = checkSingleAchievement(stats, achievement);
    const existingProgress = userAchievements.find(ua => 
      ua.achievement_id === achievement.id || ua.achievementId === achievement.id
    )?.progress || 0;
    
    // If already completed, maintain completion status
    const alreadyCompleted = userAchievements.some(ua => 
      (ua.achievement_id === achievement.id || ua.achievementId === achievement.id) && 
      (ua.completed === true)
    );
    
    // If already completed, keep it achieved regardless of current status
    return {
      achievementId: achievement.id,
      achieved: alreadyCompleted || result.achieved,
      progress: Math.max(existingProgress, result.progress),
      title: achievement.title,
      description: achievement.description
    };
  });
}

/**
 * Check a single achievement against current mining stats
 */
function checkSingleAchievement(
  stats: MiningStats,
  achievement: Achievement
): { achieved: boolean; progress: number } {
  if (!achievement.requirements || !achievement.requirements.type) {
    return { achieved: false, progress: 0 };
  }
  
  const { type, value } = achievement.requirements;
  let currentValue = 0;
  
  // Get the current value based on the requirement type
  switch (type) {
    case 'total_tokens':
      currentValue = stats.total_tokens_earned || stats.totalTokensEarned || 0;
      break;
    case 'total_points':
      currentValue = stats.total_points || stats.totalPoints || 0;
      break;
    case 'mining_sessions':
      currentValue = stats.mining_sessions_count || stats.miningSessionsCount || 0;
      break;
    case 'mining_time':
      currentValue = stats.total_mining_time || stats.totalMiningTime || 0;
      break;
    case 'streak_days':
      currentValue = stats.streak_days || stats.streakDays || 0;
      break;
    case 'posts_count':
      currentValue = stats.daily_posts_count || stats.dailyPostsCount || 0;
      break;
    case 'comments_count':
      currentValue = stats.daily_comments_count || stats.dailyCommentsCount || 0;
      break;
    case 'likes_count':
      currentValue = stats.daily_likes_count || stats.dailyLikesCount || 0;
      break;
    case 'shares_count':
      currentValue = stats.daily_shares_count || stats.dailySharesCount || 0;
      break;
    default:
      return { achieved: false, progress: 0 };
  }
  
  // Calculate progress percentage (capped at 100%)
  const progress = Math.min(100, (currentValue / value) * 100);
  
  // Achievement is completed if progress is 100% or more
  return {
    achieved: currentValue >= value,
    progress
  };
}
