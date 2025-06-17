
import { useCallback } from 'react';
import * as miningService from './miningService';
import { miningRepository } from '@/repositories/MiningRepository';
import { formatDateForDatabase } from './utils';
import { toast } from 'sonner';

/**
 * Hook for synchronizing mining state with the server
 * Improved error handling and logging
 */
export const useMiningSync = (userId: string | undefined, setIsMining: (mining: boolean) => void) => {
  // Sync mining state with server
  const syncMiningState = useCallback(async () => {
    if (!userId) {
      return false;
    }
    
    try {
      // Check actual mining status in database
      const serverMiningStatus = await miningRepository.checkMiningStatus(userId);
      
      // If there's a mismatch, update local state to match server
      if (serverMiningStatus !== undefined) {
        setIsMining(serverMiningStatus);
        
        // If we're not supposed to be mining but server thinks we are,
        // stop mining on server to ensure consistency
        if (!serverMiningStatus) {
          try {
            await miningService.stopMining(userId);
          } catch (stopError) {
            // Continue despite stop error - we've already updated local state
          }
        }
        
        return true;
      } else {
        // If server status is undefined, try to update with a default state (not mining)
        try {
          await miningService.stopMining(userId);
          setIsMining(false);
          return true;
        } catch (resetError) {
          return false;
        }
      }
    } catch (err) {
      // In case of error, let user know something went wrong
      toast.error('Fehler bei der Synchronisierung des Mining-Status');
      return false;
    }
  }, [userId, setIsMining]);
  
  return {
    syncMiningState
  };
};
