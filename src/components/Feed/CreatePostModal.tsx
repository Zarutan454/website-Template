import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, X, Music, FileType, Upload } from "lucide-react";
import { type CreatePostData } from '@/types/posts';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext.utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPostData?: CreatePostData | null;
  onPostCreated: (postData: CreatePostData) => Promise<void>;
  mode?: 'text' | 'image' | 'video';
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  pendingPostData,
  onPostCreated,
  mode = 'text',
}) => {
  const { profile } = useProfile();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { user: profileAuth } = useAuth();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Pre-fill with pending data if available
      if (pendingPostData) {
        setContent(pendingPostData.content || '');

        let sanitizedMediaUrl = pendingPostData.media_url;
        if (sanitizedMediaUrl && Array.isArray(sanitizedMediaUrl)) {
          console.warn('🚨 CRITICAL FIX: pendingPostData.media_url is array, converting to string:', sanitizedMediaUrl);
          sanitizedMediaUrl = sanitizedMediaUrl[0] || null;
        }

        if (sanitizedMediaUrl) {
          setMediaPreview(sanitizedMediaUrl as string);
          setMediaType(pendingPostData.media_type as 'image' | 'video' | 'audio' || null);
        }
        setHashtags(pendingPostData.hashtags || []);
      }
      // Fokussiere je nach Modus
      setTimeout(() => {
        if (mode === 'text' && textAreaRef.current) {
          textAreaRef.current.focus();
        } else if ((mode === 'image' || mode === 'video') && fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 100);
    } else {
      // Reset form when modal closes
      setContent('');
      setMedia(null);
      setMediaPreview(null);
      setMediaType(null);
      setHashtags([]);
    }
  }, [isOpen, pendingPostData, mode]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Hashtags automatisch erkennen
    const contentText = e.target.value;
    const hashtagRegex = /#(\w+)/g;
    const matches = contentText.match(hashtagRegex);
    
    if (matches) {
      const extractedTags = matches.map(tag => tag.substring(1));
      setHashtags(extractedTags);
    } else {
      setHashtags([]);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    
    console.log('[CreatePostModal] handleMediaChange called with type:', type, 'file:', file);
    
    if (file) {
      console.log('[CreatePostModal] File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Release previous preview URL if it exists
      if (mediaPreview && !mediaPreview.startsWith('http')) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setMedia(file);
      setMediaType(type);
      
      // Create and set preview for the selected media type
      const previewUrl = URL.createObjectURL(file);
      console.log('[CreatePostModal] Created preview URL:', previewUrl);
      setMediaPreview(previewUrl);
      
    } else {
      console.log('[CreatePostModal] No file selected');
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType(null);
    if (mediaPreview) {
      // Only revoke if it's a local object URL
      if (!mediaPreview.startsWith('http')) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaPreview(null);
    }
  };

  const uploadMediaToDjango = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[CreatePostModal] Starting media upload for file:', file.name, 'size:', file.size);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8080/api/upload/media/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('[CreatePostModal] Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CreatePostModal] Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CreatePostModal] Upload response data:', data);

      let mediaUrl = data.url;
      if (Array.isArray(mediaUrl)) {
        console.warn('🚨 PERMANENT FIX (uploadMediaToDjango): URL is array, converting to string:', mediaUrl);
        mediaUrl = mediaUrl[0] || null;
      }
      if (typeof mediaUrl !== 'string' && mediaUrl !== null) {
        mediaUrl = String(mediaUrl);
      }

      console.log('✅ PERMANENT FIX (uploadMediaToDjango): Final URL:', mediaUrl);
      return mediaUrl;
    } catch (error) {
      console.error('[CreatePostModal] Media upload error:', error);
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;
    
    switch (mediaType) {
      case 'image':
        return (
          <img 
            src={mediaPreview} 
            alt="Post preview" 
            className="w-full h-auto max-h-64 object-cover rounded-lg" 
          />
        );
      case 'video':
        return (
          <video 
            ref={videoRef}
            src={mediaPreview} 
            controls
            className="w-full h-auto max-h-64 object-contain rounded-lg"
          />
        );
      case 'audio':
        return (
          <div className="bg-dark-300 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Music size={20} className="text-primary-500" />
              <span className="text-white text-sm truncate">
                {media ? media.name : 'Audio'}
              </span>
            </div>
            <audio 
              ref={audioRef}
              src={mediaPreview} 
              controls
              className="w-full"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CreatePostModal] handleSubmit called');
    
    if (!profileAuth) {
        toast.error('You must be logged in to post.');
        return;
    }

    setIsSubmitting(true);
    let finalMediaUrl: string | null = null;
    let finalMediaType = mediaType;

    try {
        console.log('[CreatePostModal] Processing media:', { media: !!media, mediaPreview, mediaType });
        
        if (media) {
            console.log('[CreatePostModal] Uploading media file:', media.name);
            finalMediaUrl = await uploadMediaToDjango(media);
            finalMediaType = mediaType;
            console.log('[CreatePostModal] Media uploaded successfully:', finalMediaUrl);
        } else if (mediaPreview && mediaPreview.startsWith('http')) {
            console.log('[CreatePostModal] Using existing media URL:', mediaPreview);
            finalMediaUrl = mediaPreview;
            finalMediaType = mediaType;
        } else {
            console.log('[CreatePostModal] No media to process');
        }
        
        console.log('[CreatePostModal] finalMediaUrl:', finalMediaUrl);
        const postData: CreatePostData = {
            content,
            media_url: finalMediaUrl,
            media_type: finalMediaType,
            hashtags,
        };
        console.log('[CreatePostModal] postData:', postData);
        
        await onPostCreated(postData);
        console.log('[CreatePostModal] Post created successfully');

        toast.success('Post created successfully!');
        onClose();
    } catch (error) {
        console.error('[CreatePostModal] Failed to create post:', error);
        toast.error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-dark-200 text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
          <DialogDescription className="text-gray-400">
            Teile deine Gedanken mit der Community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.display_name || profile?.username || 'User'} />
              ) : null}
              <AvatarFallback className="bg-dark-300 text-white">
                {getInitials(profile?.display_name || profile?.username || 'U')}
              </AvatarFallback>
            </Avatar>
            
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Was gibt's Neues? Benutze #hashtags um Themen zu markieren"
              className="flex-1 bg-dark-300 text-white border border-gray-700 rounded-lg px-3 py-2 min-h-32 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          
          {/* Hashtags anzeigen */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Media preview */}
          {mediaPreview && (
            <div className="relative">
              {renderMediaPreview()}
              <button 
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-dark-300/80 text-white rounded-full p-1"
                title="Medien entfernen"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <label className="cursor-pointer text-gray-400 hover:text-white flex items-center gap-1">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleMediaChange(e, 'image')}
                  className="hidden" 
                />
                <Image size={18} />
                <span className="hidden sm:inline">Bild</span>
              </label>
              
              <label className="cursor-pointer text-gray-400 hover:text-white flex items-center gap-1">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={(e) => handleMediaChange(e, 'video')}
                  className="hidden" 
                />
                <Video size={18} />
                <span className="hidden sm:inline">Video</span>
              </label>
              
              <label className="cursor-pointer text-gray-400 hover:text-white flex items-center gap-1">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={(e) => handleMediaChange(e, 'audio')}
                  className="hidden" 
                />
                <Music size={18} />
                <span className="hidden sm:inline">Audio</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="border-gray-700"
                title="Abbrechen"
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                variant="default" 
                disabled={(!content.trim() && !media) || isSubmitting}
                title="Beitrag posten"
              >
                {isSubmitting ? 'Wird gepostet...' : 'Posten'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;

