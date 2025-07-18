import { createContext, Dispatch, useContext } from 'react';

export type PostState = Record<string, unknown>;

export type PostAction = { type: string; payload?: unknown };

export const initialState: PostState = {};

export function postReducer(state: PostState, action: PostAction): PostState {
  // ... Reducer-Logik
  return state;
}

export const PostContext = createContext<{
  state: PostState;
  dispatch: Dispatch<PostAction>;
}>({
  state: initialState,
  dispatch: () => null
});

export const usePostContextValue = () => {
  // Dummy-Implementierung, eigentliche Logik ist im Provider
  return {
    state: initialState,
    dispatch: () => null
  };
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
}; 