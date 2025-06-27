import { MiningStatus, type UserProfile } from '../lib/django-api-new';
import djangoApi from '../lib/django-api-new';

/**
 * Mining Repository - Migriert von Supabase zu Django API
 * 
 * ALT (Supabase):
 * const { data, error } = await supabase
 *   .from('mining_progress')
 *   .select('*')
 *   .eq('user_id', userId)
 *   .single();
 * 
 * NEU (Django):
 * const response = await miningAPI.getStatus();
 */
class MiningRepository {
  
  /**
   * Get current mining status
   */
  async getMiningStatus(): Promise<MiningStatus | null> {
    try {
      const response = await djangoApi.getMiningStats();
      return response as MiningStatus;
    } catch (error) {
      console.error('Error fetching mining status:', error);
      return null;
    }
  }

  /**
   * Start mining session
   */
  async startMining(): Promise<boolean> {
    try {
      const response = await djangoApi.startMining();
      return response !== null;
    } catch (error) {
      console.error('Error starting mining:', error);
      return false;
    }
  }

  /**
   * Stop mining session
   */
  async stopMining(): Promise<boolean> {
    try {
      const response = await djangoApi.stopMining();
      return response !== null;
    } catch (error) {
      console.error('Error stopping mining:', error);
      return false;
    }
  }

  /**
   * Claim mining rewards
   */
  async claimRewards(): Promise<{ success: boolean; tokensClaimed?: number; message?: string }> {
    try {
      const response = await djangoApi.claimTokens();
      if (response && response.success) {
        return {
          success: true,
          tokensClaimed: response.amount,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Failed to claim rewards'
        };
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return {
        success: false,
        message: 'Error claiming rewards'
      };
    }
  }

  /**
   * Get mining statistics
   */
  async getMiningStats(userId?: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await djangoApi.getMiningStats();
      return response as Record<string, unknown>;
    } catch (error) {
      console.error('Error fetching mining stats:', error);
      return null;
    }
  }

  /**
   * Update mining heartbeat
   */
  async updateHeartbeat(): Promise<boolean> {
    try {
      const response = await djangoApi.updateHeartbeat();
      return response !== null;
    } catch (error) {
      console.error('Error updating heartbeat:', error);
      return false;
    }
  }

  /**
   * Create mining boost
   */
  async createBoost(boostType: string, multiplier?: number): Promise<boolean> {
    try {
      const response = await djangoApi.createBoost(boostType, multiplier);
      return response !== null;
    } catch (error) {
      console.error('Error creating boost:', error);
      return false;
    }
  }

  /**
   * Get mining leaderboard
   */
  async getLeaderboard(): Promise<UserProfile[] | null> {
    try {
      const response = await djangoApi.getMiningLeaderboard();
      return response as UserProfile[];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return null;
    }
  }

  /**
   * Record activity for mining boost
   */
  async recordActivity(activityType: string, points: number, boost: number): Promise<boolean> {
    try {
      // Create a boost based on activity type
      const boostType = activityType.toLowerCase();
      const response = await djangoApi.createBoost(boostType, boost);
      return response !== null;
    } catch (error) {
      console.error('Error recording activity:', error);
      return false;
    }
  }

  /**
   * Get mining progress for a specific user (admin function)
   */
  async getUserMiningProgress(userId: string): Promise<MiningStatus | null> {
    try {
      // This would be a custom endpoint in Django
      const response = await fetch(`/api/mining/user/${userId}/status/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user mining progress:', error);
      return null;
    }
  }

  /**
   * Update mining power for a user (admin function)
   */
  async updateMiningPower(userId: string, newPower: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/mining/user/${userId}/power/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mining_power: newPower }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error updating mining power:', error);
      return false;
    }
  }

  /**
   * Get daily mining statistics
   */
  async getDailyStats(): Promise<{
    total_miners: number;
    total_tokens_mined: string;
    average_mining_rate: number;
    top_miners: Record<string, unknown>[];
  } | null> {
    try {
      const response = await fetch('/api/mining/daily-stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return null;
    }
  }

  /**
   * Reset mining progress for a user (admin function)
   */
  async resetMiningProgress(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/mining/user/${userId}/reset/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error resetting mining progress:', error);
      return false;
    }
  }

  /**
   * Get mining activities for a user
   */
  async getMiningActivities(userId: string, limit: number = 20): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`/api/mining/user/${userId}/activities/?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching mining activities:', error);
      return [];
    }
  }

  /**
   * Check mining status for a user
   */
  async checkMiningStatus(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/mining/user/${userId}/status/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.is_mining || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking mining status:', error);
      return false;
    }
  }
}

// Create and export instance
const miningRepository = new MiningRepository();
export default miningRepository;
