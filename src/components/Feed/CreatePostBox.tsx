import React, { useState, useRef } from 'react';
import { Image, Gift, Send, Smile, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type CreatePostData } from '@/types/posts';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prevContent => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const uploadMediaToDjango = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[CreatePostBox] Starting media upload for file:', file.name, 'size:', file.size);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8000/api/upload/media/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('[CreatePostBox] Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CreatePostBox] Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
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
      return mediaUrl;
    } catch (error) {
      console.error('[CreatePostBox] Media upload error:', error);
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('[CreatePostBox] handleFileChange called with file:', file);
    
    if (file) {
      console.log('[CreatePostBox] File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Determine media type
      let type: 'image' | 'video' | 'audio' | null = null;
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      } else {
        toast.error('Unsupported file type. Please select an image, video, or audio file.');
        return;
      }
      
      // Release previous preview URL if it exists
      if (mediaPreview && !mediaPreview.startsWith('http')) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setMedia(file);
      setMediaType(type);
      
      // Create and set preview for the selected media type
      const previewUrl = URL.createObjectURL(file);
      console.log('[CreatePostBox] Created preview URL:', previewUrl);
      setMediaPreview(previewUrl);
      
    } else {
      console.log('[CreatePostBox] No file selected');
    }
  };

  const handleRemoveMedia = () => {
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

  const handleSubmit = async () => {
    if (!profile) return;
    if (!content.trim() && !media) return;
    
    setIsUploading(true);
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
      
      onCreatePost(postData);
      console.log('[CreatePostBox] Post created successfully');

      toast.success('Post created successfully!');
      setContent('');
      handleRemoveMedia();
    } catch (error) {
      console.error('[CreatePostBox] Failed to create post:', error);
      toast.error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;
    
    switch (mediaType) {
      case 'image':
        return (
          <div className="relative mb-3">
            <img 
              src={mediaPreview} 
              alt="Post preview" 
              className="w-full h-auto max-h-64 object-cover rounded-lg" 
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={handleRemoveMedia}
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
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={handleRemoveMedia}
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
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={handleRemoveMedia}
            >
              <X size={16} />
            </Button>
          </div>
        );
      default:
        return null;
    }
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
              <AvatarImage src={profile?.avatar_url ? `${API_BASE_URL}${profile.avatar_url}` : ''} alt={profile?.username} />
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
            disabled={isLoading || !profile || isUploading}
          />

          {renderMediaPreview()}

          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*"
                aria-label="File uploader"
                disabled={isUploading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-400 hover:text-green-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !profile || isUploading}
              >
                <Image size={16} className="mr-2" />
                <span className="hidden sm:inline">Foto/Video</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-400 hover:text-blue-400 transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isLoading || !profile || isUploading}
              >
                <Smile size={16} className="mr-2" />
                <span className="hidden sm:inline">Emoji</span>
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={(!content.trim() && !media) || isLoading || !profile || isUploading}
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
