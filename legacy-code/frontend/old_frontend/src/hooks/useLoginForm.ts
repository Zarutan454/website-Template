
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  showPassword: boolean;
}

export const useLoginForm = () => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    isLoading: false,
    showPassword: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  const updateFormState = (key: keyof LoginFormState, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = () => {
    updateFormState('showPassword', !formState.showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.email || !formState.password) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    updateFormState('isLoading', true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Erfolgreich eingeloggt");
      
      // Weiterleitung erfolgt durch Auth State Change Listener
    } catch (error: Error | unknown) {
      const err = error as { message: string };
      
      if (error.message === 'Invalid login credentials') {
        toast.error("Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort");
      } else {
        toast.error("Login fehlgeschlagen: " + error.message);
      }
    } finally {
      updateFormState('isLoading', false);
    }
  };

  return {
    formState,
    updateFormState,
    togglePasswordVisibility,
    handleLogin,
    redirectPath: location.state?.from || '/feed'
  };
};
