
import { useEffect, useState } from 'react';
import { initializeAchievements } from './achievements/initAchievements';
import { useProfile } from '../useProfile';

/**
 * Hook to initialize achievements when a user is authenticated
 */
export const useInitializeAchievements = () => {
  const { profile, isAuthenticated } = useProfile();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only try to initialize achievements once when a user is authenticated
    if (isAuthenticated && !isInitialized && !isInitializing) {
      setIsInitializing(true);
      
      initializeAchievements()
        .then(result => {
          setIsInitialized(result.success);
          
          if (!result.success && result.error) {
            setError(new Error(String(result.error)));
          }
        })
        .catch(err => {
          setError(err instanceof Error ? err : new Error(String(err)));
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [isAuthenticated, isInitialized, isInitializing]);

  return { isInitialized, isInitializing, error };
};
