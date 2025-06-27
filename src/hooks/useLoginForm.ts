import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { authAPI } from '@/lib/django-api-new';

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
      const response = await authAPI.login(formState.email, formState.password);
      if (response.data && response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success("Erfolgreich eingeloggt");
        navigate(location.state?.from || '/feed');
      } else {
        toast.error("Anmeldung fehlgeschlagen");
      }
    } catch (error: any) {
      if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Login fehlgeschlagen: " + (error.message || 'Unbekannter Fehler'));
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
