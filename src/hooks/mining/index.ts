import { 
  MiningStats, 
  MiningActivity, 
  MINING_LIMITS,
  ActivityLimit,
  ActivityResult,
  isActivityResult,
  isActivityLimit,
  ActivityType,
  normalizeMiningStats,
  formatDateForDatabase,
  calculateEfficiencyMultiplier,
  normalizeActivity,
  transformMiningActivity,
  transformMiningActivities,
  normalizeActivityType
} from './types';

// Import utility functions from utils.ts
import {
  formatDate,
  formatDuration,
  formatNumber,
  calculateEstimatedEarnings,
  isActivityLimitReached,
  getRemainingCount,
  formatTokenAmount
} from './utils';

import MiningRepository from '@/repositories/MiningRepository';

// Export the centralized mining service hook
export { useMiningService } from './useMiningService';

// Export types and helper functions for other components
export type { 
  MiningStats, 
  MiningActivity, 
  ActivityLimit, 
  ActivityResult, 
  ActivityType 
};

export { 
  MINING_LIMITS, 
  isActivityResult, 
  isActivityLimit,
  // Export utility functions from types
  normalizeMiningStats,
  formatDateForDatabase,
  calculateEfficiencyMultiplier,
  normalizeActivity,
  transformMiningActivity,
  transformMiningActivities,
  normalizeActivityType,
  // Export utility functions from utils
  formatDate,
  formatDuration,
  formatNumber,
  calculateEstimatedEarnings,
  isActivityLimitReached,
  getRemainingCount,
  formatTokenAmount
};
