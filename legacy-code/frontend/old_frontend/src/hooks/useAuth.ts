
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useProfile } from './useProfile';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { refreshProfile } = useProfile();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        setIsAuthenticated(true);
        await refreshProfile();
        navigate('/');
        toast.success('Willkommen zurück!');
        return true;
      }
      
      return false;
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login fehlgeschlagen';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, refreshProfile]);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        setIsAuthenticated(true);
        toast.success('Konto erfolgreich erstellt!');
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error during signup:', err);
      setError(err.message || 'Registrierung fehlgeschlagen');
      toast.error(err.message || 'Registrierung fehlgeschlagen');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setIsAuthenticated(false);
      navigate('/login');
      toast.success('Du wurdest abgemeldet');
      return true;
    } catch (err: any) {
      console.error('Error during logout:', err);
      toast.error(err.message || 'Abmeldung fehlgeschlagen');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Initialize auth state from supabase on hook mount
  const checkAuthState = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setIsAuthenticated(!!data.session);
      return !!data.session;
    } catch (err) {
      console.error('Error checking auth state:', err);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Check auth state when the hook is initialized
  useCallback(() => {
    checkAuthState();
  }, [checkAuthState]);

  return {
    isLoading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    checkAuthState
  };
};

export default useAuth;
