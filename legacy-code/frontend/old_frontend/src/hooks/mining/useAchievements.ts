
import { useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Achievement, UserAchievement } from './achievements/types';
import { MiningStats } from './types';
import { checkAchievements } from './achievements/achievementChecker';
import ACHIEVEMENTS from './achievements/achievementList';

export function useAchievements(miningStats: MiningStats) {
  const { profile } = useProfile();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load achievements and user achievements data
  useEffect(() => {
    if (!profile?.id) return;
    
    const loadAchievements = async () => {
      setIsLoading(true);
      try {
        // Load achievement definitions
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*');
        
        if (achievementsError) {
          // Fallback to local achievement list if DB fetch fails
          setAchievements(ACHIEVEMENTS || []);
        } else if (achievementsData && achievementsData.length > 0) {
          // Transform achievement data to match our interface
          const transformedAchievements = achievementsData.map(achievement => ({
            ...achievement,
            tokenReward: achievement.token_reward,
            pointsReward: achievement.points_reward || 0
          }));
          
          setAchievements(transformedAchievements);
        } else {
          // If no achievements in DB, use the local list
          setAchievements(ACHIEVEMENTS || []);
        }
        
        // Load user achievements
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', profile.id);
        
        if (userAchievementsError) {
          console.error('Error loading user achievements:', userAchievementsError);
          return;
        }
        
        // Transform user achievement data to include both naming conventions
        const transformedUserAchievements = userAchievementsData.map(ua => ({
          ...ua,
          userId: ua.user_id,
          achievementId: ua.achievement_id,
          completedAt: ua.completed_at,
          createdAt: ua.created_at,
          updatedAt: ua.updated_at,
          achievement: ua.achievements
        }));
        
        setUserAchievements(transformedUserAchievements || []);
      } catch (error) {
        console.error('Error in loadAchievements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAchievements();
  }, [profile?.id]);

  // Check for newly completed achievements
  const checkForNewAchievements = useCallback(async () => {
    if (!profile?.id || isChecking || !miningStats || achievements.length === 0) return;
    
    setIsChecking(true);
    try {
      // Check which achievements are completed
      const achievementChecks = checkAchievements(miningStats, achievements, userAchievements);
      
      // Find newly completed achievements
      const newlyCompleted = achievementChecks.filter(
        check => check.achieved && !userAchievements.some(
          ua => (ua.achievement_id === check.achievementId || ua.achievementId === check.achievementId) && ua.completed
        )
      );
      
      if (newlyCompleted.length > 0) {
        console.log('New achievements completed:', newlyCompleted);
        
        // For each newly completed achievement
        for (const achievement of newlyCompleted) {
          // Find achievement details
          const achievementDetails = achievements.find(a => a.id === achievement.achievementId);
          
          if (!achievementDetails) continue;
          
          // Update user achievement in database
          const { error } = await supabase
            .from('user_achievements')
            .upsert({
              user_id: profile.id,
              achievement_id: achievement.achievementId,
              progress: achievement.progress,
              completed: true,
              completed_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('Error updating achievement:', error);
            continue;
          }
          
          // Show toast notification
          toast.success(`Neuer Erfolg freigeschaltet: ${achievementDetails.title}`, {
            description: `+${achievementDetails.token_reward || achievementDetails.tokenReward} BSN, ${achievementDetails.description}`,
            duration: 5000
          });
          
          // Update state with normalized properties
          const newAchievement: UserAchievement = {
            id: achievement.achievementId,
            user_id: profile.id,
            userId: profile.id,
            achievement_id: achievement.achievementId,
            achievementId: achievement.achievementId,
            progress: achievement.progress,
            completed: true,
            completed_at: new Date(),
            completedAt: new Date(),
            created_at: new Date(),
            createdAt: new Date(),
            updated_at: new Date(),
            updatedAt: new Date(),
            achievement: achievementDetails
          };
          
          setUserAchievements(prev => [
            ...prev.filter(ua => 
              ua.achievement_id !== achievement.achievementId && 
              ua.achievementId !== achievement.achievementId
            ),
            newAchievement
          ]);
        }
      } else {
        // Update progress for in-progress achievements
        const progressUpdates = achievementChecks.filter(
          check => !check.achieved && check.progress > 0
        );
        
        if (progressUpdates.length > 0) {
          for (const update of progressUpdates) {
            const existingAchievement = userAchievements.find(
              ua => (ua.achievement_id === update.achievementId || ua.achievementId === update.achievementId)
            );
            
            // Only update if progress has increased
            if (!existingAchievement || existingAchievement.progress < update.progress) {
              // Update in database
              await supabase
                .from('user_achievements')
                .upsert({
                  user_id: profile.id,
                  achievement_id: update.achievementId,
                  progress: update.progress,
                  completed: false
                });
              
              // Update state
              if (existingAchievement) {
                setUserAchievements(prev => prev.map(ua => 
                  (ua.achievement_id === update.achievementId || ua.achievementId === update.achievementId)
                    ? { ...ua, progress: update.progress }
                    : ua
                ));
              } else {
                // Create new user achievement for tracking progress
                const achievementDetails = achievements.find(a => a.id === update.achievementId);
                if (achievementDetails) {
                  const newProgress: UserAchievement = {
                    id: crypto.randomUUID(),
                    user_id: profile.id,
                    userId: profile.id,
                    achievement_id: update.achievementId,
                    achievementId: update.achievementId,
                    progress: update.progress,
                    completed: false,
                    created_at: new Date(),
                    createdAt: new Date(),
                    updated_at: new Date(),
                    updatedAt: new Date(),
                    achievement: achievementDetails
                  };
                  
                  setUserAchievements(prev => [...prev, newProgress]);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setIsChecking(false);
    }
  }, [profile?.id, isChecking, miningStats, achievements, userAchievements]);

  // Sync user achievements with the database
  const syncAchievements = useCallback(async () => {
    if (!profile?.id || isSyncing) return;
    
    setIsSyncing(true);
    try {
      // For each achievement, ensure there's an entry in user_achievements
      for (const achievement of achievements) {
        const existingUserAchievement = userAchievements.find(ua => 
          ua.achievement_id === achievement.id || ua.achievementId === achievement.id
        );
        
        if (!existingUserAchievement) {
          // Create initial progress tracker for this achievement
          await supabase
            .from('user_achievements')
            .upsert({
              user_id: profile.id,
              achievement_id: achievement.id,
              progress: 0,
              completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
      }
      
      // Reload user achievements after sync
      const { data: refreshedData } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', profile.id);
      
      if (refreshedData) {
        const transformedData = refreshedData.map(ua => ({
          ...ua,
          userId: ua.user_id,
          achievementId: ua.achievement_id,
          completedAt: ua.completed_at,
          createdAt: ua.created_at,
          updatedAt: ua.updated_at,
          achievement: ua.achievements
        }));
        
        setUserAchievements(transformedData);
      }
    } catch (error) {
      console.error('Error syncing achievements:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [profile?.id, achievements, userAchievements, isSyncing]);

  // Check for new achievements when mining stats change
  useEffect(() => {
    if (miningStats && achievements.length > 0) {
      checkForNewAchievements();
    }
  }, [miningStats, achievements, checkForNewAchievements]);

  // Sync achievements when component loads
  useEffect(() => {
    if (profile?.id && achievements.length > 0 && !isLoading) {
      syncAchievements();
    }
  }, [profile?.id, achievements.length, isLoading, syncAchievements]);

  return {
    achievements,
    userAchievements,
    isLoading,
    isChecking,
    isSyncing,
    checkForNewAchievements,
    syncAchievements,
    achievementCounts: {
      total: achievements.length,
      completed: userAchievements.filter(ua => ua.completed).length,
      inProgress: userAchievements.filter(ua => !ua.completed && ua.progress > 0).length
    }
  };
}
