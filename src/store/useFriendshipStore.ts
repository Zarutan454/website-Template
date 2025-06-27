import { create } from 'zustand';
import { RelationshipUser } from '@/hooks/useUserRelationships';

interface FriendshipState {
  friends: RelationshipUser[];
  receivedRequests: RelationshipUser[];
  sentRequests: RelationshipUser[];
  isLoading: boolean;
  
  setFriends: (friends: RelationshipUser[]) => void;
  setReceivedRequests: (requests: RelationshipUser[]) => void;
  setSentRequests: (requests: RelationshipUser[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  addFriend: (friend: RelationshipUser) => void;
  removeFriend: (userId: string) => void;
  
  addReceivedRequest: (request: RelationshipUser) => void;
  removeReceivedRequest: (userId: string) => void;
  addSentRequest: (request: RelationshipUser) => void;
  removeSentRequest: (userId: string) => void;
  
  getFriendshipStatus: (userId: string) => 'none' | 'pending' | 'requested' | 'friends';
}

export const useFriendshipStore = create<FriendshipState>((set, get) => ({
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  isLoading: false,
  
  setFriends: (friends) => set({ friends }),
  setReceivedRequests: (receivedRequests) => set({ receivedRequests }),
  setSentRequests: (sentRequests) => set({ sentRequests }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  addFriend: (friend) => set((state) => ({
    friends: [...state.friends, friend],
    receivedRequests: state.receivedRequests.filter(req => req.id !== friend.id),
    sentRequests: state.sentRequests.filter(req => req.id !== friend.id)
  })),
  
  removeFriend: (userId) => set((state) => ({
    friends: state.friends.filter(friend => friend.id !== userId)
  })),
  
  addReceivedRequest: (request) => set((state) => ({
    receivedRequests: [...state.receivedRequests, request]
  })),
  
  removeReceivedRequest: (userId) => set((state) => ({
    receivedRequests: state.receivedRequests.filter(req => req.id !== userId)
  })),
  
  addSentRequest: (request) => set((state) => ({
    sentRequests: [...state.sentRequests, request]
  })),
  
  removeSentRequest: (userId) => set((state) => ({
    sentRequests: state.sentRequests.filter(req => req.id !== userId)
  })),
  
  getFriendshipStatus: (userId) => {
    const state = get();
    
    if (state.friends.some(friend => friend.id === userId)) {
      return 'friends';
    }
    
    if (state.sentRequests.some(req => req.id === userId)) {
      return 'pending';
    }
    
    if (state.receivedRequests.some(req => req.id === userId)) {
      return 'requested';
    }
    
    return 'none';
  }
}));
