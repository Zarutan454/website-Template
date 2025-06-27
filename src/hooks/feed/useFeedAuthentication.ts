
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

/**
 * Hook zur Verwaltung der Authentifizierung im Feed-Kontext
 * Stellt Hilfsfunktionen für die Authentifizierungsprüfung bereit
 */
export const useFeedAuthentication = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  
  /**
   * Leitet den Benutzer zur Login-Seite weiter
   */
  const handleLoginRedirect = () => {
    navigate('/login');
  };
  
  /**
   * Überprüft, ob der Benutzer authentifiziert ist und zeigt eine Fehlermeldung an, wenn nicht
   * @param action - Beschreibung der Aktion, für die eine Authentifizierung erforderlich ist
   * @returns true wenn der Benutzer authentifiziert ist, sonst false
   */
  const requireAuthentication = (action: string = "diese Aktion"): boolean => {
    if (!isAuthenticated) {
      toast.error(`Bitte melde dich an, um ${action} auszuführen`);
      return false;
    }
    return true;
  };
  
  /**
   * Überprüft, ob der aktuelle Benutzer der Autor ist
   * @param authorId - ID des Autors, mit dem verglichen werden soll
   * @returns true wenn der aktuelle Benutzer der Autor ist, sonst false
   */
  const isCurrentUserAuthor = (authorId: string): boolean => {
    return profile?.id === authorId;
  };
  
  return {
    profile,
    isAuthenticated,
    profileLoading,
    handleLoginRedirect,
    requireAuthentication,
    isCurrentUserAuthor
  };
};
