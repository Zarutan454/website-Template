
// Definition von Achievement-Typen für das Mining-System

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'mining' | 'social' | 'token' | 'system';
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirements: {
    type: string;
    value: number;
  };
  token_reward: number;
  tokenReward: number; // Keep both for compatibility
  points_reward: number;
  pointsReward: number; // Keep both for compatibility
  hidden?: boolean;
}

export interface UserAchievement {
  id: string;
  userId?: string;
  user_id?: string;
  achievementId?: string;
  achievement_id?: string;
  progress: number;
  completed: boolean;
  completedAt?: Date | null;
  completed_at?: Date | null;
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date;
  updated_at?: Date;
  
  // Reference to the Achievement for full information
  achievement?: Achievement;
  title?: string;
  tokenReward?: number;
  token_reward?: number;
}

export const ACHIEVEMENT_CATEGORIES = {
  SHORT_TERM: 'mining',
  MID_TERM: 'social',
  LONG_TERM: 'token',
  ELITE: 'system'
};
