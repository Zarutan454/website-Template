import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Video, Type, Upload, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useStories } from '../../hooks/useStories';
import { toast } from 'sonner';

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'text'>('image');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createStory } = useStories();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (activeTab === 'image' && !file.type.startsWith('image/')) {
      toast.error('Bitte wähle ein Bild aus');
      return;
    }
    
    if (activeTab === 'video' && !file.type.startsWith('video/')) {
      toast.error('Bitte wähle ein Video aus');
      return;
    }
    
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error('Die Datei ist zu groß (max. 10MB)');
      return;
    }
    
    setSelectedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'image' | 'video' | 'text');
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
  };
  
  const handleCreateStory = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      if (activeTab === 'text' && !caption.trim()) {
        toast.error('Bitte gib einen Text ein');
        setIsUploading(false);
        return;
      }
      
      if ((activeTab === 'image' || activeTab === 'video') && !selectedFile) {
        toast.error(`Bitte wähle ${activeTab === 'image' ? 'ein Bild' : 'ein Video'} aus`);
        setIsUploading(false);
        return;
      }
      
      await createStory.mutateAsync({
        file: selectedFile || undefined,
        type: activeTab,
        caption: caption.trim() || undefined,
        onUploadProgress: (progress) => {
          setUploadProgress(progress.percentage);
        }
      });
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Fehler beim Erstellen der Story');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
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
        className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Story erstellen</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isUploading}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue="image" value={activeTab} onValueChange={handleTabChange} className="p-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Bild
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 object-contain rounded-lg"
                />
              ) : (
                <>
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Klicke hier, um ein Bild auszuwählen oder ziehe es hierher
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                aria-label="Bild für Story hochladen"
              />
            </div>
            
            <Textarea
              placeholder="Beschreibung (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right">
              {caption.length}/200
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <video 
                  src={previewUrl} 
                  controls
                  className="max-h-64 w-full object-contain rounded-lg"
                />
              ) : (
                <>
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Klicke hier, um ein Video auszuwählen oder ziehe es hierher
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleFileSelect}
                aria-label="Video für Story hochladen"
              />
            </div>
            
            <Textarea
              placeholder="Beschreibung (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right">
              {caption.length}/200
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Dein Text hier..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none h-40"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right">
              {caption.length}/200
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button onClick={handleCreateStory} disabled={isUploading}>
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

export default StoryCreator;
