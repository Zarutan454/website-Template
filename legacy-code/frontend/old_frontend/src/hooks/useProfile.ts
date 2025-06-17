
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  username: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  website?: string;
  wallet_address?: string;
  created_at: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  mined_tokens?: number;
  following?: string[]; // Ensure following is explicitly defined as an optional string array
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Aktuelle Benutzersitzung abrufen
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        setProfile(null);
        setIsLoading(false);
        return null;
      }

      const userId = sessionData.session.user.id;

      // Profil aus der Datenbank abrufen
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('Profil nicht gefunden, erstelle ein neues Profil');
          
          const userData = sessionData.session.user;
          const username = userData.user_metadata?.username || userData.email?.split('@')[0] || 'user_' + Math.floor(Math.random() * 1000);
          
          // Neues Profil erstellen
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                username: username,
                display_name: username,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select('*')
            .single();
          
          if (createError) {
            console.error('Fehler beim Erstellen des Profils:', createError);
            throw createError;
          }
          
          console.log('Neues Profil erstellt:', newProfile);
          setProfile(newProfile);
        } else {
          console.error('Fehler beim Abrufen des Profils:', profileError);
          throw profileError;
        }
      } else {
        console.log('Profil gefunden:', profileData);
        setProfile(profileData);
      }
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      if (err instanceof Error) {
        setError(err);
        
        // Nur Toast anzeigen, wenn es ein tatsächlicher Fehler ist (nicht wenn kein Profil gefunden wurde)
        if ('code' in err && err.code !== 'PGRST116') {
          toast.error('Fehler beim Laden deines Profils.');
        }
      } else {
        setError(new Error('Unbekannter Fehler beim Laden des Profils'));
        toast.error('Fehler beim Laden deines Profils.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isUserBlocked = useCallback(async (targetUserId: string): Promise<boolean> => {
    try {
      if (!profile?.id) return false;
      
      const { data, error } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('user_id', profile.id)
        .eq('related_user_id', targetUserId)
        .eq('relationship_type', 'blocked')
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (err) {
      console.error('Fehler beim Prüfen des Block-Status:', err);
      return false;
    }
  }, [profile]);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      
      // Prüfen, ob der Benutzer blockiert ist
      if (data && profile?.id && data.id !== profile.id) {
        const blocked = await isUserBlocked(data.id);
        if (blocked) {
          // Wenn blockiert, geben wir trotzdem das Profil zurück, aber wir können in der UI entscheiden,
          // bestimmte Inhalte nicht anzuzeigen
          data.is_blocked = true;
        }
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching profile by username:', err);
      return null;
    }
  }, [profile, isUserBlocked]);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!profile?.id) {
        throw new Error('Kein aktives Profil gefunden');
      }

      console.log('Updating profile with:', updates);

      // Wenn ein cover_url Update dabei ist, stellen wir sicher, dass Cache-Parameter entfernt werden
      let cleanUpdates = { ...updates };
      if (updates.cover_url && updates.cover_url.includes('?')) {
        cleanUpdates.cover_url = updates.cover_url.split('?')[0];
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error in updateProfile:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      toast.success('Profil aktualisiert');
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error('Fehler beim Aktualisieren des Profils.');
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // Nur einen Auth-Listener erstellen, der existiert solange die Komponente gemountet ist
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change in useProfile:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in, fetching profile');
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing profile');
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
    fetchProfileByUsername,
    isUserBlocked,
    isAuthenticated: !!profile
  };
};
