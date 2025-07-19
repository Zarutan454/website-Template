
import { useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { PostContext, postReducer, initialState } from './PostContext.utils';

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(postReducer, initialState);
  return (
    <PostContext.Provider value={{ state, dispatch }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};
