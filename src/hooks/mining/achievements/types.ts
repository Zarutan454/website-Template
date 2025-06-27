// Definition von Achievement-Typen für das Mining-System

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'mining' | 'social' | 'token' | 'system';
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  // Die `requirements` werden vom Backend verwaltet und sind im Frontend nicht mehr relevant
  // token_reward und points_reward werden direkt im UserAchievement abgebildet
}

export interface UserAchievement {
  id: string; // ID des UserAchievement-Eintrags
  achievement: Achievement; // Das zugehörige Achievement-Objekt
  user_id: string;
  unlocked_at: string | null; // Zeitstempel, wann es freigeschaltet wurde
  progress: number; // Aktueller Fortschritt (z.B. 5 von 10)
  max_progress: number; // Zielwert für das Achievement (z.B. 10)
  is_completed: boolean;
  
  // Belohnungen
  token_reward: number;
  points_reward: number;
}

// Backend API response structure
export interface BackendAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  progress: number;
  max_progress: number;
  reward: number;
  reward_type: string;
}

export interface BackendAchievementsResponse {
  achievements: BackendAchievement[];
  stats: {
    total: number;
    unlocked: number;
    locked: number;
    completion_percentage: number;
    total_rewards_earned: number;
  };
}

export const ACHIEVEMENT_CATEGORIES = {
  SHORT_TERM: 'mining',
  MID_TERM: 'social',
  LONG_TERM: 'token',
  ELITE: 'system'
};
