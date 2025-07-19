import * as React from 'react';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { storyAPI } from '@/lib/django-api-new';
import type { Story } from './StoryViewer';
import { useAuth } from '@/context/AuthContext';

interface StoryBarProps {
  onOpenStory: (stories: Story[], initialIndex: number) => void;
  onCreateStory: () => void;
}

export interface StoryBarRef {
  refreshStories: () => void;
}

export const StoryBar = forwardRef<StoryBarRef, StoryBarProps>(({ onOpenStory, onCreateStory }, ref) => {
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [friendStories, setFriendStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const groupStoriesByUser = (stories: Story[]) => {
    const grouped = new Map<string, Story[]>();
    stories.forEach(story => {
      const userId = story.author.id.toString();
      if (!grouped.has(userId)) grouped.set(userId, []);
      grouped.get(userId)!.push(story);
    });
    grouped.forEach(stories => {
      stories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
    return grouped;
  };

  const groupedMyStories = groupStoriesByUser(myStories);
  const groupedFriendStories = groupStoriesByUser(friendStories);

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [my, friends] = await Promise.all([
        storyAPI.getMyStories(),
        storyAPI.getFollowingStories()
      ]);
      setMyStories(my || []);
      setFriendStories(friends || []);
    } catch (e) {
      setMyStories([]);
      setFriendStories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({ refreshStories: fetchStories }));
  useEffect(() => { fetchStories(); }, [fetchStories]);

  return (
    <div className="w-full">
      <div
        className="flex gap-[2px] overflow-x-auto scrollbar-hide py-3 px-2 bg-white dark:bg-neutral-900"
        ref={listRef}
        tabIndex={0}
        aria-label="Stories-Leiste"
      >
        {/* Story erstellen Card */}
        <button
          className="relative w-[116px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 group border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800"
          onClick={onCreateStory}
              aria-label="Story erstellen"
        >
          {/* Profilbild als Hintergrund */}
          <img
            src={user?.avatar_url || '/placeholder.svg'}
            alt="Dein Avatar"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/60" />
          {/* Blauer Plus-Button */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[60%] w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          {/* Text unten */}
          <div className="absolute bottom-3 left-0 w-full text-center">
            <span className="text-[15px] font-semibold text-black dark:text-white drop-shadow">Story erstellen</span>
              </div>
        </button>

        {/* User Stories */}
        {Array.from(groupedMyStories.entries()).map(([userId, stories]) => {
          const firstStory = stories[0];
          const hasUnviewedStories = stories.some(story => !story.is_viewed);
          return (
                <button
              key={`my-${userId}`}
              className="relative w-[116px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 group border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800"
              onClick={() => onOpenStory(stories, 0)}
              aria-label={firstStory.author.username}
            >
              {/* Story-Bild als Hintergrund */}
              <img
                src={firstStory.media_url || '/placeholder.svg'}
                alt="Story Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient Overlay unten */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
              {/* Profilbild oben links */}
              <div className="absolute top-3 left-3">
                <div className={clsx(
                  'w-10 h-10 rounded-full border-4',
                  hasUnviewedStories ? 'border-blue-600' : 'border-white dark:border-neutral-900',
                  'bg-white dark:bg-neutral-900 flex items-center justify-center shadow'
                )}>
                  <img
                    src={firstStory.author.avatar_url || '/placeholder.svg'}
                    alt={firstStory.author.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </div>
              </div>
              {/* Username unten links */}
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[15px] font-semibold text-white drop-shadow truncate block">
                  {firstStory.author.display_name || firstStory.author.username}
                </span>
              </div>
            </button>
          );
        })}
        {Array.from(groupedFriendStories.entries()).map(([userId, stories]) => {
          const firstStory = stories[0];
          const hasUnviewedStories = stories.some(story => !story.is_viewed);
          return (
                <button
              key={`friend-${userId}`}
              className="relative w-[116px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 group border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800"
              onClick={() => onOpenStory(stories, 0)}
              aria-label={firstStory.author.username}
            >
              {/* Story-Bild als Hintergrund */}
              <img
                src={firstStory.media_url || '/placeholder.svg'}
                alt="Story Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient Overlay unten */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
              {/* Profilbild oben links */}
              <div className="absolute top-3 left-3">
                <div className={clsx(
                  'w-10 h-10 rounded-full border-4',
                  hasUnviewedStories ? 'border-blue-600' : 'border-white dark:border-neutral-900',
                  'bg-white dark:bg-neutral-900 flex items-center justify-center shadow'
                )}>
                  <img
                    src={firstStory.author.avatar_url || '/placeholder.svg'}
                    alt={firstStory.author.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </div>
              </div>
              {/* Username unten links */}
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[15px] font-semibold text-white drop-shadow truncate block">
                  {firstStory.author.display_name || firstStory.author.username}
                </span>
              </div>
            </button>
          );
        })}
        {isLoading && (
          <div className="flex items-center justify-center w-[116px] h-[200px] animate-pulse">
            <span className="text-xs text-gray-400">Lädt...</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default StoryBar; 