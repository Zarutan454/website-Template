import { useContext } from 'react';
import type { ReactNode } from 'react';
import { FriendshipContext, useFriendshipContextValue } from './FriendshipContext.utils';

export const FriendshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useFriendshipContextValue();
  return (
    <FriendshipContext.Provider value={value}>{children}</FriendshipContext.Provider>
  );
};

export const useFriendship = () => {
  const context = useContext(FriendshipContext);
  if (!context) {
    throw new Error('useFriendship must be used within a FriendshipProvider');
  }
  return context;
};
