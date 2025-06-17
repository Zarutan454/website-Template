
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, X, Music, FileType, Upload } from "lucide-react";
import { type CreatePostData } from '@/types/posts';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPostData?: CreatePostData | null;
  onPostCreated: (postData: CreatePostData) => Promise<any>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  isOpen, 
  onClose,
  pendingPostData,
  onPostCreated
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Pre-fill with pending data if available
      if (pendingPostData) {
        setContent(pendingPostData.content || '');
        if (pendingPostData.media_url) {
          setMediaPreview(pendingPostData.media_url);
          setMediaType(pendingPostData.media_type as 'image' | 'video' | 'audio' || null);
        }
        setHashtags(pendingPostData.hashtags || []);
      }
    } else {
      // Reset form when modal closes
      setContent('');
      setMedia(null);
      setMediaPreview(null);
      setMediaType(null);
      setHashtags([]);
    }
  }, [isOpen, pendingPostData]);

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
    
    if (file) {
      // Release previous preview URL if it exists
      if (mediaPreview && !mediaPreview.startsWith('http')) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setMedia(file);
      setMediaType(type);
      
      // Create and set preview for the selected media type
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
      
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
    
    if (!content.trim() && !media) {
      toast.error('Bitte füge Text oder Medien hinzu');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let mediaUrl = pendingPostData?.media_url || null;
      let finalMediaType = pendingPostData?.media_type || null;
      
      // Upload media if selected
      if (media && mediaType) {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          throw new Error('User not authenticated');
        }
        
        const fileExt = media.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `posts/${userData.user.id}/${fileName}`;
        
        console.log(`Uploading ${mediaType} to storage:`, filePath);
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(filePath, media);
          
        if (uploadError) {
          console.error(`Error uploading ${mediaType}:`, uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data } = supabase.storage
          .from('content')
          .getPublicUrl(filePath);
          
        mediaUrl = data.publicUrl;
        finalMediaType = mediaType;
        console.log(`${mediaType} uploaded successfully, URL:`, mediaUrl);
      }
      
      // Create post
      const postData: CreatePostData = {
        content: content.trim(),
        media_url: mediaUrl,
        media_type: finalMediaType || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined
      };
      
      console.log('Submitting post data:', postData);
      const result = await onPostCreated(postData);
      
      if (result && result.success) {
        console.log('Post created successfully:', result);
        toast.success('Beitrag erfolgreich erstellt');
        onClose();
      } else {
        console.error('Failed to create post:', result);
        toast.error('Fehler beim Erstellen des Beitrags');
      }
      
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Fehler beim Erstellen des Beitrags');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <AvatarImage src={profile.avatar_url} alt={profile.display_name || 'User'} />
              ) : null}
              <AvatarFallback className="bg-dark-300 text-white">
                {getInitials(profile?.display_name)}
              </AvatarFallback>
            </Avatar>
            
            <textarea
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
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <label className="cursor-pointer text-gray-400 hover:text-white flex items-center gap-1">
                <input 
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
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                variant="default" 
                disabled={(!content.trim() && !media) || isSubmitting}
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
