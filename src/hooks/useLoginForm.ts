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
    } catch (error: unknown) {
      // Type guards for error shape
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: unknown }).response !== null
      ) {
        const response = (error as { response?: unknown }).response;
        if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response &&
          typeof (response as { data?: unknown }).data === 'object' &&
          (response as { data?: unknown }).data !== null
        ) {
          const data = (response as { data?: unknown }).data;
          if (
            typeof data === 'object' &&
            data !== null &&
            'detail' in data
          ) {
            toast.error((data as { detail: string }).detail);
          } else if (
            typeof data === 'object' &&
            data !== null &&
            'error' in data
          ) {
            toast.error((data as { error: string }).error);
          } else if (
            typeof data === 'object' &&
            data !== null &&
            'message' in data
          ) {
            toast.error("Login fehlgeschlagen: " + ((data as { message?: string }).message || 'Unbekannter Fehler'));
          } else {
            toast.error("Login fehlgeschlagen: Unbekannter Fehler");
          }
        } else {
          toast.error("Login fehlgeschlagen: Unbekannter Fehler");
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error("Login fehlgeschlagen: " + ((error as { message?: string }).message || 'Unbekannter Fehler'));
      } else {
        toast.error("Login fehlgeschlagen: Unbekannter Fehler");
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
