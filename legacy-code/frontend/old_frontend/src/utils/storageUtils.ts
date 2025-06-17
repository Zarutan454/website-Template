import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
  error?: string;
}

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket to upload to (e.g., 'avatars', 'posts', 'stories')
 * @param onProgress Optional callback for upload progress
 * @returns Promise with the upload result
 */
export const uploadFile = async (
  file: File,
  bucket: string = 'media',
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    if (!file) {
      return {
        url: '',
        path: '',
        name: '',
        size: 0,
        type: '',
        error: 'Keine Datei ausgewählt'
      };
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return {
        url: '',
        path: '',
        name: file.name,
        size: file.size,
        type: file.type,
        error: 'Datei ist zu groß (max. 10MB)'
      };
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        url: '',
        path: '',
        name: file.name,
        size: file.size,
        type: file.type,
        error: 'Dateityp nicht unterstützt'
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (onProgress) {
      onProgress(100);
    }

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      url: '',
      path: '',
      name: file.name || '',
      size: file.size || 0,
      type: file.type || '',
      error: error instanceof Error ? error.message : 'Fehler beim Hochladen der Datei'
    };
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param path The path of the file to delete
 * @param bucket The storage bucket the file is in
 * @returns Promise with the deletion result
 */
export const deleteFile = async (
  path: string,
  bucket: string = 'media'
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!path) {
      return { success: false, error: 'Kein Pfad angegeben' };
    }

    let fileName = path;
    
    if (path.includes('/')) {
      fileName = path.split('/').pop() || '';
    }

    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Löschen der Datei'
    };
  }
};

/**
 * Gets the public URL for a file in Supabase Storage
 * @param path The path of the file
 * @param bucket The storage bucket the file is in
 * @returns The public URL of the file
 */
export const getPublicUrl = (path: string, bucket: string = 'media'): string => {
  if (!path) return '';

  if (path.startsWith('http')) {
    return path;
  }

  let fileName = path;
  if (path.includes('/')) {
    fileName = path.split('/').pop() || '';
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
};
