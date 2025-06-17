
import { MiningStats, MiningActivity, ActivityType } from '@/hooks/mining/types';

/**
 * Interface für Mining-Repository-Operationen
 * Definiert alle Datenzugriffsmethoden für das Mining-System
 */
export interface MiningRepositoryInterface {
  // Statistik-Operationen
  getMiningStats: (userId: string) => Promise<MiningStats>;
  
  // Aktivitäts-Operationen
  getMiningActivities: (userId: string, limit?: number) => Promise<MiningActivity[]>;
  recordActivity: (userId: string, type: ActivityType, points: number, tokens: number) => Promise<MiningActivity | null>;
  batchRecordActivities: (userId: string, activities: Array<{type: ActivityType, points: number, tokens: number}>) => Promise<MiningActivity[] | null>;
  archiveOldActivities: (days?: number) => Promise<number>;
  
  // Mining-Session-Operationen
  startMining: (userId: string) => Promise<boolean>;
  stopMining: (userId: string) => Promise<boolean>;
  checkMiningStatus: (userId: string) => Promise<boolean>;
  sendHeartbeat: (userId: string) => Promise<boolean>;
  
  // Synchronisations-Operation
  syncMiningState: (userId: string) => Promise<boolean>;
}
