import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useProfile } from './useProfile';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { uploadFile, UploadResult } from '../utils/storageUtils';

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  caption?: string;
  tags?: string[];
  duration?: number;
  likes: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  liked_by_me?: boolean;
}

export interface ReelComment {
  id: string;
  reel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useReels = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  
  const { data: reels, isLoading: isLoadingReels } = useQuery({
    queryKey: ['reels'],
    queryFn: async () => {
      try {
        const { data: reelsData, error: reelsError } = await supabase
          .from('reels')
          .select(`
            *,
            user:user_id(id, username, display_name, avatar_url)
          `)
          .order('created_at', { ascending: false });
          
        if (reelsError) throw reelsError;
        
        if (profile) {
          const { data: likesData, error: likesError } = await supabase
            .from('reel_likes')
            .select('reel_id')
            .eq('user_id', profile.id);
            
          if (likesError) throw likesError;
          
          const likedReelIds = new Set(likesData?.map(like => like.reel_id) || []);
          
          return reelsData?.map(reel => ({
            ...reel,
            liked_by_me: likedReelIds.has(reel.id)
          })) || [];
        }
        
        return reelsData || [];
      } catch (error) {
        console.error('Error fetching reels:', error);
        toast.error('Fehler beim Laden der Reels');
        return [];
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
  
  const getUserReels = async (userId: string): Promise<Reel[]> => {
    try {
      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          user:user_id(id, username, display_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (profile) {
        const { data: likesData, error: likesError } = await supabase
          .from('reel_likes')
          .select('reel_id')
          .eq('user_id', profile.id);
          
        if (likesError) throw likesError;
        
        const likedReelIds = new Set(likesData?.map(like => like.reel_id) || []);
        
        return data?.map(reel => ({
          ...reel,
          liked_by_me: likedReelIds.has(reel.id)
        })) || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user reels:', error);
      toast.error('Fehler beim Laden der Reels');
      return [];
    }
  };
  
  const getReelComments = async (reelId: string): Promise<ReelComment[]> => {
    try {
      const { data, error } = await supabase
        .from('reel_comments')
        .select(`
          *,
          user:user_id(id, username, display_name, avatar_url)
        `)
        .eq('reel_id', reelId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reel comments:', error);
      toast.error('Fehler beim Laden der Kommentare');
      return [];
    }
  };
  
  const createReel = useMutation({
    mutationFn: async ({ 
      videoFile, 
      thumbnailFile, 
      caption, 
      tags 
    }: { 
      videoFile: File; 
      thumbnailFile?: File; 
      caption?: string; 
      tags?: string[];
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Reels zu erstellen');
        }
        
        if (!videoFile) {
          throw new Error('Bitte wähle ein Video aus');
        }
        
        const videoResult = await uploadFile(videoFile, 'reels');
        
        if (videoResult.error) {
          throw new Error(videoResult.error);
        }
        
        let thumbnailUrl = '';
        if (thumbnailFile) {
          const thumbnailResult = await uploadFile(thumbnailFile, 'reels');
          
          if (thumbnailResult.error) {
            throw new Error(thumbnailResult.error);
          }
          
          thumbnailUrl = thumbnailResult.url;
        }
        
        const { data, error } = await supabase
          .from('reels')
          .insert({
            user_id: profile.id,
            video_url: videoResult.url,
            thumbnail_url: thumbnailUrl || null,
            caption: caption || null,
            tags: tags || null,
            likes: 0,
            comments_count: 0,
            shares_count: 0
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error creating reel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel erfolgreich erstellt');
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen des Reels: ${error.message}`);
    },
  });
  
  const likeReel = useMutation({
    mutationFn: async (reelId: string) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Reels zu liken');
        }
        
        const { data: existingLike, error: checkError } = await supabase
          .from('reel_likes')
          .select('id')
          .eq('reel_id', reelId)
          .eq('user_id', profile.id)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (existingLike) {
          const { error: unlikeError } = await supabase
            .from('reel_likes')
            .delete()
            .eq('id', existingLike.id);
            
          if (unlikeError) throw unlikeError;
          
          return { reelId, liked: false };
        }
        
        const { error: likeError } = await supabase
          .from('reel_likes')
          .insert({
            reel_id: reelId,
            user_id: profile.id
          });
          
        if (likeError) throw likeError;
        
        return { reelId, liked: true };
      } catch (error) {
        console.error('Error liking/unliking reel:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['reels'], (oldData: Reel[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(reel => 
          reel.id === result.reelId 
            ? { 
                ...reel, 
                liked_by_me: result.liked,
                likes: result.liked ? reel.likes + 1 : reel.likes - 1
              } 
            : reel
        );
      });
    },
    onError: () => {
      toast.error('Fehler beim Liken/Unliken des Reels');
    },
  });
  
  const commentOnReel = useMutation({
    mutationFn: async ({ reelId, content }: { reelId: string; content: string }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Reels zu kommentieren');
        }
        
        if (!content.trim()) {
          throw new Error('Bitte gib einen Kommentar ein');
        }
        
        const { data, error } = await supabase
          .from('reel_comments')
          .insert({
            reel_id: reelId,
            user_id: profile.id,
            content: content.trim()
          })
          .select(`
            *,
            user:user_id(id, username, display_name, avatar_url)
          `)
          .single();
          
        if (error) throw error;
        
        return { reelId, comment: data };
      } catch (error) {
        console.error('Error commenting on reel:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['reels'], (oldData: Reel[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(reel => 
          reel.id === result.reelId 
            ? { ...reel, comments_count: reel.comments_count + 1 } 
            : reel
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ['reel-comments', result.reelId] });
    },
    onError: () => {
      toast.error('Fehler beim Kommentieren des Reels');
    },
  });
  
  const deleteReel = useMutation({
    mutationFn: async (reelId: string) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Reels zu löschen');
        }
        
        const { error } = await supabase
          .from('reels')
          .delete()
          .eq('id', reelId)
          .eq('user_id', profile.id);
          
        if (error) throw error;
        
        return { reelId };
      } catch (error) {
        console.error('Error deleting reel:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['reels'], (oldData: Reel[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(reel => reel.id !== result.reelId);
      });
      
      toast.success('Reel erfolgreich gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Reels');
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
  
  useEffect(() => {
    const reelsChannel = supabase
      .channel('reels-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reels',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reels'] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(reelsChannel);
    };
  }, [queryClient]);
  
  return {
    reels,
    isLoadingReels,
    getUserReels,
    getReelComments,
    createReel,
    likeReel,
    commentOnReel,
    deleteReel,
    formatTimeSince,
    activeReelIndex,
    setActiveReelIndex
  };
};
