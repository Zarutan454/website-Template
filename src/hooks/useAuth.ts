import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext.utils';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 