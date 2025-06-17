import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { useStories, StoryGroup } from '../../hooks/useStories';
import { useProfile } from '../../hooks/useProfile';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';

interface StoryListProps {
  className?: string;
}

const StoryList: React.FC<StoryListProps> = ({ className = '' }) => {
  const { followingStories, isLoadingFollowingStories, setActiveStory } = useStories();
  const { profile } = useProfile();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  
  const handleStoryClick = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsStoryViewerOpen(true);
  };
  
  if (isLoadingFollowingStories) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!followingStories || followingStories.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <p className="text-muted-foreground text-center mb-2">
          Keine Stories verfügbar
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setIsStoryCreatorOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Story erstellen
        </Button>
        
        <StoryCreator 
          isOpen={isStoryCreatorOpen} 
          onClose={() => setIsStoryCreatorOpen(false)} 
        />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex items-center gap-2 overflow-x-auto p-2 pb-4 no-scrollbar">
        {/* Create story button */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-primary/50 hover:border-primary"
            onClick={() => setIsStoryCreatorOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
          <p className="text-xs text-center mt-1 font-medium">Erstellen</p>
        </div>
        
        {/* Story avatars */}
        {followingStories.map((group: StoryGroup, index: number) => (
          <div 
            key={group.user_id} 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleStoryClick(index)}
          >
            <div className={`p-[2px] rounded-full ${group.hasUnviewed ? 'bg-gradient-to-br from-primary to-pink-500' : 'bg-muted'}`}>
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={group.avatar_url || ''} alt={group.display_name || group.username || ''} />
                <AvatarFallback>
                  {group.display_name?.[0] || group.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs text-center mt-1 truncate w-16">
              {group.user_id === profile?.id 
                ? 'Deine Story' 
                : group.display_name || group.username || 'Unbekannt'}
            </p>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {isStoryViewerOpen && (
          <StoryViewer 
            isOpen={isStoryViewerOpen} 
            onClose={() => setIsStoryViewerOpen(false)}
            initialGroupIndex={selectedGroupIndex}
          />
        )}
      </AnimatePresence>
      
      <StoryCreator 
        isOpen={isStoryCreatorOpen} 
        onClose={() => setIsStoryCreatorOpen(false)} 
      />
    </div>
  );
};

export default StoryList;
