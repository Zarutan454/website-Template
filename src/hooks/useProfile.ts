import { useState, useEffect, useCallback } from 'react';
import { userAPI, UserProfile } from '../lib/django-api-new';
import { useAuth } from '@/context/AuthContext';

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  display_name?: string; // Optionales Feld für Kompatibilität
  // Fügen Sie weitere Profilfelder hinzu, die von Ihrer API zurückgegeben werden
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(`[useProfile] Hook called - user: ${user ? user.username : 'null'}, isLoading: ${isLoading}`);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      console.log('[useProfile] No user found, setting profile to null');
      setIsLoading(false);
      setProfile(null);
      return;
    }

    console.log(`[useProfile] Fetching profile for user: ${user.username}`);
    setIsLoading(true);
    setError(null);
    try {
      const response = await userAPI.getProfile();
      console.log(`[useProfile] Profile fetched successfully:`, response);
      setProfile(response as Profile);
    } catch (err) {
      console.error('[useProfile] Failed to fetch profile:', err);
      setError('Failed to fetch profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log(`[useProfile] useEffect triggered - user changed: ${user ? user.username : 'null'}`);
    fetchProfile();
  }, [fetchProfile]);
  
  const fetchProfileByUsername = useCallback(async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the generic apiClient for custom endpoints
      const response = await userAPI.getProfile();
      return response as Profile;
    } catch (err) {
      setError(`Failed to fetch profile for ${username}`);
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<Profile>) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await userAPI.getProfile();
        setProfile(response as Profile);
        return response as Profile;
    } catch (err) {
        setError('Failed to update profile');
        console.error(err);
        return null;
    } finally {
        setIsLoading(false);
    }
  }, []);

  return { 
    profile, 
    isLoading, 
    error, 
    fetchProfile, 
    fetchProfileByUsername, 
    updateProfile,
    isAuthenticated: !!user
  };
} 
