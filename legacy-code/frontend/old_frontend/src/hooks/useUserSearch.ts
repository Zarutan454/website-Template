
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
      const { data, error } = await supabase
        .from('user_search')
        .select('*')
        .or(`username.ilike.%${query}%, display_name.ilike.%${query}%`)
        .limit(limit);
      
      if (error) throw error;
      
      setUsers(data as SearchUser[] || []);
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
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          following:following_id (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            followers_count
          )
        `)
        .eq('follower_id', userId)
        .limit(limit);
      
      if (error) throw error;
      
      if (!data) return [];
      
      // Map the data to our SearchUser interface
      const relatedUsers: SearchUser[] = data
        .filter(item => item.following)
        .map(item => {
          const following = item.following as any;
          return {
            id: following.id,
            username: following.username,
            display_name: following.display_name,
            avatar_url: following.avatar_url,
            bio: following.bio,
            followers_count: following.followers_count
          };
        });
      
      return relatedUsers;
    } catch (err: any) {
      console.error('Fehler beim Finden verwandter Benutzer:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Finde Benutzer, die einem bestimmten Benutzer folgen
  const findFollowers = useCallback(async (userId: string, limit: number = 5) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          follower:follower_id (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            followers_count
          )
        `)
        .eq('following_id', userId)
        .limit(limit);
      
      if (error) throw error;
      
      if (!data) return [];
      
      // Map the data to SearchUser interface
      const followers: SearchUser[] = data
        .filter(item => item.follower)
        .map(item => {
          const follower = item.follower as any;
          return {
            id: follower.id,
            username: follower.username,
            display_name: follower.display_name,
            avatar_url: follower.avatar_url,
            bio: follower.bio,
            followers_count: follower.followers_count
          };
        });
      
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
