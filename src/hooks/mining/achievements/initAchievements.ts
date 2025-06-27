import { miningAPI } from '@/lib/django-api-new';
import ACHIEVEMENTS from './achievementList';

/**
 * Function to initialize achievements in the database from the local achievements list
 */
export async function initializeAchievements() {
  try {
    // Check if user is authenticated by trying to get auth token
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('User not authenticated, skipping achievement initialization');
      return { success: true, message: 'User not authenticated, skipping initialization' };
    }

    // Check if achievements already exist by trying to fetch them
    const response = await miningAPI.getAchievements({ limit: 1 });
    
    // If we get a successful response, achievements are already available
    if (response.data && response.data.achievements && response.data.achievements.length > 0) {
      console.log('Achievements already available');
      return { success: true, message: 'Achievements already available' };
    }
    
    // Since Django calculates achievements dynamically, we don't need to insert them
    // The achievements will be available when the user performs actions
    console.log('Achievements will be calculated dynamically by Django');
    return { 
      success: true, 
      message: 'Achievements will be calculated dynamically by Django' 
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

// Don't auto-initialize on import - let the app handle it when user is authenticated
// autoInitializeAchievements();
