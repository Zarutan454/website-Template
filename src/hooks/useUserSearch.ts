import { useState, useCallback } from 'react';
// import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SearchUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
}

export const useUserSearch = () => {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Suche nach Benutzernamen oder Anzeigenamen
      // const { data, error } = await supabase
      //   .from('user_search')
      //   .select('*')
      //   .or(`username.ilike.%${query}%, display_name.ilike.%${query}%`)
      //   .limit(limit);
      
      // if (error) throw error;
      
      setUsers([]);
    } catch (err: unknown) {
      setError('Suche ist fehlgeschlagen. Bitte versuche es später erneut.');
      toast.error('Suche ist fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verwandte Benutzer finden (für Vorschläge)
  const findRelatedUsers = useCallback(async (userId: string, limit: number = 5) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Finde Nutzer, denen der angegebene Nutzer folgt
      // const { data, error } = await supabase
      //   .from('follows')
      //   .select(`
      //     following_id,
      //     following:following_id (
      //       id,
      //       username,
      //       display_name,
      //       avatar_url,
      //       bio,
      //       followers_count
      //     )
      //   `)
      //   .eq('follower_id', userId)
      //   .limit(limit);
      
      // if (error) throw error;
      
      // if (!data) return [];
      
      // Map the data to our SearchUser interface
      const relatedUsers: SearchUser[] = [];
      
      return relatedUsers;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Fehler beim Finden verwandter Benutzer:', err.message);
      } else {
        console.error('Fehler beim Finden verwandter Benutzer:', err);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Finde Benutzer, die einem bestimmten Benutzer folgen
  const findFollowers = useCallback(async (userId: string, limit: number = 5) => {
    setIsLoading(true);
    
    try {
      // const { data, error } = await supabase
      //   .from('follows')
      //   .select(`
      //     follower_id,
      //     follower:follower_id (
      //       id,
      //       username,
      //       display_name,
      //       avatar_url,
      //       bio,
      //       followers_count
      //     )
      //   `)
      //   .eq('following_id', userId)
      //   .limit(limit);
      
      // if (error) throw error;
      
      // if (!data) return [];
      
      // Map the data to SearchUser interface
      const followers: SearchUser[] = [];
      
      return followers;
    } catch (err) {
      console.error('Fehler beim Abrufen der Follower:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    searchUsers,
    findRelatedUsers,
    findFollowers
  };
};
