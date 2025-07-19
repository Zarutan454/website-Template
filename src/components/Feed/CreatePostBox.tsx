import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image, Gift, Send, Smile, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type CreatePostData } from '@/types/posts';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { toast } from 'sonner';
import { getAvatarUrl } from '../../utils/api';

// Konfigurierbare API-URLs
const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8080';
const UPLOAD_ENDPOINT = `${API_BASE_URL}/api/upload/media/`;

// Konstanten für Validierung
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg']
};

interface CreatePostBoxProps {
  darkMode?: boolean;
  onCreatePost: (postData: CreatePostData) => void;
  initialContent?: string;
}

const CreatePostBox: React.FC<CreatePostBoxProps> = ({ 
  darkMode = true, 
  onCreatePost,
  initialContent = ''
}) => {
  const { user: profile, isLoading } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memory cleanup für Preview URLs
  useEffect(() => {
    return () => {
      if (mediaPreview && !mediaPreview.startsWith('http')) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const getInitials = useCallback((name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, []);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setContent(prevContent => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
  }, []);

  // File validation
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Größe prüfen
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `Datei zu groß. Maximum: ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }

    // Typ prüfen
    const allAllowedTypes = [...ALLOWED_FILE_TYPES.image, ...ALLOWED_FILE_TYPES.video, ...ALLOWED_FILE_TYPES.audio];
    if (!allAllowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Nicht unterstützter Dateityp. Nur Bilder, Videos und Audio erlaubt.' };
    }

    return { isValid: true };
  }, []);

  const uploadMediaToDjango = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[CreatePostBox] Starting media upload for file:', file.name, 'size:', file.size);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Kein Access Token gefunden');
      }

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('[CreatePostBox] Upload response data:', data);

              let mediaUrl = data.url;
              if (Array.isArray(mediaUrl)) {
                console.warn('🚨 PERMANENT FIX (CreatePostBox): URL is array, converting to string:', mediaUrl);
                mediaUrl = mediaUrl[0] || null;
              }
              if (typeof mediaUrl !== 'string' && mediaUrl !== null) {
                mediaUrl = String(mediaUrl);
              }

              console.log('✅ PERMANENT FIX (CreatePostBox): Final URL:', mediaUrl);
              resolve(mediaUrl);
            } catch (error) {
              reject(new Error('Ungültige Server-Antwort'));
            }
          } else {
            reject(new Error(`Upload fehlgeschlagen: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Netzwerkfehler beim Upload'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload-Timeout'));
        });

        xhr.open('POST', UPLOAD_ENDPOINT);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 30000; // 30 Sekunden Timeout
        xhr.send(formData);
      });
    } catch (error) {
      console.error('[CreatePostBox] Media upload error:', error);
      throw new Error(`Upload fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('[CreatePostBox] handleFileChange called with file:', file);
    
    if (!file) {
      console.log('[CreatePostBox] No file selected');
      return;
    }

    // File validieren
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Datei-Validierung fehlgeschlagen');
      return;
    }

    console.log('[CreatePostBox] File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    // Media type bestimmen
    let type: 'image' | 'video' | 'audio' | null = null;
    if (ALLOWED_FILE_TYPES.image.includes(file.type)) {
      type = 'image';
    } else if (ALLOWED_FILE_TYPES.video.includes(file.type)) {
      type = 'video';
    } else if (ALLOWED_FILE_TYPES.audio.includes(file.type)) {
      type = 'audio';
    }
    
    // Vorherige Preview URL aufräumen
    if (mediaPreview && !mediaPreview.startsWith('http')) {
      URL.revokeObjectURL(mediaPreview);
    }
    
    setMedia(file);
    setMediaType(type);
    setError(null);
    
    // Preview erstellen
    const previewUrl = URL.createObjectURL(file);
    console.log('[CreatePostBox] Created preview URL:', previewUrl);
    setMediaPreview(previewUrl);
  }, [mediaPreview, validateFile]);

  const handleRemoveMedia = useCallback(() => {
    setMedia(null);
    setMediaType(null);
    setError(null);
    setUploadProgress(0);
    
    if (mediaPreview) {
      // Nur aufräumen wenn es eine lokale Object URL ist
      if (!mediaPreview.startsWith('http')) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaPreview(null);
    }
  }, [mediaPreview]);

  const handleSubmit = useCallback(async () => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um zu posten');
      return;
    }
    
    if (!content.trim() && !media) {
      toast.error('Bitte gib einen Text ein oder wähle eine Datei aus');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    let finalMediaUrl: string | null = null;
    let finalMediaType = mediaType;

    try {
      console.log('[CreatePostBox] Processing media:', { media: !!media, mediaPreview, mediaType });
      
      if (media) {
        console.log('[CreatePostBox] Uploading media file:', media.name);
        finalMediaUrl = await uploadMediaToDjango(media);
        finalMediaType = mediaType;
        console.log('[CreatePostBox] Media uploaded successfully:', finalMediaUrl);
      } else if (mediaPreview && mediaPreview.startsWith('http')) {
        console.log('[CreatePostBox] Using existing media URL:', mediaPreview);
        finalMediaUrl = mediaPreview;
        finalMediaType = mediaType;
      } else {
        console.log('[CreatePostBox] No media to process');
      }
      
      console.log('[CreatePostBox] finalMediaUrl:', finalMediaUrl);
      const postData: CreatePostData = {
        content,
        media_url: finalMediaUrl,
        media_type: finalMediaType,
        hashtags: [],
      };
      console.log('[CreatePostBox] postData:', postData);
      
      await onCreatePost(postData);
      console.log('[CreatePostBox] Post created successfully');

      toast.success('Post erfolgreich erstellt!');
      setContent('');
      handleRemoveMedia();
    } catch (error) {
      console.error('[CreatePostBox] Failed to create post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setError(errorMessage);
      toast.error(`Fehler beim Erstellen des Posts: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [profile, content, media, mediaPreview, mediaType, uploadMediaToDjango, onCreatePost, handleRemoveMedia]);

  const renderMediaPreview = useCallback(() => {
    if (!mediaPreview) return null;
    
    switch (mediaType) {
      case 'image':
        return (
          <div className="relative mb-3">
            <img 
              src={mediaPreview} 
              alt="Post Vorschau" 
              className="w-full h-auto max-h-64 object-cover rounded-lg" 
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={handleRemoveMedia}
              aria-label="Medien entfernen"
            >
              <X size={16} />
            </Button>
          </div>
        );
      case 'video':
        return (
          <div className="relative mb-3">
            <video 
              src={mediaPreview} 
              controls
              className="w-full h-auto max-h-64 object-contain rounded-lg"
              aria-label="Video Vorschau"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={handleRemoveMedia}
              aria-label="Video entfernen"
            >
              <X size={16} />
            </Button>
          </div>
        );
      case 'audio':
        return (
          <div className="relative mb-3 bg-dark-300 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-white text-sm truncate">
                {media ? media.name : 'Audio'}
              </span>
            </div>
            <audio 
              src={mediaPreview} 
              controls
              className="w-full"
              aria-label="Audio Vorschau"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={handleRemoveMedia}
              aria-label="Audio entfernen"
            >
              <X size={16} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [mediaPreview, mediaType, media, handleRemoveMedia]);

  const renderUploadProgress = () => {
    if (!isUploading || uploadProgress === 0) return null;
    
    return (
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Upload läuft... {uploadProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  };

  return (
    <div className={`${darkMode ? 'bg-dark-200' : 'bg-white'} rounded-xl p-6 mb-6 border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          {isLoading ? (
            <AvatarFallback>
              <Loader2 className="h-5 w-5 animate-spin" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage 
                src={profile?.avatar_url 
                  ? getAvatarUrl(profile.avatar_url)
                  : ''} 
                alt={profile?.username} 
              />
              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-600 text-white">
                {getInitials(profile?.display_name)}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            placeholder={
              isLoading 
              ? "Lade..." 
              : profile 
                ? `Was machst du gerade, ${profile.display_name || profile.username}?`
                : "Bitte melde dich an, um zu posten."
            }
            className={`border ${darkMode ? 'bg-dark-100 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'} rounded-md p-3 w-full mb-3 min-h-[100px]`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isUploading}
            aria-label="Post Inhalt"
          />

          {renderError()}
          {renderUploadProgress()}
          {renderMediaPreview()}

          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*"
                aria-label="Datei auswählen"
                disabled={isUploading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-400 hover:text-green-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Foto oder Video hinzufügen"
              >
                <Image size={16} className="mr-2" />
                <span className="hidden sm:inline">Foto/Video</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-400 hover:text-blue-400 transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isUploading}
                aria-label="Emoji auswählen"
              >
                <Smile size={16} className="mr-2" />
                <span className="hidden sm:inline">Emoji</span>
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={(!content.trim() && !media) || isUploading}
              aria-label="Post veröffentlichen"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Posten'
              )}
            </Button>
          </div>
          {showEmojiPicker && (
            <div className="mt-2">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={darkMode ? Theme.DARK : Theme.LIGHT}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostBox;

