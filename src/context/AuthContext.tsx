import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import djangoApi from '../lib/django-api-new';
import type { UserProfile } from '../lib/django-api-new';
import { toast } from 'sonner';

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      console.log(`[AuthContext] checkAuthStatus - accessToken: ${!!accessToken}, refreshToken: ${!!refreshToken}`);
      
      if (accessToken && refreshToken) {
        // Versuche den aktuellen User zu laden
        console.log('[AuthContext] Attempting to load user profile');
        await refreshUser();
      } else {
        // Keine Tokens vorhanden, User ist nicht authentifiziert
        console.log('[AuthContext] No tokens found, user not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Auth check failed:', error);
      
      // Token ist ungültig, versuche Refresh
      const refreshSuccess = await refreshToken();
      if (!refreshSuccess) {
        // Refresh fehlgeschlagen, User abmelden
        console.log('[AuthContext] Token refresh failed, logging out');
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await djangoApi.login(email, password);
      
      // Backend gibt direkt { user, token, refresh } zurück
      if (response.user && response.token) {
        // Tokens speichern
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('refresh_token', response.refresh);
        
        // User-Daten setzen
        setUser(response.user);
        toast.success('Erfolgreich angemeldet!');
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      toast.error('Anmeldung fehlgeschlagen');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await djangoApi.register(data);
      
      // Backend gibt direkt { user, token, refresh } zurück
      if (response.user && response.token) {
        // Tokens speichern
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('refresh_token', response.refresh);
        
        // User-Daten setzen
        setUser(response.user);
        toast.success('Registrierung erfolgreich! Willkommen bei BSN!');
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      toast.error('Registrierung fehlgeschlagen');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Get refresh token for server logout
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Versuche Server-Logout (optional)
      if (refreshToken) {
        await djangoApi.logout({ refresh: refreshToken });
      }
    } catch (error) {
      console.error('Server logout failed:', error);
      // Trotzdem lokale Daten entfernen
    } finally {
      // Lokale Daten entfernen
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      
      toast.success('Erfolgreich abgemeldet');
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await djangoApi.getProfile();
      if (profile) {
        console.log('[AuthContext] User Profile Refreshed:', profile);
        setUser(profile);
      } else {
        // If profile fetch fails but tokens might be valid, try refreshing them.
        console.log('[AuthContext] Profile fetch failed, attempting token refresh.');
        await refreshToken();
      }
    } catch (error) {
      console.error('Failed to refresh user, logging out:', error);
      await logout();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        return false;
      }
      
      const response = await djangoApi.refresh({ refresh: refreshTokenValue });
      
      if (response.access) {
        localStorage.setItem('access_token', response.access);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
