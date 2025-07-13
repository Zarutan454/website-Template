import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ArrowLeft, Eye, Clock, AlertCircle, Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Story, StoryGroup, useStories, StoryComment } from '../../hooks/useStories';
import { useTheme } from '../../components/ThemeProvider';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Derive the backend root URL for media files
const BACKEND_ROOT_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  storyGroups: StoryGroup[];
  initialGroupIndex?: number;
  initialStoryIndex?: number;
}

// Hilfsfunktion für Zeitformatierung
const formatTimeRemaining = (expiresAt: string): string => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Abgelaufen';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m`;
  } else {
    return '< 1m';
  }
};

// Hilfsfunktion für Story-Status
const getStoryStatus = (story: { expires_at: string }) => {
  const now = new Date();
  const expiry = new Date(story.expires_at);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'expired';
  if (diffMs < 30 * 60 * 1000) return 'expiring-soon'; // < 30 Minuten
  return 'active';
};

const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  storyGroups,
  initialGroupIndex = 0,
  initialStoryIndex = 0
}) => {
  const { user: currentUser } = useAuth();
  const { 
    markStoryViewed,
    formatStoryTime,
    toggleStoryLike,
    createStoryComment,
    toggleStoryBookmark,
    shareStory,
  } = useStories();
  
  const { theme } = useTheme();
  const [activeGroupIndex, setActiveGroupIndex] = useState(initialGroupIndex);
  const [activeStoryIndex, setActiveStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveGroupIndex(initialGroupIndex);
    setActiveStoryIndex(initialStoryIndex);
  }, [initialGroupIndex, initialStoryIndex, isOpen]);

  const activeStoryGroup = storyGroups[activeGroupIndex];
  const activeStory = activeStoryGroup?.stories[activeStoryIndex];
  const isOwnStory = activeStoryGroup?.user_id === currentUser?.id?.toString();
  const storyStatus = activeStory ? getStoryStatus(activeStory) : 'active';

  const DURATIONS = {
    image: 5000, // 5 seconds for images
    video: 0,    // Video duration is handled by the video element
    text: 5000,  // 5 seconds for text
  };

  const handleNextStory = () => {
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else {
      handleNextGroup();
    }
  };
  
  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else {
      handlePrevGroup();
    }
  };

  const handleNextGroup = () => {
    if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex(prev => prev + 1);
      setActiveStoryIndex(0);
    } else {
      onClose(); // Close viewer if it's the last story of the last group
    }
  };
  
  const handlePrevGroup = () => {
    if (activeGroupIndex > 0) {
      setActiveGroupIndex(prev => prev - 1);
      // Go to the last story of the previous group
      setActiveStoryIndex(storyGroups[activeGroupIndex - 1].stories.length - 1);
    }
  };
  
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    if (activeStory && !activeStory.viewed) {
      markStoryViewed.mutate(parseInt(activeStory.id));
    }
    
    setProgress(0);

    if (isOpen && activeStory && !isPaused) {
      const duration = activeStory.type === 'video' 
        ? (videoRef.current?.duration || 0) * 1000 
        : DURATIONS[activeStory.type];

      if (duration > 0) {
        const startTime = Date.now();
        progressInterval.current = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const newProgress = (elapsedTime / duration) * 100;
          if (newProgress >= 100) {
            handleNextStory();
          } else {
            setProgress(newProgress);
          }
        }, 50);
      }
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeGroupIndex, activeStoryIndex, isOpen, isPaused, activeStory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNextStory();
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeGroupIndex, activeStoryIndex, storyGroups]);

  // ========== Story Interactions ==========

  const handleLikeToggle = () => {
    if (!activeStory) return;
    
    const isLiked = activeStory.is_liked_by_user || false;
    toggleStoryLike.mutate({ 
      storyId: parseInt(activeStory.id), 
      action: isLiked ? 'unlike' : 'like' 
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStory || !commentText.trim()) return;
    
    createStoryComment.mutate({ 
      storyId: parseInt(activeStory.id), 
      content: commentText.trim() 
    });
    setCommentText('');
  };

  const handleShare = (shareType: 'copy_link' | 'direct_message' | 'post' | 'external') => {
    if (!activeStory) return;
    
    const shareData = {
      share_type: shareType,
      external_platform: shareType === 'external' ? 'twitter' : undefined
    };
    
    shareStory.mutate({ 
      storyId: parseInt(activeStory.id), 
      shareData 
    });
    setShowShareOptions(false);
  };

  const handleBookmarkToggle = () => {
    if (!activeStory) return;
    
    const isBookmarked = activeStory.is_bookmarked_by_user || false;
    toggleStoryBookmark.mutate({ 
      storyId: parseInt(activeStory.id), 
      action: isBookmarked ? 'unbookmark' : 'bookmark' 
    });
  };

  if (!isOpen || !activeStoryGroup || !activeStory) {
    return null;
  }
  
  const fullMediaUrl = activeStory.media_url.startsWith('http') 
    ? activeStory.media_url 
    : `${BACKEND_ROOT_URL}${activeStory.media_url}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        <div className="relative w-full h-full max-w-md max-h-screen-md flex flex-col items-center justify-center">
          {/* Close Button */}
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white z-20" onClick={onClose}>
            <X />
          </Button>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 z-10 w-full">
            <div className="flex items-center gap-2 mb-2">
              {activeStoryGroup.stories.map((story, index) => (
                <div key={story.id} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: index < activeStoryIndex ? '100%' : (index === activeStoryIndex ? `${progress}%` : '0%') }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeStoryGroup.avatar_url || ''} alt={activeStoryGroup.display_name} />
                  <AvatarFallback>{activeStoryGroup.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white">{activeStoryGroup.display_name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-300">{formatStoryTime(activeStory.created_at)}</p>
                    {/* Expiration Badge */}
                    {storyStatus !== 'active' && (
                      <Badge 
                        variant={storyStatus === 'expired' ? 'secondary' : 'destructive'} 
                        className="text-xs px-1 py-0.5"
                      >
                        {storyStatus === 'expired' ? (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Abgelaufen
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeRemaining(activeStory.expires_at)}
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white" onClick={(e) => { e.stopPropagation(); setIsPaused(p => !p); }}>
                  {isPaused ? <Play /> : <Pause />}
                </Button>
                <Button variant="ghost" size="icon" className="text-white" onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }}>
                  {isMuted ? <VolumeX /> : <Volume2 />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative w-full aspect-[9/16] max-h-full rounded-lg overflow-hidden bg-black">
            {activeStory.type === 'image' && (
              <img src={fullMediaUrl} alt={activeStory.caption || 'Story image'} className="w-full h-full object-contain" />
            )}
            {activeStory.type === 'video' && (
              <video
                ref={videoRef}
                src={fullMediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted={isMuted}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    const duration = videoRef.current.duration * 1000;
                    if (progressInterval.current) clearInterval(progressInterval.current);
                    const startTime = Date.now();
                    progressInterval.current = setInterval(() => {
                      const elapsedTime = Date.now() - startTime;
                      const newProgress = (elapsedTime / duration) * 100;
                      if (newProgress >= 100) {
                        handleNextStory();
                      } else {
                        setProgress(newProgress);
                      }
                    }, 50);
                  }
                }}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
              />
            )}
            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex justify-between items-center">
                <p className="text-white text-center text-sm flex-1">{activeStory.caption}</p>
              </div>
            )}
            
            {isOwnStory && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white bg-black/50 p-2 rounded-lg">
                <Eye className="w-5 h-5" />
                <span className="font-bold text-sm">{activeStory.views_count || 0}</span>
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center gap-3">
              {/* Like Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 w-12 h-12"
                onClick={(e) => { e.stopPropagation(); handleLikeToggle(); }}
              >
                <Heart 
                  className={`w-6 h-6 ${activeStory.is_liked_by_user ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>

              {/* Comment Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 w-12 h-12"
                onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
              >
                <MessageCircle className="w-6 h-6" />
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 w-12 h-12"
                onClick={(e) => { e.stopPropagation(); setShowShareOptions(!showShareOptions); }}
              >
                <Share2 className="w-6 h-6" />
              </Button>

              {/* Bookmark Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 w-12 h-12"
                onClick={(e) => { e.stopPropagation(); handleBookmarkToggle(); }}
              >
                <Bookmark 
                  className={`w-6 h-6 ${activeStory.is_bookmarked_by_user ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                />
              </Button>
            </div>

            {/* Share Options Modal */}
            {showShareOptions && (
              <div className="absolute bottom-20 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 w-full justify-start"
                  onClick={() => handleShare('copy_link')}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Link kopieren
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 w-full justify-start"
                  onClick={() => handleShare('direct_message')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Direktnachricht
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 w-full justify-start"
                  onClick={() => handleShare('post')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Als Post teilen
                </Button>
              </div>
            )}

            {/* Comments Section */}
            {showComments && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Kommentare</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowComments(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-3">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Kommentar hinzufügen..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-2">
                  {activeStory.comments?.map((comment: StoryComment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={comment.user?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {comment.user?.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {comment.user?.display_name}
                          </span>
                          <span className="text-white/50 text-xs">
                            {formatStoryTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={handlePrevStory}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={handleNextStory}>
            <ChevronRight />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
