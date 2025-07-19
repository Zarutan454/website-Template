import { useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import djangoApi, { UserProfile } from '@/lib/django-api-new';
import { AuthContext, AuthContextType } from './AuthContext.utils';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const checkAuthStatus = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (accessToken && refreshToken) {
        await refreshUser();
      } else {
        setUser(null);
      }
    } catch (error) {
      const refreshSuccess = await refreshTokenFn();
      if (!refreshSuccess) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await djangoApi.login(email, password);
      if (response.user && response.token) {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('refresh_token', response.refresh);
        setUser(response.user);
        toast.success('Erfolgreich angemeldet!');
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (error: unknown) {
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
      if (response.user && response.token) {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('refresh_token', response.refresh);
        setUser(response.user);
        toast.success('Registrierung erfolgreich! Willkommen bei BSN!');
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (error: unknown) {
      toast.error('Registrierung fehlgeschlagen');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await djangoApi.logout({ refresh: refreshToken });
      }
    } catch (error) {
      // Ignorieren
    } finally {
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
        setUser(profile);
      } else {
        await refreshTokenFn();
      }
    } catch (error) {
      await logout();
    }
  };

  const refreshTokenFn = async (): Promise<boolean> => {
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
      return false;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        return null;
      }
      return accessToken;
    } catch (error) {
      return null;
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
    refreshToken: refreshTokenFn,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext } from './AuthContext.utils'; 
