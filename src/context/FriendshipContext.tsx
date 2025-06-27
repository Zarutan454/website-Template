import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useUserRelationships, RelationshipUser } from '@/hooks/useUserRelationships';
import { useAuth } from '@/context/AuthContext';

interface FriendshipContextType {
  friends: RelationshipUser[];
  receivedRequests: RelationshipUser[];
  sentRequests: RelationshipUser[];
  isLoading: boolean;
  refreshFriends: () => Promise<RelationshipUser[] | void>;
  refreshReceivedRequests: () => Promise<RelationshipUser[] | void>;
  refreshSentRequests: () => Promise<RelationshipUser[] | void>;
  getFriendshipStatus: (userId: string) => 'none' | 'pending' | 'requested' | 'friends';
}

const FriendshipContext = createContext<FriendshipContextType | undefined>(undefined);

export const FriendshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: profile } = useAuth();
  const { getFriends, getFriendRequests, getSentFriendRequests } = useUserRelationships();
  
  const [friends, setFriends] = useState<RelationshipUser[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RelationshipUser[]>([]);
  const [sentRequests, setSentRequests] = useState<RelationshipUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      Promise.all([
        refreshFriends(),
        refreshReceivedRequests(),
        refreshSentRequests()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [profile?.id]);

  const refreshFriends = async () => {
    if (!profile?.id) return;
    try {
      const data = await getFriends();
      setFriends(data);
      return data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  };

  const refreshReceivedRequests = async () => {
    if (!profile?.id) return;
    try {
      const data = await getFriendRequests();
      setReceivedRequests(data);
      return data;
    } catch (error) {
      console.error('Error fetching received requests:', error);
      return [];
    }
  };

  const refreshSentRequests = async () => {
    if (!profile?.id) return;
    try {
      const data = await getSentFriendRequests();
      setSentRequests(data);
      return data;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return [];
    }
  };

  const getFriendshipStatus = (userId: string): 'none' | 'pending' | 'requested' | 'friends' => {
    if (friends.some(friend => friend.id === userId)) {
      return 'friends';
    }
    
    if (sentRequests.some(req => req.id === userId)) {
      return 'pending';
    }
    
    if (receivedRequests.some(req => req.id === userId)) {
      return 'requested';
    }
    
    return 'none';
  };

  return (
    <FriendshipContext.Provider
      value={{
        friends,
        receivedRequests,
        sentRequests,
        isLoading,
        refreshFriends,
        refreshReceivedRequests,
        refreshSentRequests,
        getFriendshipStatus
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
};

export const useFriendship = () => {
  const context = useContext(FriendshipContext);
  if (context === undefined) {
    throw new Error('useFriendship must be used within a FriendshipProvider');
  }
  return context;
};
