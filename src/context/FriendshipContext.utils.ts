import { createContext } from 'react';

export interface RelationshipUser {
  id: string;
  // ... weitere Felder nach Bedarf
}

export interface FriendshipContextType {
  friends: RelationshipUser[];
  receivedRequests: RelationshipUser[];
  sentRequests: RelationshipUser[];
  isLoading: boolean;
  refreshFriends: () => Promise<RelationshipUser[]>;
  refreshReceivedRequests: () => Promise<RelationshipUser[]>;
  refreshSentRequests: () => Promise<RelationshipUser[]>;
  getFriendshipStatus: (userId: string) => 'none' | 'pending' | 'requested' | 'friends';
}

export const FriendshipContext = createContext<FriendshipContextType | undefined>(undefined);

export const useFriendshipContextValue = () => {
  // Dummy-Implementierung, eigentliche Logik ist in FriendshipProvider
  return {} as FriendshipContextType;
}; 