
import React, { useState, useCallback, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image, X, Camera, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useMining } from '@/hooks/useMining';
import { supabase } from '@/lib/supabase';

interface CreatePostModalProps {
  showModal: boolean;
  onClose: () => void;
  onCreatePost: (content: string, mediaUrl?: string | null, mediaType?: string | null) => Promise<boolean>;
  darkMode?: boolean;
  showMiningRewards?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  showModal,
  onClose,
  onCreatePost,
  darkMode = false,
  showMiningRewards = false
}) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { recordActivity, isMining } = useMining();

  const clearMedia = useCallback(() => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  }, []);

  const handleMediaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
      setError('Invalid file type. Please upload an image or video.');
      return;
    }
    
    // Validate file size (8MB limit)
    if (file.size > 8 * 1024 * 1024) {
      setError('File too large. Maximum size is 8MB.');
      return;
    }
    
    setMediaFile(file);
    setMediaType(file.type);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
  }, []);

  const uploadMedia = useCallback(async (): Promise<string | null> => {
    if (!mediaFile) return null;
    
    try {
      setIsUploading(true);
      
      // Generate unique filename
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `post_media/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      
      // Upload directly to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, mediaFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw new Error(error.message);
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      setError('Failed to upload media. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [mediaFile]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && !mediaFile) {
      setError('Please add some content or media to your post.');
      return;
    }
    
    if (isSubmitting || isUploading) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Upload media if present
      let uploadedMediaUrl = null;
      if (mediaFile) {
        uploadedMediaUrl = await uploadMedia();
        if (!uploadedMediaUrl && mediaFile) {
          setError('Failed to upload media. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create post
      const success = await onCreatePost(content, uploadedMediaUrl, mediaType);
      
      if (success) {
        // Record mining activity
        if (showMiningRewards && isMining) {
          try {
            await recordActivity('post', 50, 5);
            toast({
              title: "Post Created",
              description: "You earned +5 BSN tokens for creating a post!"
            });
          } catch (err) {
          }
        } else {
          toast({
            title: "Post Created",
            description: "Your post has been shared successfully."
          });
        }
        
        // Reset form
        setContent('');
        clearMedia();
        onClose();
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, mediaFile, mediaType, isSubmitting, isUploading, onCreatePost, uploadMedia, clearMedia, onClose, showMiningRewards, isMining, recordActivity, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Convert to a form-like ChangeEvent to reuse our existing handleMediaChange
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Create a fake event object that has the file
    const fakeEvent = {
      target: {
        files: [file],
        value: ''
      }
    } as unknown as ChangeEvent<HTMLInputElement>;
    
    handleMediaChange(fakeEvent);
  }, [handleMediaChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Allow drop
  }, []);

  return (
    <Dialog open={showModal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-[600px]",
        darkMode ? "bg-gray-900 text-white border-gray-800" : ""
      )}>
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className={cn(
              "min-h-[120px] resize-none",
              darkMode ? "bg-gray-800 border-gray-700" : ""
            )}
          />
          
          {mediaPreview ? (
            <div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
              {mediaType?.startsWith('image/') ? (
                <img 
                  src={mediaPreview} 
                  alt="Preview" 
                  className="max-h-[300px] w-full object-contain" 
                />
              ) : (
                <video 
                  src={mediaPreview} 
                  controls 
                  className="max-h-[300px] w-full" 
                />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600"
                onClick={clearMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-8 text-center cursor-pointer",
                darkMode ? "border-gray-700 hover:border-gray-600" : "border-gray-300 hover:border-gray-400"
              )}
              onClick={() => document.getElementById('media-upload')?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center gap-2">
                <Image className="h-10 w-10 text-gray-400" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Label htmlFor="media-upload" className="cursor-pointer text-primary">
                    Click to upload
                  </Label>
                  {" or drag and drop"}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Images or videos up to 8MB
                </p>
              </div>
              <input
                id="media-upload"
                type="file"
                accept="image/*, video/*"
                className="hidden"
                onChange={handleMediaChange}
              />
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {showMiningRewards && isMining && (
            <div className="rounded-md bg-primary-100 dark:bg-primary-900/20 p-3 text-sm">
              <p className="text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                <Camera className="h-4 w-4" />
                <span>You'll earn +5 BSN tokens for creating this post!</span>
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading || (!content.trim() && !mediaFile)}>
            {(isSubmitting || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isUploading ? 'Uploading...' : isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
