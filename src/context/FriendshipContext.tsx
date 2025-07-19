import type { ReactNode } from 'react';
import { FriendshipContext, useFriendshipContextValue } from './FriendshipContext.utils';

export const FriendshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useFriendshipContextValue();
  return (
    <FriendshipContext.Provider value={value}>{children}</FriendshipContext.Provider>
  );
};
