import { useState, useCallback, useEffect } from 'react';
import { useProfile } from './useProfile';
import { toast } from 'sonner';
import { userRelationshipAPI } from '@/lib/django-api-new';
import { useAuth } from '@/hooks/useAuth';
import { useFeedWebSocket } from '@/hooks/useWebSocket';

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
  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(new Set());
  const feedWebSocket = useFeedWebSocket();

  // Typ für WebSocket Follow-Events
  interface FollowWebSocketMessage {
    type: 'user_followed' | 'user_unfollowed';
    follower_id: number;
    followed_id: number;
    [key: string]: unknown;
  }

  // Synchronisiere Follow-Status bei WebSocket-Events
  useEffect(() => {
    // TODO: WebSocket-Synchronisation für Follow-Status global implementieren, sobald Event-API verfügbar ist
    // Aktuell keine subscribe/unsubscribe API in useFeedWebSocket
    // Daher: Synchronisation via globalem Context/EventEmitter oder direkt im useFeedWebSocket implementieren
    // Beispiel (auskommentiert):
    // if (!feedWebSocket) return;
    // const handleMessage = (message: FollowWebSocketMessage) => { ... };
    // feedWebSocket.subscribe(handleMessage);
    // return () => feedWebSocket.unsubscribe(handleMessage);
  }, [feedWebSocket, profile?.id]);

  /**
   * Check if the current user is following the target user
   */
  const isFollowing = useCallback(async (targetUserId: string | number): Promise<boolean> => {
    const userId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
    if (followedUserIds.has(userId)) return true;
    if (!profile?.id) return false;
    try {
      return await userRelationshipAPI.isFollowing(userId);
    } catch (error) {
      console.error('Error checking if following:', error);
      return false;
    }
  }, [profile, followedUserIds]);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (targetUserId: string | number): Promise<boolean> => {
    if (!profile?.id || targetUserId === profile.id) {
      return false;
    }
    setIsProcessing(true);
    try {
      const userId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
      const result = await userRelationshipAPI.followUser(userId);
      if (result) {
        toast.success('Benutzer erfolgreich gefolgt');
        // Clear cache after follow action
        userRelationshipAPI.clearFollowStatsCache(userId);
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
  const unfollowUser = useCallback(async (targetUserId: string | number): Promise<boolean> => {
    if (!profile?.id) return false;
    setIsProcessing(true);
    try {
      const userId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
      const result = await userRelationshipAPI.unfollowUser(userId);
      if (result) {
        toast.success('Benutzer erfolgreich entfolgt');
        // Clear cache after unfollow action
        userRelationshipAPI.clearFollowStatsCache(userId);
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
   * Get follow stats for a user (delegates to API with caching)
   */
  const getFollowStats = useCallback(async (userId: string | number) => {
    try {
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      return await userRelationshipAPI.getFollowStats(userIdNum);
    } catch (error) {
      console.error('Error getting follow stats:', error);
      return { followers_count: 0, following_count: 0 };
    }
  }, []);

  /**
   * Block a user
   */
  const blockUser = useCallback(async (targetUserId: string | number): Promise<boolean> => {
    if (!profile?.id) return false;
    setIsProcessing(true);
    try {
      const userId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
      const result = await userRelationshipAPI.blockUser(userId);
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
  const unblockUser = useCallback(async (targetUserId: string | number): Promise<boolean> => {
    if (!profile?.id) return false;
    
    setIsProcessing(true);
    
    try {
      const userId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
      const result = await userRelationshipAPI.unblockUser(userId);
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
  const getFollowers = useCallback(async (userId: string | number): Promise<RelationshipUser[]> => {
    try {
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      const followers = await userRelationshipAPI.getFollowers(userIdNum);
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
  const getFollowing = useCallback(async (userId: string | number): Promise<RelationshipUser[]> => {
    try {
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      const following = await userRelationshipAPI.getFollowing(userIdNum);
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
      const profileId = typeof profile.id === 'string' ? parseInt(profile.id, 10) : profile.id;
      const followers = await userRelationshipAPI.getFollowers(profileId);
      const following = await userRelationshipAPI.getFollowing(profileId);
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
   * Get mutual followers (users who follow each other)
   */
  const getMutualFollowers = useCallback(async (targetUserId: string | number): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    try {
      const profileId = typeof profile.id === 'string' ? parseInt(profile.id, 10) : profile.id;
      const targetId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
      
      const [myFollowers, theirFollowers] = await Promise.all([
        userRelationshipAPI.getFollowers(profileId),
        userRelationshipAPI.getFollowers(targetId)
      ]);
      
      // Schnittmenge: beide haben die gleichen Follower
      const mutual = myFollowers.filter(f => theirFollowers.some(u => u.id === f.id));
      return mutual.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting mutual followers:', error);
      return [];
    }
  }, [profile]);

  /**
   * Get users who follow both current user and target user
   */
  const getCommonFollowers = useCallback(async (targetUserId: string | number): Promise<RelationshipUser[]> => {
    if (!profile?.id) return [];
    try {
      const profileId = typeof profile.id === 'string' ? parseInt(profile.id, 10) : profile.id;
      const targetId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;
      
      const [myFollowers, theirFollowers] = await Promise.all([
        userRelationshipAPI.getFollowers(profileId),
        userRelationshipAPI.getFollowers(targetId)
      ]);
      
      // Schnittmenge: beide haben die gleichen Follower
      const common = myFollowers.filter(f => theirFollowers.some(u => u.id === f.id));
      return common.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio
      }));
    } catch (error) {
      console.error('Error getting common followers:', error);
      return [];
    }
  }, [profile]);

  /**
   * Get received friend requests (placeholder implementation)
   * Note: This is a placeholder since friend requests are not yet implemented in the backend
   */
  const getFriendRequests = useCallback(async (): Promise<RelationshipUser[]> => {
    // Placeholder implementation - returns empty array since friend requests are not implemented yet
    console.warn('getFriendRequests: Friend requests not yet implemented in backend');
    return [];
  }, []);

  /**
   * Get sent friend requests (placeholder implementation)
   * Note: This is a placeholder since friend requests are not yet implemented in the backend
   */
  const getSentFriendRequests = useCallback(async (): Promise<RelationshipUser[]> => {
    // Placeholder implementation - returns empty array since friend requests are not implemented yet
    console.warn('getSentFriendRequests: Friend requests not yet implemented in backend');
    return [];
  }, []);

  return {
    isProcessing,
    isFollowing,
    followUser,
    unfollowUser,
    getFollowStats,
    blockUser,
    unblockUser,
    getFollowers,
    getFollowing,
    getFriends,
    getMutualFollowers,
    getCommonFollowers,
    getFriendRequests,
    getSentFriendRequests
  };
};

export default useUserRelationships; 
