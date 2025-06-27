import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Video, Upload, Loader2, Image } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { useReels } from '../../hooks/useReels';
import { toast } from 'sonner';

interface ReelCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReelCreator: React.FC<ReelCreatorProps> = ({ isOpen, onClose }) => {
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const { createReel } = useReels();
  
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Bitte wähle ein Video aus');
      return;
    }
    
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      toast.error('Die Datei ist zu groß (max. 50MB)');
      return;
    }
    
    setSelectedVideoFile(file);
    
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };
  
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wähle ein Bild aus');
      return;
    }
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('Die Datei ist zu groß (max. 5MB)');
      return;
    }
    
    setSelectedThumbnailFile(file);
    
    const url = URL.createObjectURL(file);
    setThumbnailPreviewUrl(url);
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleCreateReel = async () => {
    try {
      if (!selectedVideoFile) {
        toast.error('Bitte wähle ein Video aus');
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(0);
      
      await createReel.mutateAsync({
        videoFile: selectedVideoFile,
        thumbnailFile: selectedThumbnailFile || undefined,
        caption: caption.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        onUploadProgress: (progress) => {
          setUploadProgress(progress.percentage);
        }
      });
      
      setSelectedVideoFile(null);
      setSelectedThumbnailFile(null);
      setVideoPreviewUrl(null);
      setThumbnailPreviewUrl(null);
      setCaption('');
      setTags([]);
      onClose();
    } catch (error) {
      console.error('Error creating reel:', error);
      toast.error('Fehler beim Erstellen des Reels');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  React.useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [videoPreviewUrl, thumbnailPreviewUrl]);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">Reel erstellen</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isUploading}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Video upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Video (max. 60 Sek.)</label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => videoInputRef.current?.click()}
            >
              {videoPreviewUrl ? (
                <video 
                  src={videoPreviewUrl} 
                  controls
                  className="max-h-64 w-full object-contain rounded-lg"
                />
              ) : (
                <>
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Klicke hier, um ein Video auszuwählen oder ziehe es hierher
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Unterstützte Formate: MP4, WebM (max. 50MB)
                  </p>
                </>
              )}
              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleVideoSelect}
                aria-label="Video für Reel hochladen"
              />
            </div>
          </div>
          
          {/* Thumbnail upload (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Thumbnail (optional)</label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              {thumbnailPreviewUrl ? (
                <img 
                  src={thumbnailPreviewUrl} 
                  alt="Thumbnail" 
                  className="max-h-32 object-contain rounded-lg"
                />
              ) : (
                <>
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center text-sm">
                    Klicke hier, um ein Thumbnail auszuwählen (optional)
                  </p>
                </>
              )}
              <input
                type="file"
                ref={thumbnailInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailSelect}
                aria-label="Thumbnail für Reel hochladen"
              />
            </div>
          </div>
          
          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Beschreibung</label>
            <Textarea
              placeholder="Beschreibe dein Reel..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {caption.length}/500
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (max. 10)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary/70"
                    aria-label={`Tag ${tag} entfernen`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tag hinzufügen (Enter drücken)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={addTag}
                disabled={tags.length >= 10}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                +
              </Button>
            </div>
            {tags.length >= 10 && (
              <p className="text-xs text-muted-foreground">
                Maximale Anzahl an Tags erreicht (10)
              </p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-background z-10">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button onClick={handleCreateReel} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen... {uploadProgress > 0 && `${uploadProgress}%`}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Veröffentlichen
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReelCreator;
