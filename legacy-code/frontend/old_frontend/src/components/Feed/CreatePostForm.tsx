
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { Image, Send, X, Smile, Youtube, Upload, Link, Gift, Share } from 'lucide-react';
import EmojiPicker, { Theme as EmojiPickerTheme } from 'emoji-picker-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useMining } from '@/hooks/useMining';
import { supabase } from '@/lib/supabase';

interface CreatePostFormProps {
  onCreatePost: (content: string, mediaUrl?: string | null) => Promise<boolean>;
  darkMode?: boolean;
  showMiningRewards?: boolean;
  onClose?: () => void;
  initialTab?: string;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ 
  onCreatePost, 
  darkMode = true,
  showMiningRewards = false,
  onClose,
  initialTab = 'text'
}) => {
  const { profile } = useProfile();
  const { recordActivity } = useMining();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputTab, setInputTab] = useState(initialTab);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Setze den Tab beim ersten Rendern
  useEffect(() => {
    setInputTab(initialTab);
  }, [initialTab]);
  
  const handlePost = async () => {
    if (!content.trim() && !mediaUrl) {
      toast.error("Bitte gib einen Text oder ein Bild ein");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await onCreatePost(content, mediaUrl);
      
      if (success) {
        setContent('');
        setMediaUrl(null);
        toast.success("Beitrag erfolgreich veröffentlicht");
        
        if (showMiningRewards) {
          try {
            await recordActivity('post');
            toast.success("Mining-Geschwindigkeit erhöht für deinen Beitrag", {
              icon: "🚀",
            });
          } catch (error) {
          }
        }
        
        if (onClose) {
          onClose();
        }
      } else {
        toast.error("Fehler beim Veröffentlichen des Beitrags");
      }
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Fehler beim Veröffentlichen des Beitrags");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEmojiSelect = (emoji: any) => {
    setContent(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      toast.error("Nur Bilder und Videos werden unterstützt");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Die Datei darf nicht größer als 10MB sein");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a randomized filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `posts/${profile?.id || 'anonymous'}/${fileName}`;
      
      // Manual progress tracking
      const uploadTask = async () => {
        // Upload the file to Supabase storage without onUploadProgress
        const { data, error } = await supabase.storage
          .from('content')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          throw error;
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('content')
          .getPublicUrl(filePath);
          
        setMediaUrl(urlData.publicUrl);
        toast.success("Datei erfolgreich hochgeladen");
        setInputTab('text'); // Switch back to text tab after successful upload
      };

      // Simulate progress for better UX
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress > 95) {
            clearInterval(interval);
            progress = 95;
          }
          setUploadProgress(Math.min(Math.round(progress), 95));
        }, 300);
        
        return () => clearInterval(interval);
      };
      
      const clearSimulation = simulateProgress();
      await uploadTask();
      clearSimulation();
      setUploadProgress(100);
      
    } catch (error: any) {
      console.error("Fehler beim Hochladen:", error);
      toast.error(`Fehler beim Hochladen: ${error.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleMediaUrlSubmit = (url: string) => {
    if (url.trim()) {
      setMediaUrl(url);
      setInputTab('text');
      toast.success("Medien-URL hinzugefügt");
    }
  };
  
  if (!profile) return null;
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  // Bestimme den Icon und Titel basierend auf dem aktiven Tab
  const getTabIcon = () => {
    switch(inputTab) {
      case 'media': return <Image size={24} className="mr-2" />;
      case 'airdrop': return <Gift size={24} className="mr-2" />;
      case 'share': return <Share size={24} className="mr-2" />;
      default: return null;
    }
  };
  
  const getTabTitle = () => {
    switch(inputTab) {
      case 'media': return "Foto/Video hinzufügen";
      case 'airdrop': return "Airdrop erstellen";
      case 'share': return "Inhalt teilen";
      default: return "Erstelle einen Beitrag";
    }
  };
  
  return (
    <div className={`${darkMode ? 'bg-dark-200 text-white' : 'bg-white text-gray-900'} p-4 rounded-xl`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          {getTabIcon()}
          {getTabTitle()}
        </h2>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X size={20} />
          </Button>
        )}
      </div>
      
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
          ) : null}
          <AvatarFallback className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            {getInitials(profile.display_name || profile.username)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="mb-2 font-medium">
            {profile.display_name || profile.username}
          </div>
          
          <Tabs value={inputTab} onValueChange={setInputTab} className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="media">Bild/Video</TabsTrigger>
              <TabsTrigger value="airdrop">Airdrop</TabsTrigger>
              <TabsTrigger value="share">Teilen</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="mt-0">
              <Textarea
                placeholder={`Was gibt's Neues, ${profile.display_name || profile.username}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`min-h-[120px] resize-none ${darkMode ? 'bg-dark-100 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              />
            </TabsContent>
            
            <TabsContent value="media" className="mt-0">
              <div className="space-y-4">
                {/* Datei-Upload-Bereich */}
                <div className={`border ${darkMode ? 'border-gray-700 bg-dark-100' : 'border-gray-200 bg-gray-50'} rounded-lg p-4`}>
                  <div className="text-center mb-3">
                    <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                    <h3 className="font-medium">Bild oder Video hochladen</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, GIF oder MP4 (max. 10MB)
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="relative"
                    >
                      <span>Datei auswählen</span>
                    </Button>
                  </div>
                  
                  {isUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-primary-500 h-2.5 rounded-full" 
                          style={{width: `${uploadProgress}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-1">{uploadProgress}% hochgeladen</p>
                    </div>
                  )}
                </div>
                
                {/* Alternativ: URL-Eingabe */}
                <div className="mt-4">
                  <p className="text-sm mb-2 text-center text-muted-foreground">Oder füge eine URL ein:</p>
                  <div className="flex">
                    <input
                      type="url"
                      placeholder="Bild- oder Video-URL einfügen"
                      className={`flex-1 px-3 py-2 rounded-l-md ${darkMode ? 'bg-dark-100 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleMediaUrlSubmit((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <Button 
                      className="rounded-l-none"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        handleMediaUrlSubmit(input.value);
                      }}
                    >
                      <Link size={16} className="mr-2" /> Hinzufügen
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="airdrop" className="mt-0">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-100' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-center mb-4">
                  <Gift size={32} className="mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-medium text-lg">Airdrop erstellen</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verteile Token oder NFTs an deine Community
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Was möchtest du verteilen?</label>
                    <select className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-200'} border`}>
                      <option value="token">Token</option>
                      <option value="nft">NFT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Beschreibung (optional)</label>
                    <Textarea
                      placeholder="Beschreibe deinen Airdrop..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`resize-none ${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-200'}`}
                      rows={3}
                    />
                  </div>
                  
                  <div className="mt-2 text-center">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        toast.info("Airdrop-Funktion wird noch implementiert");
                        // Hier würden wir zum Airdrop-Creator navigieren
                      }}
                    >
                      <Gift size={16} className="mr-2" />
                      Airdrop konfigurieren
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="share" className="mt-0">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-100' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-center mb-4">
                  <Share size={32} className="mx-auto mb-2 text-blue-500" />
                  <h3 className="font-medium text-lg">Inhalt teilen</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Teile einen Beitrag, Token oder NFT
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Was möchtest du teilen?</label>
                    <select className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-200'} border`}>
                      <option value="post">Beitrag</option>
                      <option value="token">Token</option>
                      <option value="nft">NFT</option>
                      <option value="url">Externe URL</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Link oder ID</label>
                    <input
                      type="text"
                      placeholder="Gib die ID oder URL ein..."
                      className={`w-full px-3 py-2 rounded-md ${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-200'} border`}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Kommentar (optional)</label>
                    <Textarea
                      placeholder="Füge einen Kommentar hinzu..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`resize-none ${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-200'}`}
                      rows={3}
                    />
                  </div>
                  
                  <div className="mt-2 text-center">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast.info("Teilen-Funktion wird noch implementiert");
                      }}
                    >
                      <Share size={16} className="mr-2" />
                      Inhalt suchen
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="youtube" className="mt-0">
              <div className="space-y-2">
                <div className="flex">
                  <input
                    type="url"
                    placeholder="YouTube-Video-URL einfügen"
                    className={`flex-1 px-3 py-2 rounded-l-md ${darkMode ? 'bg-dark-100 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setContent(prev => prev + " " + (e.target as HTMLInputElement).value);
                        setInputTab('text');
                        toast.success("YouTube-Link hinzugefügt");
                      }
                    }}
                  />
                  <Button 
                    className="rounded-l-none"
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling as HTMLInputElement;
                      setContent(prev => prev + " " + input.value);
                      input.value = '';
                      setInputTab('text');
                      toast.success("YouTube-Link hinzugefügt");
                    }}
                  >
                    <Youtube size={16} className="mr-2" /> Hinzufügen
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Füge einen YouTube-Link ein, um das Video direkt in deinem Beitrag einzubetten.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          {mediaUrl && (
            <div className="mt-3 relative rounded-md overflow-hidden">
              {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img 
                  src={mediaUrl} 
                  alt="Media preview" 
                  className="w-full h-auto max-h-60 object-cover"
                />
              ) : mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  src={mediaUrl} 
                  controls
                  className="w-full h-auto max-h-60 object-cover"
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Media preview" 
                  className="w-full h-auto max-h-60 object-cover"
                />
              )}
              <Button 
                variant="destructive" 
                size="icon"
                className="absolute top-2 right-2 rounded-full opacity-90"
                onClick={() => setMediaUrl(null)}
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className={`rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className={`rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            onClick={() => setInputTab('media')}
          >
            <Image size={20} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className={`rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            onClick={() => setInputTab('youtube')}
          >
            <Youtube size={20} />
          </Button>
        </div>
        
        <Button 
          onClick={handlePost}
          disabled={isSubmitting || (!content.trim() && !mediaUrl) || isUploading}
          className="px-4"
        >
          <Send size={16} className="mr-2" />
          {isSubmitting ? "Wird gepostet..." : "Posten"}
        </Button>
      </div>
      
      {showEmojiPicker && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="mt-2"
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiSelect}
            theme={darkMode ? ('dark' as EmojiPickerTheme) : ('light' as EmojiPickerTheme)}
            width="100%"
            height={350}
          />
        </motion.div>
      )}
    </div>
  );
};

export default CreatePostForm;
