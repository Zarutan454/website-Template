// Album-API-Client für Django-Backend
import axios from 'axios';

const API_BASE = '/api';

export interface Album {
  id: string;
  name: string;
  description?: string;
  privacy: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  photos: Photo[];
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface Photo {
  id: string;
  album: string;
  user: UserProfile;
  image: string;
  image_url: string;
  caption?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// ========== Album API ==========
export const getAlbums = async (): Promise<Album[]> => {
  const res = await axios.get(`${API_BASE}/albums/`, { withCredentials: true });
  return res.data.results || res.data;
};

export const getAlbum = async (albumId: string): Promise<Album> => {
  const res = await axios.get(`${API_BASE}/albums/${albumId}/`, { withCredentials: true });
  return res.data;
};

export const createAlbum = async (data: { name: string; description?: string; privacy?: string }): Promise<Album> => {
  try {
    const res = await axios.post(`${API_BASE}/albums/`, data, { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: unknown }).response !== null &&
      'status' in (error as { response: { status?: number } }).response &&
      (error as { response: { status?: number } }).response.status === 404
    ) {
      console.error('Album-Endpoint nicht gefunden (404):', error);
      throw new Error('Album-Endpoint nicht gefunden. Bitte Backend-Konfiguration prüfen.');
    }
    throw error;
  }
};

export const updateAlbum = async (albumId: string, data: Partial<Album>): Promise<Album> => {
  const res = await axios.patch(`${API_BASE}/albums/${albumId}/`, data, { withCredentials: true });
  return res.data;
};

export const deleteAlbum = async (albumId: string): Promise<void> => {
  await axios.delete(`${API_BASE}/albums/${albumId}/`, { withCredentials: true });
};

// ========== Photo API ==========
export const getPhotos = async (albumId: string): Promise<Photo[]> => {
  const res = await axios.get(`${API_BASE}/photos/?album=${albumId}`, { withCredentials: true });
  return res.data.results || res.data;
};

export const uploadPhoto = async (albumId: string, file: File, caption?: string): Promise<Photo> => {
  const formData = new FormData();
  formData.append('album', albumId);
  formData.append('image', file);
  if (caption) formData.append('caption', caption);
  const res = await axios.post(`${API_BASE}/photos/`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deletePhoto = async (photoId: string): Promise<void> => {
  await axios.delete(`${API_BASE}/photos/${photoId}/`, { withCredentials: true });
}; 