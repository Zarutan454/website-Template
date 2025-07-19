
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMining } from '@/hooks/useMining';
import { ActivityType } from '@/hooks/mining/types';

/**
 * Hook to track and update achievement progress
 */
export const useAchievementProgress = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { miningStats, recordActivity } = useMining();
  
  /**
   * Updates the progress of an achievement for the current user
   */
  const updateAchievementProgress = useCallback(async (
    userId: string,
    achievementId: string,
    progressIncrement: number
  ) => {
    if (!userId || !achievementId) return null;
    
    try {
      setIsUpdating(true);
      
      // First, get the achievement details to check requirements
      // TODO: Django-API-Migration: useAchievementProgress auf Django-API umstellen
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .maybeSingle(); // Changed from .single() to .maybeSingle() to fix 406 error
      
      if (achievementError) throw achievementError;
      
      if (!achievement) {
        return null;
      }
      
      // Then, get or create the user achievement record
      // TODO: Django-API-Migration: useAchievementProgress auf Django-API umstellen
      const { data: userAchievement, error: userAchievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (userAchievementError && userAchievementError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine - we'll create one
        throw userAchievementError;
      }
      
      let result;
      
      if (!userAchievement) {
        // Create new user achievement record
        result = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievementId,
            progress: progressIncrement,
            completed: progressIncrement >= achievement.required_value
          })
          .select()
          .maybeSingle(); // Changed from .single() to .maybeSingle()
      } else {
        // Don't update if already completed
        if (userAchievement.completed) {
          return userAchievement;
        }
        
        // Update existing record
        const newProgress = Math.min(
          (userAchievement.progress || 0) + progressIncrement,
          achievement.required_value
        );
        
        const wasCompleted = userAchievement.completed;
        const isNowCompleted = newProgress >= achievement.required_value;
        
        result = await supabase
          .from('user_achievements')
          .update({
            progress: newProgress,
            completed: isNowCompleted,
            completed_at: isNowCompleted && !wasCompleted ? new Date().toISOString() : userAchievement.completed_at
          })
          .eq('id', userAchievement.id)
          .select()
          .maybeSingle(); // Changed from .single() to .maybeSingle()
          
        // If newly completed, award tokens and points
        if (isNowCompleted && !wasCompleted) {
          // Show toast notification
          toast.success(`🏆 Achievement Unlocked: ${achievement.title}`);
          
          // Award tokens and points if mining is active
          if (miningStats?.is_mining) {
            // Use proper type assertion for achievement_unlocked activity type
            await recordActivity('achievement_unlocked' as ActivityType, 
              achievement.points_reward || 50,
              achievement.token_reward || 5
            );
            
            toast.info(`🪙 Belohnung: +${achievement.token_reward || 5} BSN`);
          }
        }
      }
      
      if (result.error) throw result.error;
      
      return result.data;
    } catch (error: Error | unknown) {
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [miningStats, recordActivity]);
  
  /**
   * Check if the user has completed a specific achievement
   */
  const hasCompletedAchievement = useCallback(async (
    userId: string,
    achievementId: string
  ): Promise<boolean> => {
    if (!userId || !achievementId) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('completed')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No record found
          return false;
        }
        throw error;
      }
      
      return data?.completed || false;
    } catch (error) {
      return false;
    }
  }, []);
  
  /**
   * Track social activity for achievement progress
   */
  const trackSocialActivity = useCallback(async (
    userId: string,
    activityType: 'post' | 'comment' | 'like' | 'share'
  ) => {
    if (!userId) return;
    
    try {
      // Map activity types to their corresponding achievement IDs
      const achievementMap = {
        post: 'social-poster',
        comment: 'social-commenter',
        like: 'social-liker',
        share: 'social-sharer'
      };
      
      const achievementId = achievementMap[activityType];
      if (achievementId) {
        await updateAchievementProgress(userId, achievementId, 1);
      }
    } catch (error) {
    }
  }, [updateAchievementProgress]);
  
  return {
    updateAchievementProgress,
    hasCompletedAchievement,
    trackSocialActivity,
    isUpdating
  };
};
