import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { useStories, StoryGroup } from '../../hooks/useStories';
import { useAuth } from '@/context/AuthContext';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';

const BACKEND_ROOT_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');

interface StoryListProps {
  className?: string;
}

const StoryList: React.FC<StoryListProps> = ({ className = '' }) => {
  const { myStories, followingStories, isLoadingMyStories, isLoadingFollowingStories } = useStories();
  const { user: profile } = useAuth();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const isLoading = isLoadingMyStories || isLoadingFollowingStories;

  const combinedStories = useMemo(() => {
    const allStories: StoryGroup[] = followingStories ? [...followingStories] : [];

    if (profile && myStories && myStories.length > 0) {
      const avatarUrl = profile.avatar_url?.startsWith('http')
        ? profile.avatar_url
        : `${BACKEND_ROOT_URL}${profile.avatar_url}`;

      const myStoryGroup: StoryGroup = {
        user_id: profile.id.toString(),
        username: profile.username,
        display_name: 'Deine Story',
        avatar_url: avatarUrl,
        stories: myStories,
        hasUnviewed: myStories.some(s => !s.viewed)
      };

      // Prevent duplicates if the backend also sends my own stories in the `following` list
      const myStoryIndexInFollowing = allStories.findIndex(group => group.user_id === myStoryGroup.user_id);
      if (myStoryIndexInFollowing > -1) {
        allStories[myStoryIndexInFollowing] = myStoryGroup;
      } else {
        allStories.unshift(myStoryGroup);
      }
    }
    
    return allStories;
  }, [myStories, followingStories, profile]);

  const handleCreateStoryClick = () => {
    setIsStoryCreatorOpen(true);
  };

  const handleStoryClick = (index: number) => {
    setSelectedGroupIndex(index);
    setIsStoryViewerOpen(true);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (combinedStories.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg ${className}`}>
        <p className="text-muted-foreground text-center mb-4">
          Keine Stories verfügbar. Sei der Erste!
        </p>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setIsStoryCreatorOpen(true)}
        >
          <Camera className="h-4 w-4" />
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
    <>
      <div className={`relative flex items-center space-x-4 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className}`}>
        {/* Create Story Button */}
        <div className="flex flex-col items-center space-y-1 flex-shrink-0">
          <Button
            variant="ghost"
            className="w-16 h-16 rounded-full p-0 border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center hover:border-primary transition-colors"
            onClick={handleCreateStoryClick}
          >
            <Plus className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </Button>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Erstellen</span>
        </div>
        
        {/* Story avatars */}
        {combinedStories.map((group, index) => (
            <div
              key={group.user_id}
              className="flex flex-col items-center space-y-1 cursor-pointer group flex-shrink-0"
              onClick={() => handleStoryClick(index)}
            >
              <div className={`relative p-0.5 rounded-full ${group.hasUnviewed ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-gray-300'}`}>
                <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-900">
                  <AvatarImage src={group.avatar_url || ''} alt={group.display_name} />
                  <AvatarFallback>{group.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-16 text-center">
                {group.display_name}
              </span>
            </div>
          ))}
      </div>

      <AnimatePresence>
        {isStoryViewerOpen && (
          <StoryViewer
            isOpen={isStoryViewerOpen}
            onClose={() => setIsStoryViewerOpen(false)}
            storyGroups={combinedStories}
            initialGroupIndex={selectedGroupIndex}
          />
        )}
      </AnimatePresence>

      <StoryCreator
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
      />
    </>
  );
};

export default StoryList;
