import { createContext, useContext } from 'react';
import { UserProfile } from '@/lib/django-api-new';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getInitialAuthState = () => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuthContextValue = () => {
  // Dummy-Implementierung, eigentliche Logik ist in AuthProvider
  return {} as AuthContextType;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 