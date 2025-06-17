import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

/**
 * Interface for relationship users (followers, friends, etc.)
 */
export interface RelationshipUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

/**
 * Interface for Supabase relationship query responses with nested user data
 */
interface RelationshipQueryItem {
  related_user_id?: string;
  user_id?: string;
  users: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
}

/**
 * Hook to manage user relationship actions like following, blocking, and friendship
 */
export const useUserRelationships = () => {
  const { profile } = useProfile();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Check if the current user is following the target user
   */
  const isFollowing = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('user_id', profile.id)
        .eq('related_user_id', targetUserId)
        .eq('relationship_type', 'following')
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (err) {
      return false;
    }
  }, [profile]);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id || targetUserId === profile.id) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Check if already following
      const existingFollow = await isFollowing(targetUserId);
      
      if (existingFollow) {
        return true; // Already following
      }
      
      // Add the new relationship
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          user_id: profile.id,
          related_user_id: targetUserId,
          relationship_type: 'following'
        });
        
      if (error) throw error;
      
      // Update follower_count for the target user
      await supabase.rpc('update_follower_count', {
        target_user_id: targetUserId,
        count_change: 1
      });
      
      // Update following_count for the current user
      await supabase.rpc('update_following_count', {
        user_id: profile.id,
        count_change: 1
      });
      
      return true;
    } catch (err) {
      toast.error('Fehler beim Folgen des Benutzers');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile, isFollowing]);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      // Delete the relationship
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('user_id', profile.id)
        .eq('related_user_id', targetUserId)
        .eq('relationship_type', 'following');
        
      if (error) throw error;
      
      // Update follower_count for the target user
      await supabase.rpc('update_follower_count', {
        target_user_id: targetUserId,
        count_change: -1
      });
      
      // Update following_count for the current user
      await supabase.rpc('update_following_count', {
        user_id: profile.id,
        count_change: -1
      });
      
      return true;
    } catch (err) {
      toast.error('Fehler beim Entfolgen des Benutzers');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Get follow stats for a user
   */
  const getFollowStats = useCallback(async (userId: string) => {
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
    } catch (err) {
      return { followers_count: 0, following_count: 0 };
    }
  }, []);

  /**
   * Block a user
   */
  const blockUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      // Block user
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          user_id: profile.id,
          related_user_id: targetUserId,
          relationship_type: 'blocked'
        });
        
      if (error) throw error;
      
      // Automatically unfollow when blocked
      await unfollowUser(targetUserId);
      
      // Also unfollow the other direction (if the blocked user follows the current user)
      await supabase
        .from('user_relationships')
        .delete()
        .eq('user_id', targetUserId)
        .eq('related_user_id', profile.id)
        .eq('relationship_type', 'following');
      
      toast.success('Benutzer wurde blockiert');
      return true;
    } catch (err) {
      toast.error('Fehler beim Blockieren des Benutzers');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile, unfollowUser]);

  /**
   * Unblock a user
   */
  const unblockUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      // Remove block
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('user_id', profile.id)
        .eq('related_user_id', targetUserId)
        .eq('relationship_type', 'blocked');
        
      if (error) throw error;
      
      toast.success('Blockierung aufgehoben');
      return true;
    } catch (err) {
      toast.error('Fehler beim Aufheben der Blockierung');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Check if a user is blocked
   */
  const isBlocked = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    try {
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
      return false;
    }
  }, [profile]);

  /**
   * Get blocked users
   */
  const getBlockedUsers = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          related_user_id,
          users:related_user_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('user_id', profile.id)
        .eq('relationship_type', 'blocked');
      
      if (error) throw error;
      
      // Transform data to match RelationshipUser structure
      return data.map(item => {
        // Access the first item if users is an array, otherwise use it directly
        const userInfo = Array.isArray(item.users) ? item.users[0] : item.users;
        return {
          id: userInfo.id,
          username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          bio: userInfo.bio
        };
      });
    } catch (err) {
      return [];
    }
  }, [profile]);

  /**
   * Send a friend request to a user
   */
  const sendFriendRequest = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          user_id: profile.id,
          related_user_id: targetUserId,
          relationship_type: 'friend_request'
        });
        
      if (error) throw error;
      
      toast.success('Freundschaftsanfrage gesendet');
      return true;
    } catch (err) {
      toast.error('Fehler beim Senden der Freundschaftsanfrage');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Accept a friend request
   */
  const acceptFriendRequest = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      // First check if there is a friend request from this user
      const { data: requestData, error: requestError } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('related_user_id', profile.id)
        .eq('relationship_type', 'friend_request')
        .maybeSingle();
      
      if (requestError) throw requestError;
      
      if (!requestData) {
        toast.error('Keine Freundschaftsanfrage gefunden');
        return false;
      }
      
      // Create friend relationship in both directions
      const { error: error1 } = await supabase
        .from('user_relationships')
        .insert({
          user_id: profile.id,
          related_user_id: targetUserId,
          relationship_type: 'friend'
        });
        
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('user_relationships')
        .update({ relationship_type: 'friend' })
        .eq('id', requestData.id);
        
      if (error2) throw error2;
      
      toast.success('Freundschaftsanfrage angenommen');
      return true;
    } catch (err) {
      toast.error('Fehler beim Akzeptieren der Freundschaftsanfrage');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Remove friendship or decline friend request
   */
  const removeFriendship = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      // Remove friendship relation from both directions
      await supabase
        .from('user_relationships')
        .delete()
        .eq('user_id', profile.id)
        .eq('related_user_id', targetUserId)
        .in('relationship_type', ['friend', 'friend_request']);
        
      await supabase
        .from('user_relationships')
        .delete()
        .eq('user_id', targetUserId)
        .eq('related_user_id', profile.id)
        .in('relationship_type', ['friend', 'friend_request']);
      
      toast.success('Freundschaftsbeziehung entfernt');
      return true;
    } catch (err) {
      toast.error('Fehler beim Entfernen der Freundschaftsbeziehung');
      return false;
    }finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Get friend requests received by the current user
   */
  const getFriendRequests = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          user_id,
          users:user_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('related_user_id', profile.id)
        .eq('relationship_type', 'friend_request');
      
      if (error) throw error;
      
      // Transform data to match RelationshipUser structure
      return data.map(item => {
        // Access the first item if users is an array, otherwise use it directly
        const userInfo = Array.isArray(item.users) ? item.users[0] : item.users;
        return {
          id: userInfo.id,
          username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          bio: userInfo.bio
        };
      });
    } catch (err) {
      console.error('Error getting friend requests:', err);
      return [];
    }
  }, [profile]);

  /**
   * Get all friends of the current user
   */
  const getFriends = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          related_user_id,
          users:related_user_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('user_id', profile.id)
        .eq('relationship_type', 'friend');
      
      if (error) throw error;
      
      // Transform data to match RelationshipUser structure
      return data.map(item => {
        // Access the first item if users is an array, otherwise use it directly
        const userInfo = Array.isArray(item.users) ? item.users[0] : item.users;
        return {
          id: userInfo.id,
          username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          bio: userInfo.bio
        };
      });
    } catch (err) {
      console.error('Error getting friends:', err);
      return [];
    }
  }, [profile]);

  /**
   * Get friend requests sent by the current user
   */
  const getSentFriendRequests = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          related_user_id,
          users:related_user_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('user_id', profile.id)
        .eq('relationship_type', 'friend_request');
      
      if (error) throw error;
      
      // Transform data to match RelationshipUser structure
      return data.map(item => {
        // Access the first item if users is an array, otherwise use it directly
        const userInfo = Array.isArray(item.users) ? item.users[0] : item.users;
        return {
          id: userInfo.id,
          username: userInfo.username,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          bio: userInfo.bio
        };
      });
    } catch (err) {
      console.error('Error getting sent friend requests:', err);
      return [];
    }
  }, [profile]);

  return {
    isFollowing,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    isBlocked,
    getFollowStats,
    isProcessing,
    getBlockedUsers,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriendship,
    getFriendRequests,
    getSentFriendRequests,
    getFriends
  };
};
