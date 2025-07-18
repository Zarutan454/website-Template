import * as React from 'react';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiClient, storyAPI } from '@/lib/django-api-new';
import { Plus, Play, Image, Type } from 'lucide-react';
import StoryCreation from './StoryCreation';
import StoryViewer from './StoryViewer';
import { useAuth } from '@/hooks/useAuth';
import { StoryBar, StoryBarRef } from './StoryBar';
import ErrorBoundary from '../Feed/ErrorBoundary';
import type { Story } from './StoryViewer';

interface UserStories {
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  stories: Story[];
  has_unviewed: boolean;
}

// StoryCard-Komponente (minimal, für Fehlerfreiheit)
const StoryCard = React.memo(({ story, isOwnStory }: { story: Story; isOwnStory?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    console.error('StoryCard error:', error);
    setError(error.message);
  }, []);

  if (error) {
    return (
      <div className="flex-shrink-0 text-center">
        <div className="relative w-[110px] h-[200px] rounded-xl shadow overflow-hidden flex flex-col justify-end cursor-pointer group border border-gray-200 dark:border-neutral-800 bg-red-50 dark:bg-red-900/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-red-600 dark:text-red-400">Fehler beim Laden</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 text-center">
      <div className="relative w-[110px] h-[200px] rounded-xl shadow overflow-hidden flex flex-col justify-end cursor-pointer group border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800">
        {story.media_url ? (
          <img 
            src={story.media_url} 
            alt="Story preview" 
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              handleError(new Error('Story konnte nicht geladen werden'));
            }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400 font-bold">?</div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
          <span className="text-white font-semibold text-sm drop-shadow-lg">
            {isOwnStory ? 'Deine Story' : story.author?.username}
          </span>
        </div>
      </div>
    </div>
  );
});

StoryCard.displayName = 'StoryCard';

const StoryList: React.FC = () => {
  const { user } = useAuth();
  const [showStoryCreation, setShowStoryCreation] = useState(false);
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storyBarRef = useRef<StoryBarRef | null>(null);

  // NEU: Stabilere Callbacks
  const handleOpenStory = useCallback((stories: Story[], index: number) => {
    try {
      setSelectedStories(stories);
      setSelectedStoryIndex(index);
      setShowStoryViewer(true);
    } catch (error) {
      console.error('Error opening story:', error);
      toast.error('Fehler beim Öffnen der Story');
    }
  }, []);

  const handleCreateStory = useCallback(() => {
    try {
      setShowStoryCreation(true);
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Fehler beim Erstellen der Story');
    }
  }, []);

  // NEU: Stabilere Story-Viewed-Handler
  const handleStoryViewed = useCallback((storyId: number) => {
    try {
      setSelectedStories(prev =>
        prev.map(story =>
          story.id === storyId ? { ...story, is_viewed: true } : story
        )
      );
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  }, []);

  const handleStoryViewerClose = useCallback(() => {
    try {
      setShowStoryViewer(false);
      setSelectedStories([]);
      setSelectedStoryIndex(0);
    } catch (error) {
      console.error('Error closing story viewer:', error);
    }
  }, []);

  const handleStoryCreationClose = useCallback(() => {
    try {
      setShowStoryCreation(false);
    } catch (error) {
      console.error('Error closing story creation:', error);
    }
  }, []);

  // NEU: Stabilere Callbacks
  const handleStoryCreated = useCallback(() => {
    try {
      setShowStoryCreation(false);
      // StoryBar neu laden, damit die neue Story sofort sichtbar ist
      if (storyBarRef.current?.refreshStories) {
        storyBarRef.current.refreshStories();
      }
      toast.success('Story erfolgreich erstellt!');
    } catch (error) {
      console.error('Error handling story creation:', error);
      toast.error('Fehler beim Erstellen der Story');
    }
  }, []);

  // NEU: Memoized StoryViewer Props
  const storyViewerProps = useMemo(() => ({
    stories: selectedStories,
    initialStoryIndex: selectedStoryIndex,
    isOpen: showStoryViewer,
    onClose: handleStoryViewerClose,
    onStoryView: handleStoryViewed
  }), [selectedStories, selectedStoryIndex, showStoryViewer, handleStoryViewerClose, handleStoryViewed]);

  // Error handling
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('StoryList error:', error, errorInfo);
    setError(error.message);
    toast.error('Ein Fehler ist aufgetreten beim Laden der Stories');
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup beim Unmount
      setSelectedStories([]);
      setShowStoryViewer(false);
      setShowStoryCreation(false);
    };
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <div className="w-full">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Erneut versuchen
            </Button>
          </div>
        )}
        
        <StoryBar 
          ref={storyBarRef}
          onOpenStory={handleOpenStory} 
          onCreateStory={handleCreateStory} 
        />
        
        {/* Story Creation Modal */}
        {showStoryCreation && (
          <StoryCreation
            onStoryCreated={handleStoryCreated}
            onClose={handleStoryCreationClose}
          />
        )}
        
        {/* Story Viewer Modal - STABILER */}
        {showStoryViewer && selectedStories.length > 0 && (
          <StoryViewer {...storyViewerProps} />
        )}
        
        {/* Warnung im UI, falls Modal offen aber keine Stories */}
        {showStoryViewer && selectedStories.length === 0 && (
          <div className="p-4 bg-red-100 text-red-800 rounded mt-2 text-xs font-mono">
            WARNUNG: showStoryViewer=true, aber keine Stories ausgewählt!
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default StoryList;
