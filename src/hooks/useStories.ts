import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, UploadProgress } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

export interface Story {
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
}

export interface StoryView {
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

export interface StoryGroup {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export const useStories = () => {
  const { user: profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeStoryGroup, setActiveStoryGroup] = useState<StoryGroup | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const { data: followingStories, isLoading: isLoadingFollowingStories } = useQuery({
    queryKey: ['following-stories', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];
        
        const data = await apiClient.get<StoryGroup[]>('/stories/following/');
        return data || [];
      } catch (error) {
        // Don't show error for 404 - stories feature not implemented yet
        if (error instanceof Error && error.message !== 'Not Found') {
          console.error('Error fetching stories:', error);
          toast.error('Fehler beim Laden der Stories');
        }
        return [];
      }
    },
    enabled: !!profile,
    refetchInterval: 60000,
  });

  const { data: myStories, isLoading: isLoadingMyStories } = useQuery({
    queryKey: ['my-stories', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];
        
        const data = await apiClient.get<Story[]>('/stories/my/');
        return data || [];
      } catch (error) {
        // Don't show error for 404 - stories feature not implemented yet
        if (error instanceof Error && error.message !== 'Not Found') {
          console.error('Error fetching my stories:', error);
          toast.error('Fehler beim Laden deiner Stories');
        }
        return [];
      }
    },
    enabled: !!profile,
  });

  const getStoryViews = async (storyId: string): Promise<StoryView[]> => {
    try {
      const data = await apiClient.get<StoryView[]>(`/stories/${storyId}/views/`);
      return data || [];
    } catch (error) {
      console.error('Error fetching story views:', error);
      toast.error('Fehler beim Laden der Story-Ansichten');
      return [];
    }
  };

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

        // Story mit media_url und expires_at erstellen
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h von jetzt
        
        const storyData = {
          media_url: mediaUrl,
          expires_at: expiresAt,
          type: type,
          caption: caption || ''
        };

        const data = await apiClient.post<Story>('/stories/', storyData);
        return data;
      } catch (error) {
        console.error('Error creating story:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      queryClient.invalidateQueries({ queryKey: ['following-stories'] });
      toast.success('Story erfolgreich erstellt!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Erstellen der Story');
    },
  });

  const viewStory = useMutation({
    mutationFn: async ({ storyId }: { storyId: string }) => {
      if (!profile) return;
      
      const response = await apiClient.post<{ viewed: boolean }>(`/stories/${storyId}/view/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following-stories'] });
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      if (!profile) return;
      
      await apiClient.delete(`/stories/${storyId}/`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      queryClient.invalidateQueries({ queryKey: ['following-stories'] });
      toast.success('Story gelöscht!');
    },
    onError: () => {
      toast.error('Fehler beim Löschen der Story');
    },
  });

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

  const setActiveStory = (groupIndex: number, storyIndex: number = 0) => {
    if (!followingStories || groupIndex < 0 || groupIndex >= followingStories.length) {
      return;
    }
    
    const group = followingStories[groupIndex];
    if (!group.stories || storyIndex < 0 || storyIndex >= group.stories.length) {
      return;
    }
    
    setActiveStoryGroup(group);
    setActiveStoryIndex(storyIndex);
  };

  const nextStory = () => {
    if (!activeStoryGroup) return;
    
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      // Move to next group
      const currentGroupIndex = followingStories?.findIndex(group => group.user_id === activeStoryGroup.user_id) || -1;
      if (currentGroupIndex >= 0 && currentGroupIndex < (followingStories?.length || 0) - 1) {
        setActiveStory(currentGroupIndex + 1, 0);
      }
    }
  };

  const previousStory = () => {
    if (!activeStoryGroup) return;
    
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      // Move to previous group
      const currentGroupIndex = followingStories?.findIndex(group => group.user_id === activeStoryGroup.user_id) || -1;
      if (currentGroupIndex > 0) {
        const previousGroup = followingStories?.[currentGroupIndex - 1];
        if (previousGroup) {
          setActiveStory(currentGroupIndex - 1, previousGroup.stories.length - 1);
        }
      }
    }
  };

  const closeStoryViewer = () => {
    setActiveStoryGroup(null);
    setActiveStoryIndex(0);
  };

  return {
    followingStories: followingStories || [],
    myStories: myStories || [],
    isLoadingFollowingStories,
    isLoadingMyStories,
    activeStoryGroup,
    activeStoryIndex,
    createStory: createStory,
    viewStory: viewStory.mutate,
    deleteStory: deleteStory.mutate,
    getStoryViews,
    setActiveStory,
    nextStory,
    previousStory,
    closeStoryViewer,
    formatTimeSince,
    isCreatingStory: createStory.isPending,
    isViewingStory: viewStory.isPending,
    isDeletingStory: deleteStory.isPending
  };
};
