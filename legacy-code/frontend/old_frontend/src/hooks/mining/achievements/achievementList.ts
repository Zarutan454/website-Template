
import { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'mining-starter',
    title: 'Mining Starter',
    description: 'Starte dein erstes Mining',
    category: 'mining',
    icon: 'pick',
    difficulty: 'easy',
    requirements: { type: 'mining_start', value: 1 },
    tokenReward: 5,
    pointsReward: 50,
    token_reward: 5,
    points_reward: 50
  },
  {
    id: 'mining-10',
    title: 'Mining Enthusiast',
    description: '10 Mining-Sessions gestartet',
    category: 'mining',
    icon: 'pick',
    difficulty: 'medium',
    requirements: { type: 'mining_sessions', value: 10 },
    tokenReward: 10,
    pointsReward: 100,
    token_reward: 10,
    points_reward: 100
  },
  {
    id: 'mining-100',
    title: 'Mining Master',
    description: '100 Mining-Sessions gestartet',
    category: 'mining',
    icon: 'pick',
    difficulty: 'hard',
    requirements: { type: 'mining_sessions', value: 100 },
    tokenReward: 50,
    pointsReward: 500,
    token_reward: 50,
    points_reward: 500
  },
  {
    id: 'social-1',
    title: 'Social Starter',
    description: 'Erste soziale Interaktion',
    category: 'social',
    icon: 'chat',
    difficulty: 'easy',
    requirements: { type: 'social_interactions', value: 1 },
    tokenReward: 2,
    pointsReward: 20,
    token_reward: 2,
    points_reward: 20
  },
  {
    id: 'social-10',
    title: 'Social Butterfly',
    description: '10 soziale Interaktionen',
    category: 'social',
    icon: 'chat',
    difficulty: 'medium',
    requirements: { type: 'social_interactions', value: 10 },
    tokenReward: 10,
    pointsReward: 100,
    token_reward: 10,
    points_reward: 100
  },
  {
    id: 'token-1',
    title: 'Token Explorer',
    description: 'Erkunde deinen ersten Token',
    category: 'token',
    icon: 'coin',
    difficulty: 'medium',
    requirements: { type: 'token_views', value: 1 },
    tokenReward: 5,
    pointsReward: 50,
    token_reward: 5,
    points_reward: 50
  },
  {
    id: 'token-creator',
    title: 'Token Creator',
    description: 'Erstelle deinen ersten Token',
    category: 'token',
    icon: 'coin',
    difficulty: 'hard',
    requirements: { type: 'create_token', value: 1 },
    tokenReward: 50,
    pointsReward: 500,
    token_reward: 50,
    points_reward: 500
  },
  {
    id: 'streak-7',
    title: 'Consistent Miner',
    description: '7 Tage Mining-Streak',
    category: 'system',
    icon: 'award',
    difficulty: 'hard',
    requirements: { type: 'streak_days', value: 7 },
    tokenReward: 25,
    pointsReward: 250,
    token_reward: 25,
    points_reward: 250
  }
];

export default ACHIEVEMENTS;
