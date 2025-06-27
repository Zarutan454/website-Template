
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Post } from '@/types/posts';

// Definition des Zustands für Posts
interface PostState {
  posts: Post[];
  filteredPosts: Post[];
  adaptedPosts: Record<string, unknown>[];
  isLoading: boolean;
  error: Error | null;
  selectedFilter: string | null;
}

// Aktionen, die auf den Post-Zustand angewendet werden können
type PostAction =
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_FILTERED_POSTS'; payload: Post[] }
  | { type: 'SET_ADAPTED_POSTS'; payload: Record<string, unknown>[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_FILTER'; payload: string | null };

// Anfangszustand
const initialState: PostState = {
  posts: [],
  filteredPosts: [],
  adaptedPosts: [],
  isLoading: false,
  error: null,
  selectedFilter: 'Neueste'
};

// Reducer-Funktion für den Post-Zustand
const postReducer = (state: PostState, action: PostAction): PostState => {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'SET_FILTERED_POSTS':
      return { ...state, filteredPosts: action.payload };
    case 'SET_ADAPTED_POSTS':
      return { ...state, adaptedPosts: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTER':
      return { ...state, selectedFilter: action.payload };
    default:
      return state;
  }
};

// Kontext erstellen
const PostContext = createContext<{
  state: PostState;
  dispatch: React.Dispatch<PostAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Provider-Komponente
export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(postReducer, initialState);

  return (
    <PostContext.Provider value={{ state, dispatch }}>
      {children}
    </PostContext.Provider>
  );
};

// Hook für den Zugriff auf den Post-Kontext
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext muss innerhalb eines PostProvider verwendet werden');
  }
  return context;
};
