import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useProfile } from './useProfile';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { uploadFile, UploadResult } from '../utils/storageUtils';

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
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [activeStoryGroup, setActiveStoryGroup] = useState<StoryGroup | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const { data: followingStories, isLoading: isLoadingFollowingStories } = useQuery({
    queryKey: ['following-stories', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];

        const { data: followingData, error: followingError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profile.id);

        if (followingError) throw followingError;

        if (!followingData || followingData.length === 0) {
          return [];
        }

        const followingIds = followingData.map(f => f.following_id);
        followingIds.push(profile.id); // Include current user's stories

        const now = new Date().toISOString();
        const { data: storiesData, error: storiesError } = await supabase
          .from('user_stories')
          .select(`
            *,
            user:user_id(id, username, display_name, avatar_url)
          `)
          .in('user_id', followingIds)
          .gt('expires_at', now)
          .order('created_at', { ascending: false });

        if (storiesError) throw storiesError;

        const { data: viewsData, error: viewsError } = await supabase
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', profile.id);

        if (viewsError) throw viewsError;

        const viewedStoryIds = new Set(viewsData?.map(v => v.story_id) || []);

        const storiesByUser: Record<string, StoryGroup> = {};
        
        storiesData?.forEach(story => {
          const userId = story.user_id;
          
          if (!storiesByUser[userId]) {
            storiesByUser[userId] = {
              user_id: userId,
              username: story.user?.username,
              display_name: story.user?.display_name,
              avatar_url: story.user?.avatar_url,
              stories: [],
              hasUnviewed: false
            };
          }
          
          const viewed = viewedStoryIds.has(story.id);
          
          storiesByUser[userId].stories.push({
            ...story,
            viewed
          });
          
          if (!viewed) {
            storiesByUser[userId].hasUnviewed = true;
          }
        });
        
        return Object.values(storiesByUser).sort((a, b) => {
          if (a.hasUnviewed && !b.hasUnviewed) return -1;
          if (!a.hasUnviewed && b.hasUnviewed) return 1;
          
          const aLatest = a.stories[0]?.created_at || '';
          const bLatest = b.stories[0]?.created_at || '';
          return bLatest.localeCompare(aLatest);
        });
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast.error('Fehler beim Laden der Stories');
        return [];
      }
    },
    enabled: !!profile,
    refetchInterval: 60000, // Refetch every minute to check for new stories
  });

  const { data: myStories, isLoading: isLoadingMyStories } = useQuery({
    queryKey: ['my-stories', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];

        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('user_stories')
          .select('*')
          .eq('user_id', profile.id)
          .gt('expires_at', now)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching my stories:', error);
        toast.error('Fehler beim Laden deiner Stories');
        return [];
      }
    },
    enabled: !!profile,
  });

  const getStoryViews = async (storyId: string): Promise<StoryView[]> => {
    try {
      const { data, error } = await supabase
        .from('story_views')
        .select(`
          *,
          viewer:viewer_id(id, username, display_name, avatar_url)
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching story views:', error);
      toast.error('Fehler beim Laden der Story-Aufrufe');
      return [];
    }
  };

  const createStory = useMutation({
    mutationFn: async ({ 
      file, 
      type, 
      caption 
    }: { 
      file?: File; 
      type: 'image' | 'video' | 'text'; 
      caption?: string;
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Stories zu erstellen');
        }

        let mediaUrl = '';
        
        if (file && (type === 'image' || type === 'video')) {
          const result = await uploadFile(file, 'stories');
          
          if (result.error) {
            throw new Error(result.error);
          }
          
          mediaUrl = result.url;
        }
        
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('user_stories')
          .insert({
            user_id: profile.id,
            media_url: mediaUrl,
            type,
            caption,
            expires_at: expiresAt
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error creating story:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      queryClient.invalidateQueries({ queryKey: ['following-stories'] });
      toast.success('Story erfolgreich erstellt');
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen der Story: ${error.message}`);
    },
  });

  const viewStory = useMutation({
    mutationFn: async (storyId: string) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Stories anzusehen');
        }
        
        const { data: existingView, error: checkError } = await supabase
          .from('story_views')
          .select('id')
          .eq('story_id', storyId)
          .eq('viewer_id', profile.id)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (existingView) return existingView;
        
        const { data, error } = await supabase
          .from('story_views')
          .insert({
            story_id: storyId,
            viewer_id: profile.id
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error marking story as viewed:', error);
        throw error;
      }
    },
    onSuccess: (_, storyId) => {
      queryClient.setQueryData(['following-stories', profile?.id], (oldData: StoryGroup[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(group => ({
          ...group,
          stories: group.stories.map(story => 
            story.id === storyId 
              ? { ...story, viewed: true } 
              : story
          ),
          hasUnviewed: group.stories.some(story => story.id !== storyId && !story.viewed)
        }));
      });
    },
    onError: () => {
      toast.error('Fehler beim Markieren der Story als angesehen');
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Stories zu löschen');
        }
        
        const { error } = await supabase
          .from('user_stories')
          .delete()
          .eq('id', storyId)
          .eq('user_id', profile.id);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting story:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      queryClient.invalidateQueries({ queryKey: ['following-stories'] });
      toast.success('Story erfolgreich gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen der Story');
    },
  });

  const formatTimeSince = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: de
      });
    } catch (error) {
      return '';
    }
  };

  const setActiveStory = (groupIndex: number, storyIndex: number = 0) => {
    if (followingStories && followingStories[groupIndex]) {
      setActiveStoryGroup(followingStories[groupIndex]);
      setActiveStoryIndex(storyIndex);
      
      const story = followingStories[groupIndex].stories[storyIndex];
      if (story && !story.viewed) {
        viewStory.mutate(story.id);
      }
    }
  };

  const goToNextStory = useCallback(() => {
    if (!activeStoryGroup) return;
    
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex(prev => {
        const nextIndex = prev + 1;
        const story = activeStoryGroup.stories[nextIndex];
        if (story && !story.viewed) {
          viewStory.mutate(story.id);
        }
        return nextIndex;
      });
    } else {
      const currentGroupIndex = followingStories?.findIndex(
        group => group.user_id === activeStoryGroup.user_id
      ) ?? -1;
      
      if (currentGroupIndex >= 0 && followingStories && currentGroupIndex < followingStories.length - 1) {
        setActiveStory(currentGroupIndex + 1, 0);
      } else {
        setActiveStoryGroup(null);
      }
    }
  }, [activeStoryGroup, activeStoryIndex, followingStories, viewStory]);

  const goToPrevStory = useCallback(() => {
    if (!activeStoryGroup) return;
    
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else {
      const currentGroupIndex = followingStories?.findIndex(
        group => group.user_id === activeStoryGroup.user_id
      ) ?? -1;
      
      if (currentGroupIndex > 0 && followingStories) {
        const prevGroup = followingStories[currentGroupIndex - 1];
        setActiveStoryGroup(prevGroup);
        setActiveStoryIndex(prevGroup.stories.length - 1);
      } else {
        setActiveStoryGroup(null);
      }
    }
  }, [activeStoryGroup, activeStoryIndex, followingStories]);

  const closeStoryViewer = () => {
    setActiveStoryGroup(null);
    setActiveStoryIndex(0);
  };

  useEffect(() => {
    if (!profile) return;

    const storyChannel = supabase
      .channel('stories-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_stories',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['following-stories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storyChannel);
    };
  }, [profile, queryClient]);

  return {
    followingStories,
    isLoadingFollowingStories,
    myStories,
    isLoadingMyStories,
    getStoryViews,
    createStory,
    viewStory,
    deleteStory,
    formatTimeSince,
    activeStoryGroup,
    activeStoryIndex,
    setActiveStory,
    goToNextStory,
    goToPrevStory,
    closeStoryViewer
  };
};
