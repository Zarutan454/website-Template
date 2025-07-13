import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mediaAPI, type UploadProgress } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface UseDjangoMediaUploadProps {
  maxFileSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  uploadedFiles: string[];
  error: string | null;
}

/**
 * Django-basierter Media Upload Hook - Migriert von Supabase Storage
 * 
 * ALT (Supabase):
 * const { data, error } = await supabase.storage.from('media').upload(path, file);
 * 
 * NEU (Django):
 * const { uploadFile, isUploading, progress } = useDjangoMediaUpload();
 */
export const useDjangoMediaUpload = ({
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/*', 'video/*'],
  multiple = false
}: UseDjangoMediaUploadProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    uploadedFiles: [],
    error: null
  });

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!isAuthenticated) {
      return 'Du musst angemeldet sein, um Dateien hochzuladen';
    }

    if (file.size > maxFileSize) {
      return `Datei ist zu groß. Maximale Größe: ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    const isAllowedType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      return `Dateityp nicht erlaubt. Erlaubte Typen: ${allowedTypes.join(', ')}`;
    }

    return null;
  }, [isAuthenticated, maxFileSize, allowedTypes]);

  // Upload single file
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return null;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: null,
      error: null
    }));

    try {
      const response = await mediaAPI.uploadFile(file, (progress) => {
        setState(prev => ({
          ...prev,
          progress
        }));
      });

      const uploadedFile = response.data;
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: null,
        uploadedFiles: [...prev.uploadedFiles, uploadedFile]
      }));

      toast.success('Datei erfolgreich hochgeladen!');
      return uploadedFile;
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      
      let errorMessage = 'Fehler beim Hochladen der Datei';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string } } };
        errorMessage = apiError.response?.data?.detail || errorMessage;
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: null,
        error: errorMessage
      }));

      toast.error(errorMessage);
      return null;
    }
  }, [validateFile]);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<string[]> => {
    if (!multiple) {
      toast.error('Mehrfach-Upload ist nicht aktiviert');
      return [];
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      if (validFiles.length === 0) return [];
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: null,
      error: null
    }));

    try {
      const response = await mediaAPI.uploadMultipleFiles(validFiles, (progress) => {
        setState(prev => ({
          ...prev,
          progress
        }));
      });

      const uploadedFiles = response.data;
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: null,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles]
      }));

      toast.success(`${uploadedFiles.length} Dateien erfolgreich hochgeladen!`);
      return uploadedFiles;
    } catch (error: unknown) {
      console.error('Error uploading files:', error);
      
      let errorMessage = 'Fehler beim Hochladen der Dateien';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string } } };
        errorMessage = apiError.response?.data?.detail || errorMessage;
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: null,
        error: errorMessage
      }));

      toast.error(errorMessage);
      return [];
    }
  }, [multiple, validateFile]);

  // Delete file
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    try {
      await mediaAPI.deleteFile(fileId);
      
      setState(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles.filter(file => file !== fileId)
      }));

      toast.success('Datei erfolgreich gelöscht');
      return true;
    } catch (error: unknown) {
      console.error('Error deleting file:', error);
      toast.error('Fehler beim Löschen der Datei');
      return false;
    }
  }, [isAuthenticated]);

  // Update file metadata
  const updateFile = useCallback(async (fileId: string, data: { is_public?: boolean; metadata?: Record<string, unknown> }): Promise<string | null> => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return null;
    }

    try {
      const response = await mediaAPI.updateFile(fileId, data);
      const updatedFile = response.data;
      
      setState(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles.map(file => 
          file === fileId ? updatedFile : file
        )
      }));

      toast.success('Datei erfolgreich aktualisiert');
      return updatedFile;
    } catch (error: unknown) {
      console.error('Error updating file:', error);
      toast.error('Fehler beim Aktualisieren der Datei');
      return null;
    }
  }, [isAuthenticated]);

  // Generate thumbnail
  const generateThumbnail = useCallback(async (fileId: string, options?: { width?: number; height?: number }): Promise<string | null> => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return null;
    }

    try {
      const response = await mediaAPI.generateThumbnail(fileId, options);
      return response.data.thumbnail_url;
    } catch (error: unknown) {
      console.error('Error generating thumbnail:', error);
      toast.error('Fehler beim Generieren des Thumbnails');
      return null;
    }
  }, [isAuthenticated]);

  // Get storage usage
  const getStorageUsage = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const response = await mediaAPI.getStorageUsage();
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching storage usage:', error);
      return null;
    }
  }, [isAuthenticated]);

  // Get supported file types
  const getSupportedTypes = useCallback(async () => {
    try {
      const response = await mediaAPI.getSupportedTypes();
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching supported types:', error);
      return null;
    }
  }, []);

  // Clear uploaded files
  const clearUploadedFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFiles: []
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: null,
      uploadedFiles: [],
      error: null
    });
  }, []);

  return {
    // State
    isUploading: state.isUploading,
    progress: state.progress,
    uploadedFiles: state.uploadedFiles,
    error: state.error,

    // Actions
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    updateFile,
    generateThumbnail,
    getStorageUsage,
    getSupportedTypes,
    clearUploadedFiles,
    reset,
    validateFile
  };
}; 
