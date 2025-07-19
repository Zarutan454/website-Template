import { useState, useContext } from 'react';
import { userAPI } from '@/lib/django-api-new';
import { AuthContext } from '@/context/AuthContext';

interface UseProfileImageUploadResult {
  avatarUploading: boolean;
  coverUploading: boolean;
  avatarError: string | null;
  coverError: string | null;
  avatarProgress: number;
  coverProgress: number;
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadCover: (file: File) => Promise<string | null>;
}

export function useProfileImageUpload(onProfileUpdate?: () => void): UseProfileImageUploadResult {
  const { refreshUser } = useContext(AuthContext);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    setAvatarUploading(true);
    setAvatarError(null);
    setAvatarProgress(0);
    try {
      if (!file.type.startsWith('image/')) {
        setAvatarError('Bitte wähle eine Bilddatei aus.');
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Die Datei ist zu groß. Maximale Größe: 5MB');
        return null;
      }
      // Upload
      const result = await userAPI.uploadAvatar(file);
      console.log('[UploadAvatar] API Response:', result);
      if (result.url) {
        // PATCH-Profil mit neuer avatar_url
        await userAPI.updateProfile({ avatar_url: result.url });
        if (onProfileUpdate) onProfileUpdate();
        if (refreshUser) await refreshUser();
        return result.url;
      } else {
        setAvatarError('Ungültige Antwort vom Server');
        return null;
      }
    } catch (error: unknown) {
      console.error('[UploadAvatar] Error:', error);
      setAvatarError('Fehler beim Hochladen des Profilbilds. Bitte versuche es erneut.');
      return null;
    } finally {
      setAvatarUploading(false);
      setAvatarProgress(0);
    }
  };

  const uploadCover = async (file: File): Promise<string | null> => {
    setCoverUploading(true);
    setCoverError(null);
    setCoverProgress(0);
    try {
      if (!file.type.startsWith('image/')) {
        setCoverError('Bitte wähle eine Bilddatei aus.');
        return null;
      }
      if (file.size > 10 * 1024 * 1024) {
        setCoverError('Die Datei ist zu groß. Maximale Größe: 10MB');
        return null;
      }
      // Upload
      const result = await userAPI.uploadCover(file);
      console.log('[UploadCover] API Response:', result);
      if (result.url) {
        // PATCH-Profil mit neuer cover_url
        await userAPI.updateProfile({ cover_url: result.url });
        if (onProfileUpdate) onProfileUpdate();
        if (refreshUser) await refreshUser();
        return result.url;
      } else {
        setCoverError('Ungültige Antwort vom Server');
        return null;
      }
    } catch (error: unknown) {
      console.error('[UploadCover] Error:', error);
      setCoverError('Fehler beim Hochladen des Banners. Bitte versuche es erneut.');
      return null;
    } finally {
      setCoverUploading(false);
      setCoverProgress(0);
    }
  };

  return {
    avatarUploading,
    coverUploading,
    avatarError,
    coverError,
    avatarProgress,
    coverProgress,
    uploadAvatar,
    uploadCover,
  };
} 
