
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ImageIcon, XIcon, SendIcon, FileUpIcon } from 'lucide-react';
import { useMining } from '@/hooks/useMining';
import { useAchievementProgress } from '@/hooks/mining/achievements/useAchievementProgress';
import { useProfile } from '@/hooks/useProfile';
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
  darkMode = true,
  showMiningRewards = true
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { recordActivity } = useMining();
  const { trackSocialActivity } = useAchievementProgress();
  const { profile } = useProfile();
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Die Datei ist zu groß. Maximale Größe: 10MB");
      return;
    }
    
    // Check file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    
    if (validImageTypes.includes(selectedFile.type) || validVideoTypes.includes(selectedFile.type)) {
      setMediaFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setMediaPreviewUrl(previewUrl);
    } else {
      toast.error("Dieser Dateityp wird nicht unterstützt.");
    }
  };
  
  const clearMediaSelection = () => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Bitte gib einen Inhalt ein oder füge ein Bild/Video hinzu.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let mediaUrl = null;
      let mediaType = null;
      
      // Upload media if selected
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${profile?.id}/posts/${fileName}`;
        
        // Determine media type
        if (mediaFile.type.startsWith('image/')) {
          mediaType = 'image';
        } else if (mediaFile.type.startsWith('video/')) {
          mediaType = 'video';
        }
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('media')
          .upload(filePath, mediaFile);
        
        if (uploadError) {
          throw new Error(`Fehler beim Hochladen: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('media')
          .getPublicUrl(filePath);
          
        mediaUrl = urlData.publicUrl;
      }
      
      // Create post with optional media
      const success = await onCreatePost(content, mediaUrl, mediaType);
      
      if (success) {
        setContent('');
        clearMediaSelection();
        onClose();
        
        // Record post creation activity for mining if enabled
        if (showMiningRewards && profile) {
          await recordActivity('post', 20, 2);
          await trackSocialActivity(profile.id, 'post');
        }
        
        toast.success("Beitrag erfolgreich erstellt!");
      } else {
        toast.error("Fehler beim Erstellen des Beitrags.");
      }
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-lg rounded-lg shadow-lg ${darkMode ? 'bg-dark-100' : 'bg-white'} overflow-hidden`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">Neuen Beitrag erstellen</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue="text" value={activeTab} onValueChange={handleTabChange}>
          <div className="p-4 border-b border-gray-700">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" disabled={isSubmitting}>
                Text
              </TabsTrigger>
              <TabsTrigger value="media" disabled={isSubmitting}>
                Bild/Video
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-4">
            <TabsContent value="text" className="mt-0">
              <textarea
                className={`w-full p-3 rounded-lg resize-none ${darkMode ? 'bg-dark-200 text-white' : 'bg-gray-100 text-black'} focus:outline-none`}
                rows={6}
                placeholder="Was gibt's Neues?"
                value={content}
                onChange={handleContentChange}
                disabled={isSubmitting}
              />
            </TabsContent>
            
            <TabsContent value="media" className="mt-0">
              {mediaPreviewUrl ? (
                <div className="relative">
                  {mediaFile?.type.startsWith('image/') ? (
                    <img 
                      src={mediaPreviewUrl} 
                      alt="Preview" 
                      className="w-full rounded-lg max-h-96 object-contain" 
                    />
                  ) : (
                    <video 
                      src={mediaPreviewUrl} 
                      className="w-full rounded-lg max-h-96" 
                      controls 
                    />
                  )}
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2"
                    onClick={clearMediaSelection}
                    disabled={isSubmitting}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <input
                    type="file"
                    accept="image/*, video/mp4, video/quicktime, video/webm"
                    className="hidden"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <FileUpIcon className="h-5 w-5 mr-2" />
                    Bild/Video hochladen
                  </Button>
                  <p className="mt-2 text-sm text-gray-400">
                    Unterstützte Formate: JPG, PNG, GIF, MP4, WEBM (max. 10MB)
                  </p>
                </div>
              )}
              <textarea
                className={`w-full p-3 mt-4 rounded-lg resize-none ${darkMode ? 'bg-dark-200 text-white' : 'bg-gray-100 text-black'} focus:outline-none`}
                rows={3}
                placeholder="Bildunterschrift hinzufügen..."
                value={content}
                onChange={handleContentChange}
                disabled={isSubmitting}
              />
            </TabsContent>
          </div>
        </Tabs>
        
        {showMiningRewards && (
          <div className="px-4 py-2 bg-primary/10 text-primary text-sm">
            💰 Erhalte +20 Punkte und +2 BSN für das Erstellen eines Beitrags
          </div>
        )}
        
        <div className="p-4 flex justify-end">
          <Button
            variant="outline"
            className="mr-2"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !mediaFile)}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-current rounded-full" />
                Posting...
              </div>
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" />
                Posten
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;
