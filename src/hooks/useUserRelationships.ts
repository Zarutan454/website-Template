import { useState, useCallback } from 'react';
import { useProfile } from './useProfile';
import { toast } from 'sonner';
import { userRelationshipAPI } from '@/lib/django-api-new';
import { useAuth } from '@/context/AuthContext';

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
 * Hook to manage user relationship actions like following and blocking
 */
export const useUserRelationships = () => {
  const { user: profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Check if the current user is following the target user
   */
  const isFollowing = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    try {
      return await userRelationshipAPI.isFollowing(targetUserId);
    } catch (error) {
      console.error('Error checking if following:', error);
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
      const result = await userRelationshipAPI.followUser(targetUserId);
      if (result) {
        toast.success('Benutzer erfolgreich gefolgt');
      } else {
        toast.error('Fehler beim Folgen des Benutzers');
      }
      return result;
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Fehler beim Folgen des Benutzers');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    setIsProcessing(true);
    try {
      const result = await userRelationshipAPI.unfollowUser(targetUserId);
      if (result) {
        toast.success('Benutzer erfolgreich entfolgt');
      } else {
        toast.error('Fehler beim Entfolgen des Benutzers');
      }
      return result;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Fehler beim Entfolgen des Benutzers');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Get follow stats for a user
   */
  const getFollowStats = useCallback(async (userId: string) => {
    try {
      return await userRelationshipAPI.getFollowStats(userId);
    } catch (error) {
      console.error('Error getting follow stats:', error);
      return { followers: 0, following: 0 };
    }
  }, []);

  /**
   * Block a user
   */
  const blockUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    setIsProcessing(true);
    try {
      const result = await userRelationshipAPI.blockUser(targetUserId);
      if (result) {
        toast.success('Benutzer erfolgreich blockiert');
        // Automatisch entfolgen wenn blockiert
        await unfollowUser(targetUserId);
      } else {
        toast.error('Fehler beim Blockieren des Benutzers');
      }
      return result;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Fehler beim Blockieren des Benutzers');
      return false;
    } finally {
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
      const result = await userRelationshipAPI.unblockUser(targetUserId);
      if (result) {
        toast.success('Blockierung erfolgreich aufgehoben');
      } else {
        toast.error('Fehler beim Aufheben der Blockierung');
      }
      return result;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Fehler beim Aufheben der Blockierung');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [profile]);

  /**
   * Get followers list for a user
   */
  const getFollowers = useCallback(async (userId: string): Promise<RelationshipUser[]> => {
    try {
      const followers = await userRelationshipAPI.getFollowers(userId);
      return followers.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }, []);

  /**
   * Get following list for a user
   */
  const getFollowing = useCallback(async (userId: string): Promise<RelationshipUser[]> => {
    try {
      const following = await userRelationshipAPI.getFollowing(userId);
      return following.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }, []);

  /**
   * Get friends (users who follow each other)
   */
  const getFriends = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    try {
      const followers = await userRelationshipAPI.getFollowers(profile.id);
      const following = await userRelationshipAPI.getFollowing(profile.id);
      // Schnittmenge: beide folgen sich
      const friends = followers.filter(f => following.some(u => u.id === f.id));
      return friends.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }, [profile]);

  /**
   * Get received friend requests (users who follow you, aber du folgst nicht zurück)
   */
  const getFriendRequests = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    try {
      const followers = await userRelationshipAPI.getFollowers(profile.id);
      const following = await userRelationshipAPI.getFollowing(profile.id);
      // Alle, die dir folgen, aber du folgst nicht zurück
      const requests = followers.filter(f => !following.some(u => u.id === f.id));
      return requests.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  }, [profile]);

  /**
   * Get sent friend requests (du folgst, aber sie folgen nicht zurück)
   */
  const getSentFriendRequests = useCallback(async (): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    try {
      const followers = await userRelationshipAPI.getFollowers(profile.id);
      const following = await userRelationshipAPI.getFollowing(profile.id);
      // Alle, denen du folgst, die dir aber nicht zurück folgen
      const sent = following.filter(f => !followers.some(u => u.id === f.id));
      return sent.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting sent friend requests:', error);
      return [];
    }
  }, [profile]);

  return {
    isFollowing,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    getFollowStats,
    getFollowers,
    getFollowing,
    getFriends,
    getFriendRequests,
    getSentFriendRequests,
    isProcessing
  };
}; 
