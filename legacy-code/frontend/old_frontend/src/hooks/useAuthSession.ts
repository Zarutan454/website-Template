
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export const useAuthSession = (redirectPath: string = '/feed') => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

  const checkSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setSessionChecked(true);
        return null;
      }
      
      if (data.session) {
        toast.info("Du bist bereits angemeldet", {
          id: "already-logged-in"
        });
        
        navigate(redirectPath, { replace: true });
      }
      
      setSessionChecked(true);
      return data.session;
    } catch (error) {
      setSessionChecked(true);
      return null;
    }
  }, [navigate, redirectPath]);

  useEffect(() => {
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('User authenticated, redirecting');
        navigate(redirectPath, { replace: true });
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkSession, navigate, redirectPath]);

  return { sessionChecked };
};
