
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Story {
  id: string;
  url: string;
  type: 'image' | 'video';
  duration?: number; // in milliseconds
}

interface StoryGroup {
  id: string;
  title: string;
  stories: Story[];
}

interface StoriesViewerProps {
  groups: StoryGroup[];
  initialGroupId?: string;
  initialStoryId?: string;
  onClose: () => void;
}

const StoriesViewer: React.FC<StoriesViewerProps> = ({
  groups,
  initialGroupId,
  initialStoryId,
  onClose
}) => {
  const [activeGroupIndex, setActiveGroupIndex] = useState(
    initialGroupId ? groups.findIndex(g => g.id === initialGroupId) : 0
  );
  const [activeStoryIndex, setActiveStoryIndex] = useState(
    initialStoryId && activeGroupIndex >= 0
      ? groups[activeGroupIndex].stories.findIndex(s => s.id === initialStoryId)
      : 0
  );
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const activeGroup = groups[activeGroupIndex];
  const activeStory = activeGroup?.stories[activeStoryIndex];
  const storyDuration = activeStory?.duration || 5000; // default 5 seconds

  useEffect(() => {
    if (!activeStory || isPaused) return;
    
    setProgress(0);
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsedTime / storyDuration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        goToNextStory();
      } else {
        intervalRef.current = requestAnimationFrame(updateProgress);
      }
    };
    
    intervalRef.current = requestAnimationFrame(updateProgress);
    
    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, [activeGroupIndex, activeStoryIndex, isPaused]);

  const goToPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else if (activeGroupIndex > 0) {
      setActiveGroupIndex(activeGroupIndex - 1);
      setActiveStoryIndex(groups[activeGroupIndex - 1].stories.length - 1);
    }
  };

  const goToNextStory = () => {
    if (activeStoryIndex < activeGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else if (activeGroupIndex < groups.length - 1) {
      setActiveGroupIndex(activeGroupIndex + 1);
      setActiveStoryIndex(0);
    } else {
      onClose(); // Close viewer when reaching the end
    }
  };

  if (!activeGroup || !activeStory) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 z-10 text-white"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 flex p-2 gap-1">
          {activeGroup.stories.map((story, idx) => (
            <div key={idx} className="h-1 bg-gray-700 flex-1 overflow-hidden">
              <div 
                className="h-full bg-white"
                style={{ 
                  width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${progress}%` : '0%',
                  transition: idx === activeStoryIndex ? 'width 0.1s linear' : 'none'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/4 z-10"
          onClick={goToPrevStory}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/4 z-10"
          onClick={goToNextStory}
        />
        
        {/* Story content */}
        <div 
          className="w-full h-full flex items-center justify-center"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {activeStory.type === 'image' ? (
            <img 
              src={activeStory.url} 
              alt="" 
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <video 
              src={activeStory.url}
              autoPlay
              muted={false}
              controls={false}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
        
        {/* Group info */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold">{activeGroup.title}</h3>
        </div>
        
        {/* Navigation buttons for desktop */}
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hidden md:block"
          onClick={goToPrevStory}
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hidden md:block"
          onClick={goToNextStory}
        >
          <ChevronRight size={24} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoriesViewer;
