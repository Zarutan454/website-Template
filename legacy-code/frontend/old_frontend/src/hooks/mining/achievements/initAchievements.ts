
import { supabase } from '@/lib/supabase';
import ACHIEVEMENTS from './achievementList';

/**
 * Function to initialize achievements in the database from the local achievements list
 */
export async function initializeAchievements() {
  try {
    // Check if achievements table already has data
    const { data: existingAchievements, error: checkError } = await supabase
      .from('achievements')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking achievements table:', checkError);
      return { success: false, error: checkError };
    }
    
    // If achievements already exist, don't reinitialize
    if (existingAchievements && existingAchievements.length > 0) {
      console.log('Achievements already initialized');
      return { success: true, message: 'Achievements already initialized' };
    }
    
    // Prepare achievements for insertion, ensuring they have the right format
    const achievementsToInsert = ACHIEVEMENTS.map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      icon: achievement.icon || 'award',
      difficulty: achievement.difficulty,
      token_reward: achievement.tokenReward || achievement.token_reward,
      points_reward: achievement.pointsReward || achievement.points_reward,
      required_value: achievement.requirements.value,
      value_type: achievement.requirements.type
    }));
    
    // Insert achievements in batches to avoid request size limitations
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < achievementsToInsert.length; i += batchSize) {
      batches.push(achievementsToInsert.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const { error: insertError } = await supabase
        .from('achievements')
        .upsert(batch, { onConflict: 'id' });
        
      if (insertError) {
        console.error('Error inserting achievement batch:', insertError);
        return { success: false, error: insertError };
      }
    }
    
    console.log(`Successfully initialized ${achievementsToInsert.length} achievements`);
    return { 
      success: true, 
      count: achievementsToInsert.length,
      message: `Successfully initialized ${achievementsToInsert.length} achievements` 
    };
  } catch (error) {
    console.error('Unexpected error initializing achievements:', error);
    return { success: false, error };
  }
}

// Add auto-initialization function to run when the file is imported
export function autoInitializeAchievements() {
  // Run initialization in the background
  initializeAchievements()
    .then(result => {
      if (result.success) {
        console.log('Achievements auto-initialization successful:', result.message);
      } else {
        console.error('Achievements auto-initialization failed:', result.error);
      }
    })
    .catch(error => {
      console.error('Unexpected error during achievements auto-initialization:', error);
    });
}

// Try to auto-initialize when imported
autoInitializeAchievements();
