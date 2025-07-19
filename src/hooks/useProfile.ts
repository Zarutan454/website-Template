import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.utils';
import { api } from '../lib/django-api-new';
import { AxiosResponse } from 'axios';

// API Response Types
interface ApiResponse<T> {
  data: T;
  status: number;
}

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ProfileData {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  follower_count: number;
  following_count: number;
  bio?: string;
  location?: string;
  website?: string;
  social_media_links: Record<string, string>;
  is_verified: boolean;
  profile_complete: boolean;
  created_at: string;
}

export interface Photo {
  id: number;
  url: string;
  caption?: string;
  created_at: string;
}

export interface Activity {
  id: number;
  type: 'post' | 'comment' | 'like' | 'follow' | 'photo';
  content: string;
  created_at: string;
  related_user?: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
}

export interface Analytics {
  total_posts: number;
  total_likes_received: number;
  total_comments_received: number;
  engagement_rate: number;
  posts_last_week: number;
  posts_last_month: number;
  popularity_score: number;
  follower_count: number;
  following_count: number;
  account_age_days: number;
  profile_completion: number;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_phone: boolean;
  allow_friend_requests: boolean;
  show_online_status: boolean;
  allow_messages: boolean;
  show_activity: boolean;
  show_photos: boolean;
  show_friends: boolean;
  show_analytics: boolean;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

interface AchievementsResponse {
  achievements: Achievement[];
  total_achievements: number;
  total_possible: number;
}

// API-Funktionen außerhalb des Hooks
export const uploadProfilePhoto = async (userId: number, formData: FormData) => {
  try {
    const response = await api.post(`/users/${userId}/upload-photo/`, formData as unknown as Record<string, unknown>, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as ApiResponse<{ success: boolean; photo_url: string; post_id: number }>;
    return response.data;
  } catch (err) {
    throw new Error('Upload fehlgeschlagen');
  }
};

export const updatePrivacySettings = async (userId: number, settings: Partial<PrivacySettings>) => {
  try {
    const response = await api.put(`/users/${userId}/update-privacy/`, settings) as ApiResponse<{ success: boolean; privacy_settings: PrivacySettings }>;
    return response.data;
  } catch (err) {
    throw new Error('Privacy-Einstellungen konnten nicht aktualisiert werden');
  }
};

export const updateSocialLinks = async (userId: number, links: SocialLinks) => {
  try {
    const response = await api.put(`/users/${userId}/update-social-links/`, links as Record<string, unknown>) as ApiResponse<{ success: boolean; social_links: SocialLinks }>;
    return response.data;
  } catch (err) {
    throw new Error('Social Links konnten nicht aktualisiert werden');
  }
};

export const deleteProfilePhoto = async (userId: number, photoId: number) => {
  try {
    const response = await api.delete(`/users/${userId}/delete-photo/${photoId}/`) as ApiResponse<{ success: boolean }>;
    return response.data;
  } catch (err) {
    throw new Error('Foto konnte nicht gelöscht werden');
  }
};

export const reportUser = async (userId: number, reason: string, description?: string) => {
  try {
    const response = await api.post(`/users/${userId}/report/`, {
      reason,
      description: description || ''
    }) as ApiResponse<{ success: boolean; message: string }>;
    return response.data;
  } catch (err) {
    throw new Error('Report konnte nicht eingereicht werden');
  }
};

export const useProfile = (userId?: number) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  // Lade Profildaten
  const loadProfileData = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/users/profile/${targetUserId}/`) as ApiResponse<ProfileData>;
      setProfileData(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Profildaten');
      console.error('Profile data error:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  // Lade Fotos
  const loadPhotos = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const rawResponse = await api.get(`/users/${targetUserId}/photos/`);
      const response = rawResponse as PaginatedResponse<Photo>;
      console.log('Photos FULL API response:', response);
      if (Array.isArray(response.results)) {
        setPhotos(response.results);
        setError(null);
      } else {
        setPhotos([]);
        setError('Fehler: Unerwartetes Antwortformat (Fotos)');
        console.error('Photos error: Kein results-Array in der Antwort', response);
      }
    } catch (err) {
      setPhotos([]);
      setError('Fehler beim Laden der Fotos');
      console.error('Photos error:', err);
    }
  }, [targetUserId]);

  // Lade Aktivitäten
  const loadActivity = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const rawResponse = await api.get(`/users/${targetUserId}/activity/`);
      const response = rawResponse as PaginatedResponse<Activity>;
      console.log('Activity FULL API response:', response);
      if (Array.isArray(response.results)) {
        setActivity(response.results);
        setError(null);
      } else {
        setActivity([]);
        setError('Fehler: Unerwartetes Antwortformat (Aktivität)');
        console.error('Activity error: Kein results-Array in der Antwort', response);
      }
    } catch (err) {
      setActivity([]);
      setError('Fehler beim Laden der Aktivitäten');
      console.error('Activity error:', err);
    }
  }, [targetUserId]);

  // Lade Analytics
  const loadAnalytics = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await api.get(`/users/${targetUserId}/analytics/`) as ApiResponse<Analytics>;
      setAnalytics(response.data);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  }, [targetUserId]);

  // Lade Privacy-Einstellungen
  const loadPrivacySettings = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await api.get(`/users/${targetUserId}/privacy/`) as ApiResponse<PrivacySettings>;
      setPrivacySettings(response.data);
    } catch (err) {
      console.error('Privacy settings error:', err);
    }
  }, [targetUserId]);

  // Lade Social Links
  const loadSocialLinks = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await api.get(`/users/${targetUserId}/social-links/`) as ApiResponse<SocialLinks>;
      setSocialLinks(response.data);
    } catch (err) {
      console.error('Social links error:', err);
    }
  }, [targetUserId]);

  // Lade Achievements
  const loadAchievements = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const rawResponse = await api.get(`/achievements/user/${targetUserId}/`);
      console.log('Achievements FULL API response:', rawResponse);
      
      // Backend gibt { achievements: Array, total_achievements: number, total_possible: number }
      if (rawResponse && typeof rawResponse === 'object' && 'achievements' in rawResponse) {
        const achievementsResponse = rawResponse as AchievementsResponse;
        if (Array.isArray(achievementsResponse.achievements)) {
          setAchievements(achievementsResponse.achievements);
          setError(null);
        } else {
          setAchievements([]);
          setError('Fehler: Achievements ist kein Array');
        }
      } else if (rawResponse && typeof rawResponse === 'object' && 'results' in rawResponse) {
        // Fallback für altes Format mit results Array
        const resultsResponse = rawResponse as { results: Achievement[] };
        if (Array.isArray(resultsResponse.results)) {
          setAchievements(resultsResponse.results);
          setError(null);
        } else {
          setAchievements([]);
          setError('Fehler: Results ist kein Array');
        }
      } else {
        setAchievements([]);
        setError('Kein results-Array in der Antwort');
        console.error('Achievements error: Kein results-Array in der Antwort', rawResponse);
      }
    } catch (err) {
      setAchievements([]);
      setError('Fehler beim Laden der Achievements');
      console.error('Achievements error:', err);
    }
  }, [targetUserId]);

  // Lade alle Daten beim Mount
  useEffect(() => {
    if (targetUserId) {
      loadProfileData();
      loadPhotos();
      loadActivity();
      loadAnalytics();
      loadPrivacySettings();
      loadSocialLinks();
      loadAchievements();
    }
  }, [targetUserId, loadProfileData, loadPhotos, loadActivity, loadAnalytics, loadPrivacySettings, loadSocialLinks, loadAchievements]);

  return {
    profileData,
    photos,
    activity,
    analytics,
    privacySettings,
    socialLinks,
    achievements,
    loading,
    error,
    loadProfileData,
    loadPhotos,
    loadActivity,
    loadAnalytics,
    loadPrivacySettings,
    loadSocialLinks,
    loadAchievements,
    uploadProfilePhoto,
    updatePrivacySettings,
    updateSocialLinks,
    deleteProfilePhoto,
    reportUser
  };
}; 
