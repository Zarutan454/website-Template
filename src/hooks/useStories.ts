import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, UploadProgress, storyAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  type: 'image' | 'video' | 'text';
  caption?: string;
  created_at: string;
  expires_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  views_count?: number;
  viewed?: boolean;
  // Story Interactions
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked_by_user?: boolean;
  is_bookmarked_by_user?: boolean;
  comments?: StoryComment[];
}

interface StoryComment {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
  viewer?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface StoryGroup {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export const useStories = () => {
  const { user: profile } = useAuth();
  const queryClient = useQueryClient();
  
  // State für Story-Navigation
  const [activeStoryGroup, setActiveStoryGroup] = useState<StoryGroup | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Fetch my stories
  const { data: myStories = [], isLoading: isLoadingMyStories, error: myStoriesError } = useQuery({
    queryKey: ['stories', 'my'],
    queryFn: async () => {
      const response = await storyAPI.getMyStories();
      return response || [];
    },
    enabled: !!profile,
  });

  // Fetch following stories
  const { data: followingStories = [], isLoading: isLoadingFollowingStories, error: followingStoriesError } = useQuery({
    queryKey: ['stories', 'following'],
    queryFn: async () => {
      const response = await storyAPI.getFollowingStories();
      return response || [];
    },
    enabled: !!profile,
  });

  const getStoryViews = useCallback((storyId: string) => {
    // This would typically fetch from API, but for now return a placeholder
    return Math.floor(Math.random() * 100) + 1;
  }, []);

  // Create story mutation
  const createStory = useMutation({
    mutationFn: async ({ 
      file, 
      type, 
      caption,
      onUploadProgress
    }: { 
      file?: File; 
      type: 'image' | 'video' | 'text'; 
      caption?: string;
      onUploadProgress?: (progress: UploadProgress) => void;
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Stories zu erstellen');
        }

        if (type === 'text' && !caption) {
          throw new Error('Text-Stories benötigen eine Beschreibung');
        }

        if (type !== 'text' && !file) {
          throw new Error('Bitte wähle eine Datei aus');
        }

        let mediaUrl = '';
        
        // Für Text-Stories verwenden wir einen Platzhalter oder lassen media_url leer
        if (type === 'text') {
          mediaUrl = '/media/stories/text-placeholder.png'; // Optional: Platzhalter-Bild
        } else {
          // Für Bild/Video: Erst hochladen, dann URL verwenden
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await apiClient.upload<{ url: string }>('/upload/media/', formData, onUploadProgress);
          mediaUrl = uploadResponse.url;
        }

        // Story mit media_url und type erstellen
        const storyData = {
          media_url: mediaUrl,
          type: type, // Backend erwartet type, nicht story_type
          caption: caption || ''
        };

        const data = await storyAPI.createStory(storyData);
        return data;
      } catch (error) {
        console.error('Error creating story:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Story erfolgreich erstellt!');
      // Invalidate and refetch stories
      queryClient.invalidateQueries({ queryKey: ['stories', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'following'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Erstellen der Story');
    }
  });

  // Mark story as viewed
  const markStoryViewed = useMutation({
    mutationFn: async (storyId: number) => {
      return await storyAPI.markStoryViewed(storyId);
    },
    onSuccess: () => {
      // Invalidate stories to update viewed status
      queryClient.invalidateQueries({ queryKey: ['stories', 'following'] });
    }
  });

  // Like/Unlike story
  const toggleStoryLike = useMutation({
    mutationFn: async ({ storyId, action }: { storyId: number; action: 'like' | 'unlike' }) => {
      if (action === 'like') {
        return await storyAPI.likeStory(storyId);
      } else {
        return await storyAPI.unlikeStory(storyId);
      }
    },
    onSuccess: () => {
      // Invalidate stories to update like status
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });

  // Create story comment
  const createStoryComment = useMutation({
    mutationFn: async ({ storyId, content }: { storyId: number; content: string }) => {
      return await storyAPI.createStoryComment(storyId, { content });
    },
    onSuccess: () => {
      toast.success('Kommentar hinzugefügt!');
      // Invalidate story comments
      queryClient.invalidateQueries({ queryKey: ['story-comments'] });
    },
    onError: () => {
      toast.error('Fehler beim Hinzufügen des Kommentars');
    }
  });

  // Bookmark/Unbookmark story
  const toggleStoryBookmark = useMutation({
    mutationFn: async ({ storyId, action }: { storyId: number; action: 'bookmark' | 'unbookmark' }) => {
      if (action === 'bookmark') {
        return await storyAPI.bookmarkStory(storyId);
      } else {
        return await storyAPI.unbookmarkStory(storyId);
      }
    },
    onSuccess: () => {
      // Invalidate stories to update bookmark status
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });

  // Share story
  const shareStory = useMutation({
    mutationFn: async ({ storyId, shareData }: { storyId: number; shareData: Record<string, unknown> }) => {
      return await storyAPI.shareStory(storyId, shareData);
    },
    onSuccess: () => {
      toast.success('Story geteilt!');
    },
    onError: () => {
      toast.error('Fehler beim Teilen der Story');
    }
  });

  // Story Navigation Functions
  const setActiveStory = useCallback((group: StoryGroup, index: number = 0) => {
    setActiveStoryGroup(group);
    setActiveStoryIndex(index);
  }, []);

  const nextStory = useCallback(() => {
    if (!activeStoryGroup) return;
    
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      // Move to next group
      const currentGroupIndex = followingStories.findIndex(g => g.user_id === activeStoryGroup.user_id);
      if (currentGroupIndex < followingStories.length - 1) {
        const nextGroup = followingStories[currentGroupIndex + 1];
        setActiveStory(nextGroup, 0);
      }
    }
  }, [activeStoryGroup, activeStoryIndex, followingStories]);

  const previousStory = useCallback(() => {
    if (!activeStoryGroup) return;
    
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      // Move to previous group
      const currentGroupIndex = followingStories.findIndex(g => g.user_id === activeStoryGroup.user_id);
      if (currentGroupIndex > 0) {
        const prevGroup = followingStories[currentGroupIndex - 1];
        setActiveStory(prevGroup, prevGroup.stories.length - 1);
      }
    }
  }, [activeStoryGroup, activeStoryIndex, followingStories]);

  const closeStoryViewer = useCallback(() => {
    setActiveStoryGroup(null);
    setActiveStoryIndex(0);
  }, []);

  const formatTimeSince = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: de 
      });
    } catch {
      return 'vor einiger Zeit';
    }
  };

  return {
    // Data
    myStories,
    followingStories,
    isLoadingMyStories,
    isLoadingFollowingStories,
    myStoriesError,
    followingStoriesError,
    
    // Story Navigation State
    activeStoryGroup,
    activeStoryIndex,
    
    // Mutations
    createStory,
    markStoryViewed,
    toggleStoryLike,
    createStoryComment,
    toggleStoryBookmark,
    shareStory,
    
    // Navigation Functions
    setActiveStory,
    nextStory,
    previousStory,
    closeStoryViewer,
    getStoryViews,
    
    // Helper functions
    formatStoryTime: (dateString: string) => {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: de 
      });
    }
  };
};

export type { Story, StoryGroup, StoryView, StoryComment };
