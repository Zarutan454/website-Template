import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X, Play, Pause, Flag, Music, BarChart, Sparkles, MoreVertical, Bookmark, BookmarkCheck, Heart, MessageCircle, Share2, Smile, ThumbsUp, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { storyAPI } from '@/lib/django-api-new';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import StoryCreation from './StoryCreation';

// NEU: Zeit-Ago Funktion
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const storyDate = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Gerade eben';
  } else if (diffInHours === 1) {
    return '1 Std.';
  } else if (diffInHours < 24) {
    return `${diffInHours} Std.`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} Tag${diffInDays > 1 ? 'e' : ''}`;
  }
};

export interface Story {
  id: number;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  media_url: string;
  caption?: string;
  type: 'image' | 'video' | 'text';
  created_at: string;
  expires_at: string;
  is_viewed?: boolean;
  is_live?: boolean;
  is_highlight?: boolean;
  privacy?: 'public' | 'friends' | 'private';
  has_new?: boolean;
  progress?: number;
  badge?: string;
  music?: {
    title: string;
    artist: string;
    cover_url?: string;
    preview_url?: string;
  };
  stickers?: Sticker[];
  poll?: {
    question: string;
    options: PollOption[];
  };
  aiData?: {
    type: 'text' | 'image';
    prompt: string;
    model?: string;
    info?: string;
  };
  highlight_name?: string; // Added for Highlight option
  viewers?: Viewer[];
  is_bookmarked?: boolean; // Added for bookmark status
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStoryView?: (storyId: number) => void;
}

// NEU: Gruppiere Stories nach Benutzer
const groupStoriesByUser = (stories: Story[]) => {
  const grouped = new Map<number, Story[]>();
  
  stories.forEach(story => {
    const userId = story.author.id;
    if (!grouped.has(userId)) {
      grouped.set(userId, []);
    }
    grouped.get(userId)!.push(story);
  });
  
  return grouped;
};

interface Sticker {
  id: number;
  src: string;
  name: string;
  x: number;
  y: number;
  scale: number;
}

interface PollOption {
  text: string;
  votes: number;
}

interface Viewer {
  id: number;
  user?: {
    username?: string;
  avatar_url?: string;
  };
  viewed_at: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialStoryIndex,
  isOpen,
  onClose,
  onStoryView
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, getAccessToken } = useAuth();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const storyDuration = 5000; // 5 seconds per story

  // NEU: Gruppierte Stories
  const groupedStories = groupStoriesByUser(stories);
  const allStories = Array.from(groupedStories.values()).flat();
  const currentStory = allStories[currentStoryIndex];

  // NEU: Gesehene Stories merken, um API-Request zu throttlen
  const viewedStories = useRef<Set<number>>(new Set());
  
  // NEU: Stabilere State-Verwaltung
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [votedOption, setVotedOption] = useState<number | null>(null);
  const [showViewers, setShowViewers] = useState(false);

  // NEU: Reaktions- und Viewer-State
  const [reactions, setReactions] = useState<{[key: string]: number}>({});
  const [viewers, setViewers] = useState<Array<{
    id: number;
    user?: {
      username?: string;
      avatar_url?: string;
    };
    viewed_at: string;
  }>>([]);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);

  // NEU: Story-Erstellung State
  const [showStoryCreation, setShowStoryCreation] = useState(false);

  // NEU: Stabilere Callbacks
  const nextStory = useCallback(() => {
    if (currentStoryIndex < allStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStoryIndex, allStories.length, handleClose]);

  const previousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  }, [currentStoryIndex]);

  const handleClose = useCallback(() => {
    setTimeout(() => {
      console.debug('[DEBUG] StoryViewer: CALL onClose (asynchron)');
      onClose();
    }, 0);
  }, [onClose]);

  // NEU: Story-Erstellung Handler
  const handleCreateStory = useCallback(() => {
    setShowStoryCreation(true);
  }, []);

  const handleStoryCreationClose = useCallback(() => {
    setShowStoryCreation(false);
  }, []);

  const handleStoryCreated = useCallback(() => {
    setShowStoryCreation(false);
    // Story-Viewer schließen, damit neue Stories geladen werden können
    handleClose();
  }, [handleClose]);

  // NEU: Reaktionen laden
  const loadReactions = useCallback(async (storyId: number) => {
    if (!storyId || isLoadingReactions) return;
    
    setIsLoadingReactions(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/stories/${storyId}/reactions/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const reactionsData = await response.json();
        const reactionCounts: {[key: string]: number} = {};
        
        reactionsData.forEach((reaction: {value: string}) => {
          const emoji = reaction.value;
          reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
        });
        
        setReactions(reactionCounts);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  }, [getAccessToken, isLoadingReactions]);

  // NEU: Viewer laden
  const loadViewers = useCallback(async (storyId: number) => {
    if (!storyId || isLoadingViewers) return;
    
    setIsLoadingViewers(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/stories/${storyId}/viewers/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const viewersData = await response.json();
        setViewers(viewersData);
      }
    } catch (error) {
      console.error('Error loading viewers:', error);
    } finally {
      setIsLoadingViewers(false);
    }
  }, [getAccessToken, isLoadingViewers]);

  // NEU: Reaktion senden
  const handleReaction = useCallback(async (reaction: string) => {
    if (!currentStory) return;
    
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/stories/${currentStory.id}/react/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reaction_type: 'emoji',
          value: reaction
        }),
      });
      
      if (response.ok) {
        // Lokalen State aktualisieren
        setReactions(prev => ({
          ...prev,
          [reaction]: (prev[reaction] || 0) + 1
        }));
        toast.success(`${reaction} Reaktion gesendet!`);
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Fehler beim Senden der Reaktion');
    }
  }, [currentStory, getAccessToken]);

  // NEU: Reaktionen und Viewer beim Story-Wechsel laden
  useEffect(() => {
    if (currentStory) {
      loadReactions(currentStory.id);
      loadViewers(currentStory.id);
    }
  }, [currentStory, loadReactions, loadViewers]);

  // Progress-Bar Update
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (100 / (storyDuration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen, nextStory]);

  // Story als gesehen markieren
  useEffect(() => {
    if (currentStory && !viewedStories.current.has(currentStory.id)) {
      viewedStories.current.add(currentStory.id);
      
      // API-Call throttlen
      const timeoutId = setTimeout(async () => {
        try {
          const accessToken = await getAccessToken();
          await fetch(`/api/stories/${currentStory.id}/view/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (onStoryView) {
            onStoryView(currentStory.id);
          }
        } catch (error) {
          console.error('Error marking story as viewed:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentStory, getAccessToken, onStoryView]);

  // Video-Controls
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handlePlay = () => setIsVideoPlaying(true);
      const handlePause = () => setIsVideoPlaying(false);
      const handleEnded = () => nextStory();
      
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [nextStory]);

  // Musik-Playback-Handler
  const handleMusicPlayPause = () => {
    if (!currentStory?.music?.preview_url) return;
    if (isMusicPlaying) {
      audioRef.current?.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current?.play();
      setIsMusicPlaying(true);
    }
  };
  useEffect(() => { setIsMusicPlaying(false); audioRef.current?.pause(); }, [currentStory?.music?.preview_url]);

  const handleStoryClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPosition = x / rect.width;
    
    if (clickPosition < 0.5) {
      previousStory();
    } else {
      nextStory();
    }
  }, [previousStory, nextStory]);

  const handleReportStory = async () => {
    if (!currentStory || !reportReason.trim()) return;
    
    setIsReporting(true);
    try {
              const accessToken = await getAccessToken();
        const response = await fetch(`/stories/${currentStory.id}/report/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reason: reportReason.trim() }),
        });

      if (response.ok) {
        toast({
          title: "Story gemeldet",
          description: "Vielen Dank für dein Feedback. Wir werden die Story überprüfen.",
        });
        setReportModalOpen(false);
        setReportReason('');
      } else {
        throw new Error('Report failed');
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Story konnte nicht gemeldet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  if (!currentStory) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={handleClose}>
          <div 
            className="fixed inset-0 z-50 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Facebook-ähnliches Layout */}
            <div className="flex h-full w-full">
              {/* Linke Seitenleiste - Vertikale Stories Liste */}
              <div className="w-80 bg-black border-r border-gray-800 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Stories</h2>
              </div>
                  
                  {/* Story erstellen */}
            <button
                    className="flex items-center space-x-3 p-3 rounded-lg w-full mb-4 bg-gray-800 hover:bg-gray-700 transition-colors"
                    onClick={handleCreateStory}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium text-sm">Deine Story</div>
                      <div className="text-gray-400 text-xs">Story erstellen</div>
                    </div>
            </button>
          </div>
                
                {/* Vertikale Story-Liste */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-4">
                    <h3 className="text-gray-400 text-sm font-medium mb-3">Alle Stories</h3>
          </div>
                  
                  {Array.from(groupedStories.entries()).map(([userId, userStories], groupIndex) => {
                    const firstStory = userStories[0]; // Verwende die erste/neueste Story für die Anzeige
                    const timeAgo = getTimeAgo(firstStory.created_at);
                    const hasUnviewedStories = userStories.some(story => !story.is_viewed);
                    
                    // Finde den aktuellen Story-Index in der flachen Liste
                    const currentStoryInGroup = userStories.find(story => 
                      allStories[currentStoryIndex]?.id === story.id
                    );
                    const isActive = currentStoryInGroup !== undefined;
                    
                return (
                  <button
                        key={userId}
                        className={`flex items-center space-x-3 p-3 rounded-lg w-full mb-3 transition-colors ${
                          isActive 
                            ? 'bg-gray-700 border border-gray-600' 
                            : 'hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          // Setze den Index auf die erste Story dieser Gruppe
                          const firstStoryIndex = allStories.findIndex(story => story.id === firstStory.id);
                          setCurrentStoryIndex(firstStoryIndex);
                        }}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={firstStory.author.avatar_url} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {firstStory.author.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium text-sm">{firstStory.author.display_name}</div>
                          <div className="text-gray-400 text-xs">
                            {isActive ? 'Aktiv' : `${timeAgo}`}
                          </div>
                        </div>
                        {hasUnviewedStories && (
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        )}
                        {userStories.length > 1 && (
                          <div className="text-xs text-gray-400">
                            {userStories.length}
                          </div>
                    )}
                  </button>
                );
              })}
            </div>
              </div>
                
              {/* Zentraler Story-Viewer */}
              <div className="flex-1 bg-black relative h-full">
                {/* Schließen-Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Story schließen"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Obere Leiste */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4">
                  {/* Fortschrittsbalken */}
                  <div className="mb-4">
                    <Progress value={currentProgress} className="h-1 bg-gray-700" />
                  </div>
                  
                  {/* Profil-Info und Musik */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={currentStory.author.avatar_url} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {currentStory.author.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{currentStory.author.display_name}</div>
                        <div className="text-gray-300 text-sm">{getTimeAgo(currentStory.created_at)}</div>
                      </div>
                    </div>
                    
                    {/* Musik-Info */}
                    {currentStory.music && (
                      <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1">
                        <Music className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{currentStory.music.title}</span>
                        {currentStory.music.preview_url ? (
                          <button
                            className="ml-2 p-1 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label={isMusicPlaying ? 'Pause' : 'Abspielen'}
                            onClick={handleMusicPlayPause}
                            type="button"
                          >
                            {isMusicPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                          </button>
                        ) : (
                          <span className="text-xs text-yellow-400 ml-2">Keine Vorschau</span>
                        )}
                        <audio ref={audioRef} src={currentStory.music.preview_url || undefined} onEnded={() => setIsMusicPlaying(false)} style={{ display: 'none' }} />
          </div>
        )}
                  </div>
                  
                  {/* Kontroll-Buttons */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button 
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label="Story abspielen/pausieren"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label="Story-Optionen"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
            </div>
          </div>
                
                {/* Story-Inhalt */}
                <div className="w-full h-full flex items-center justify-center" onClick={handleStoryClick}>
                  {currentStory?.type === 'image' && currentStory?.media_url && (
                    <img
                      src={currentStory.media_url}
                      alt={currentStory.caption || 'Story'}
                      className="w-full h-full object-contain"
                      style={{ maxHeight: '100vh', maxWidth: '100%' }}
                      onError={(e) => {
                        console.error('Image failed to load:', currentStory.media_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', currentStory.media_url)}
                    />
                  )}
                  {currentStory?.type === 'video' && currentStory?.media_url && (
                    <video
                      ref={videoRef}
                      src={currentStory.media_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      style={{ maxHeight: '100vh', maxWidth: '100%' }}
                      onError={(e) => {
                        console.error('Video failed to load:', currentStory.media_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('Video loaded successfully:', currentStory.media_url)}
                    />
                  )}
                  {currentStory?.type === 'text' && (
                    <div className="p-8 text-white text-2xl text-center w-full bg-gradient-to-b from-black to-gray-900 min-h-full flex items-center justify-center">
                      {currentStory.caption}
          </div>
        )}
                </div>
                
                {/* Navigation - Links */}
                <button
                  onClick={previousStory}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Vorherige Story"
                >
                  <ChevronLeft className="w-6 h-6" />
              </button>
                
                {/* Navigation - Rechts */}
          <button
                  onClick={nextStory}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Nächste Story"
                >
                  <ChevronRight className="w-6 h-6" />
          </button>
                
                {/* Untere Leiste */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                  {/* NEU: Reaktions-Zähler anzeigen */}
                  {Object.keys(reactions).length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      {Object.entries(reactions).map(([emoji, count]) => (
                        <div key={emoji} className="flex items-center space-x-1 bg-black/20 rounded-full px-2 py-1">
                          <span className="text-sm">{emoji}</span>
                          <span className="text-xs text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* NEU: Viewer-Anzeige */}
                  {viewers.length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex -space-x-2">
                        {viewers.slice(0, 3).map((viewer, index) => (
                          <div key={`viewer-${viewer.id}-${index}`} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden">
                            <img 
                              src={viewer.user?.avatar_url || '/placeholder.svg'} 
                              alt={viewer.user?.username || 'Viewer'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
        </div>
                      <span className="text-xs text-white">
                        {viewers.length} {viewers.length === 1 ? 'Person' : 'Personen'} haben gesehen
                      </span>
            <button
                        onClick={() => setShowViewers(!showViewers)}
                        className="text-xs text-white/70 hover:text-white underline"
                        aria-label="Alle Viewer anzeigen"
                      >
                        Alle anzeigen
            </button>
          </div>
        )}
                  
                  {/* NEU: Einfache Emoji-Reaktionen */}
                  <div className="flex items-center justify-center space-x-4">
                    <button 
                      onClick={() => handleReaction('👍')} 
                      className="p-2 hover:bg-white/10 rounded-full text-2xl transition-colors"
                      aria-label="Daumen hoch"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => handleReaction('❤️')} 
                      className="p-2 hover:bg-white/10 rounded-full text-2xl transition-colors"
                      aria-label="Herz"
                    >
                      ❤️
                    </button>
                    <button 
                      onClick={() => handleReaction('😊')} 
                      className="p-2 hover:bg-white/10 rounded-full text-2xl transition-colors"
                      aria-label="Lächeln"
                    >
                      😊
                    </button>
                    <button 
                      onClick={() => handleReaction('😮')} 
                      className="p-2 hover:bg-white/10 rounded-full text-2xl transition-colors"
                      aria-label="Überrascht"
                    >
                      😮
                    </button>
                    <button 
                      onClick={() => handleReaction('😢')} 
                      className="p-2 hover:bg-white/10 rounded-full text-2xl transition-colors"
                      aria-label="Weinen"
                    >
                      😢
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Rechter schwarzer Bereich */}
              <div className="w-80 bg-black h-full"></div>
            </div>

            {/* NEU: Viewer-Liste Modal */}
        {showViewers && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Story-Viewer</h3>
                    <button 
                      onClick={() => setShowViewers(false)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Viewer-Liste schließen"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {viewers.map((viewer, index) => (
                      <div key={`viewer-list-${viewer.id}-${index}`} className="flex items-center space-x-3">
                        <img 
                          src={viewer.user?.avatar_url || '/placeholder.svg'} 
                          alt={viewer.user?.username || 'Viewer'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{viewer.user?.username || 'Unbekannter Nutzer'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(viewer.viewed_at).toLocaleString('de-DE')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NEU: Story-Erstellung Modal */}
            {showStoryCreation && (
              <StoryCreation
                onStoryCreated={handleStoryCreated}
                onClose={handleStoryCreationClose}
              />
            )}
            </div>
          </div>
        )}
    </>
  );
};

export default StoryViewer;
