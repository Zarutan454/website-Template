
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface FollowStats {
  followers_count: number;
  following_count: number;
}

export interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

export const useFollowSystem = () => {
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followers_count: 0,
    following_count: 0
  });

  // Prüfen, ob der aktuelle Benutzer einem anderen Benutzer folgt
  const isFollowing = useCallback(async (userId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', profile.id)
        .eq('following_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      return false;
    }
  }, [profile?.id]);

  // Einem Benutzer folgen
  const followUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!profile?.id) {
      toast.error('Du musst angemeldet sein, um einem Benutzer zu folgen.');
      return false;
    }
    
    // Verhindere, dass Benutzer sich selbst folgen können
    if (profile.id === userId) {
      toast.error('Du kannst dir nicht selbst folgen.');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Prüfen, ob bereits gefolgt wird
      const alreadyFollowing = await isFollowing(userId);
      if (alreadyFollowing) {
        toast.info('Du folgst diesem Benutzer bereits.');
        return true;
      }
      
      // Folgen-Eintrag erstellen
      const { error } = await supabase
        .from('follows')
        .upsert([
          { follower_id: profile.id, following_id: userId }
        ], {
          onConflict: 'follower_id,following_id',
          ignoreDuplicates: true
        });
      
      if (error) {
        // Überprüfen ob es sich um einen Constraint-Fehler handelt
        if (error.message.includes('check_self_follow')) {
          toast.error('Du kannst dir nicht selbst folgen.');
          return false;
        }
        
        if (error.message.includes('unique constraint')) {
          toast.info('Du folgst diesem Benutzer bereits.');
          return true;
        }
        
        throw error;
      }
      
      // Aktualisiere den follows_count für beide Benutzer
      await updateFollowerCount(userId, 1);
      
      // Benachrichtigung für den Benutzer erstellen, dem gefolgt wurde
      await createFollowNotification(userId);
      
      toast.success('Du folgst diesem Benutzer jetzt.');
      return true;
    } catch (error: Error | unknown) {
      toast.error('Fehler beim Folgen des Benutzers.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isFollowing]);

  // Benachrichtigung für neuen Follower erstellen
  const createFollowNotification = async (targetUserId: string) => {
    if (!profile?.id) return;
    
    try {
      
      // Füge die Benachrichtigung in die notifications-Tabelle ein
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: targetUserId,
            type: 'follow',
            content: 'folgt dir jetzt',
            actor_id: profile.id,
            read: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
      } else {
      }
    } catch (error) {
    }
  };

  // Einem Benutzer entfolgen
  const unfollowUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!profile?.id) {
      toast.error('Du musst angemeldet sein, um einem Benutzer zu entfolgen.');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Prüfen, ob tatsächlich gefolgt wird
      const following = await isFollowing(userId);
      if (!following) {
        toast.info('Du folgst diesem Benutzer nicht.');
        return true;
      }
      
      // Folgen-Eintrag entfernen
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', profile.id)
        .eq('following_id', userId);
      
      if (error) throw error;
      
      // Aktualisiere den follows_count für beide Benutzer
      await updateFollowerCount(userId, -1);
      
      toast.success('Du folgst diesem Benutzer nicht mehr.');
      return true;
    } catch (error: any) {
      toast.error('Fehler beim Entfolgen des Benutzers.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isFollowing]);

  // Anzahl der Follower aktualisieren
  const updateFollowerCount = async (userId: string, change: number) => {
    if (!profile?.id) return;
    
    try {
      // Target user follower count aktualisieren
      await supabase.rpc('update_follower_count', {
        target_user_id: userId,
        count_change: change
      });
      
      // Current user following count aktualisieren
      await supabase.rpc('update_following_count', {
        user_id: profile.id,
        count_change: change
      });
    } catch (error) {
    }
  };

  // Follower-Statistiken abrufen
  const getFollowStats = useCallback(async (userId: string): Promise<FollowStats> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('followers_count, following_count')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return {
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0
      };
    } catch (error) {
      return { followers_count: 0, following_count: 0 };
    }
  }, []);

  // Follower eines Benutzers abrufen
  const getFollowers = useCallback(async (userId: string, limit = 10): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          users!follower_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Fix TypeScript error by mapping with explicit typing
      const followers: User[] = data.map((item: any) => ({
        id: item.users.id,
        username: item.users.username,
        display_name: item.users.display_name,
        avatar_url: item.users.avatar_url,
        bio: item.users.bio
      }));
      
      return followers;
    } catch (error) {
      return [];
    }
  }, []);

  // Following eines Benutzers abrufen
  const getFollowing = useCallback(async (userId: string, limit = 10): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          users!following_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Fix TypeScript error by mapping with explicit typing
      const following: User[] = data.map((item: any) => ({
        id: item.users.id,
        username: item.users.username,
        display_name: item.users.display_name,
        avatar_url: item.users.avatar_url,
        bio: item.users.bio
      }));
      
      return following;
    } catch (error) {
      return [];
    }
  }, []);

  return {
    isLoading,
    followStats,
    isFollowing,
    followUser,
    unfollowUser,
    getFollowStats,
    getFollowers,
    getFollowing
  };
};
