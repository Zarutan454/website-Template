import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/django-api-new';
import type { UserProfile } from '@/lib/django-api-new';

// Simple in-memory cache for profile data
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProfile = (username?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (forceRefresh = false) => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = profileCache.get(username);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProfile(cached.data);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await userAPI.getProfileByUsername(username);
      
      // Cache the result
      profileCache.set(username, {
        data: profileData,
        timestamp: Date.now()
      });
      
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden des Profils';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate function to fetch profile by username (for use in components)
  const fetchProfileByUsername = async (targetUsername: string): Promise<UserProfile> => {
    // Check cache first
    const cached = profileCache.get(targetUsername);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const profileData = await userAPI.getProfileByUsername(targetUsername);
      
      // Cache the result
      profileCache.set(targetUsername, {
        data: profileData,
        timestamp: Date.now()
      });
      
      return profileData;
    } catch (err) {
      console.error('Error fetching profile by username:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  return {
    profile,
    isLoading,
    error,
    refreshProfile: () => fetchProfile(true),
    fetchProfileByUsername
  };
}; 
