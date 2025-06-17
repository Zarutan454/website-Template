import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Story, StoryGroup, useStories } from '../../hooks/useStories';
import { useTheme } from '../../components/ThemeProvider';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialGroupIndex?: number;
  initialStoryIndex?: number;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  initialGroupIndex = 0,
  initialStoryIndex = 0
}) => {
  const { 
    followingStories, 
    activeStoryGroup, 
    activeStoryIndex, 
    setActiveStory, 
    goToNextStory, 
    goToPrevStory, 
    closeStoryViewer,
    formatTimeSince,
    viewStory
  } = useStories();
  
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme } = useTheme();
  
  const DURATIONS = {
    image: 5000,
    video: 0, // Will be set based on video duration
    text: 5000
  };
  
  useEffect(() => {
    if (isOpen && followingStories && followingStories.length > 0) {
      const groupIndex = Math.min(initialGroupIndex, followingStories.length - 1);
      setActiveStory(groupIndex, initialStoryIndex);
    }
  }, [isOpen, followingStories, initialGroupIndex, initialStoryIndex, setActiveStory]);
  
  useEffect(() => {
    if (!activeStoryGroup || isPaused) return;
    
    const story = activeStoryGroup.stories[activeStoryIndex];
    if (!story) return;
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    if (!story.viewed) {
      viewStory.mutate(story.id);
    }
    
    setProgress(0);
    
    if (story.type === 'video' && videoRef.current) {
      const videoDuration = videoRef.current.duration * 1000;
      if (videoDuration) {
        const interval = 100; // Update every 100ms
        progressInterval.current = setInterval(() => {
          if (videoRef.current) {
            const currentTime = videoRef.current.currentTime * 1000;
            const percentage = (currentTime / videoDuration) * 100;
            setProgress(percentage);
            
            if (percentage >= 99.5) {
              clearInterval(progressInterval.current!);
              goToNextStory();
            }
          }
        }, interval);
      }
    } else {
      const duration = DURATIONS[story.type];
      const interval = 100; // Update every 100ms
      const increment = (interval / duration) * 100;
      
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + increment;
          if (newProgress >= 100) {
            clearInterval(progressInterval.current!);
            goToNextStory();
            return 0;
          }
          return newProgress;
        });
      }, interval);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [activeStoryGroup, activeStoryIndex, isPaused, goToNextStory, viewStory]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevStory();
          break;
        case 'ArrowRight':
          goToNextStory();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ': // Space bar
          setIsPaused(prev => !prev);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevStory, goToNextStory, onClose]);
  
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      closeStoryViewer();
    };
  }, [closeStoryViewer]);
  
  const handleVideoPlay = () => {
    setIsPaused(false);
  };
  
  const handleVideoPause = () => {
    setIsPaused(true);
  };
  
  const handleVideoEnded = () => {
    goToNextStory();
  };
  
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };
  
  const handleStoryClick = (e: React.MouseEvent) => {
    const { clientX } = e;
    const { innerWidth } = window;
    
    if (clientX < innerWidth / 3) {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };
  
  const renderStoryContent = (story: Story) => {
    switch (story.type) {
      case 'image':
        return (
          <img 
            src={story.media_url} 
            alt="Story" 
            className="w-full h-full object-contain"
          />
        );
      case 'video':
        return (
          <video
            ref={videoRef}
            src={story.media_url}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            muted={isMuted}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoEnded}
          />
        );
      case 'text':
        return (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/20 to-primary/40">
            <p className="text-2xl font-bold text-center">{story.caption}</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  if (!isOpen || !activeStoryGroup) return null;
  
  const currentStory = activeStoryGroup.stories[activeStoryIndex];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        
        {/* Story navigation */}
        <div className="absolute top-1/2 left-4 z-50 transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={goToPrevStory}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </div>
        
        <div className="absolute top-1/2 right-4 z-50 transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={goToNextStory}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        
        {/* Story content */}
        <div className="relative w-full max-w-md h-[80vh] mx-auto">
          {/* Story header */}
          <div className="absolute top-0 left-0 right-0 z-40 p-4 bg-gradient-to-b from-black/60 to-transparent">
            {/* Progress bar */}
            <div className="flex gap-1 mb-3">
              {activeStoryGroup.stories.map((story, index) => (
                <div 
                  key={story.id} 
                  className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden"
                >
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ 
                      width: index < activeStoryIndex 
                        ? '100%' 
                        : index === activeStoryIndex 
                          ? `${progress}%` 
                          : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={activeStoryGroup.avatar_url || ''} alt={activeStoryGroup.display_name || activeStoryGroup.username || ''} />
                <AvatarFallback>{activeStoryGroup.display_name?.[0] || activeStoryGroup.username?.[0] || '?'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {activeStoryGroup.display_name || activeStoryGroup.username || 'Unbekannter Nutzer'}
                </p>
                <p className="text-xs text-white/70">
                  {currentStory && formatTimeSince(currentStory.created_at)}
                </p>
              </div>
              
              {/* Playback controls */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setIsPaused(prev => !prev)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                
                {currentStory?.type === 'video' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-8 w-8"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Story content */}
          <div 
            className="w-full h-full flex items-center justify-center bg-black"
            onClick={handleStoryClick}
          >
            {currentStory && renderStoryContent(currentStory)}
          </div>
          
          {/* Caption */}
          {currentStory?.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white">{currentStory.caption}</p>
            </div>
          )}
        </div>
        
        {/* Story thumbnails */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
          {followingStories?.map((group, groupIndex) => (
            <button
              key={group.user_id}
              className={`relative flex-shrink-0 ${activeStoryGroup.user_id === group.user_id ? 'scale-110' : 'opacity-70'}`}
              onClick={() => setActiveStory(groupIndex)}
            >
              <Avatar className={`h-12 w-12 border-2 ${activeStoryGroup.user_id === group.user_id ? 'border-primary' : 'border-white/50'}`}>
                <AvatarImage src={group.avatar_url || ''} alt={group.display_name || group.username || ''} />
                <AvatarFallback>{group.display_name?.[0] || group.username?.[0] || '?'}</AvatarFallback>
              </Avatar>
              
              {group.hasUnviewed && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-background" />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
