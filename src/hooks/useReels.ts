import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, UploadProgress } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext.utils';

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
  const { user: profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  
  const { data: reels, isLoading: isLoadingReels } = useQuery({
    queryKey: ['reels', profile?.id],
    queryFn: async () => {
      try {
        if (!profile) return [];
        const reelsData = await apiClient.get<Reel[]>('/reels/');
        return reelsData || [];
      } catch (error) {
        console.error('Error fetching reels:', error);
        toast.error('Fehler beim Laden der Reels');
        return [];
      }
    },
    enabled: !!profile,
    refetchInterval: 60000, // Refetch every minute
  });
  
  const getUserReels = async (userId: string): Promise<Reel[]> => {
    try {
      const data = await apiClient.get<Reel[]>(`/reels/user/${userId}/`);
      return data || [];
    } catch (error) {
      console.error('Error fetching user reels:', error);
      toast.error('Fehler beim Laden der Reels');
      return [];
    }
  };
  
  const getReelComments = async (reelId: string): Promise<ReelComment[]> => {
    try {
      const data = await apiClient.get<ReelComment[]>(`/reels/${reelId}/comments/`);
      return data || [];
    } catch (error) {
      console.error('Error fetching reel comments:', error);
      toast.error('Fehler beim Laden der Kommentare');
      return [];
    }
  };
  
  const createReel = useMutation<Reel, Error, { 
    videoFile: File; 
    thumbnailFile?: File; 
    caption?: string; 
    tags?: string[];
    onUploadProgress?: (progress: UploadProgress) => void;
  }>({
    mutationFn: async ({ 
      videoFile, 
      thumbnailFile, 
      caption, 
      tags,
      onUploadProgress
    }: { 
      videoFile: File; 
      thumbnailFile?: File; 
      caption?: string; 
      tags?: string[];
      onUploadProgress?: (progress: UploadProgress) => void;
    }) => {
      try {
        if (!profile) {
          throw new Error('Du musst angemeldet sein, um Reels zu erstellen');
        }
        
        if (!videoFile) {
          throw new Error('Bitte wähle ein Video aus');
        }
        
        const formData = new FormData();
        formData.append('video', videoFile);
        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        }
        if (caption) {
          formData.append('caption', caption);
        }
        if (tags) {
          formData.append('tags', JSON.stringify(tags));
        }
        
        const data = await apiClient.upload<Reel>('/reels/', formData, onUploadProgress);
        return data;
      } catch (error) {
        console.error('Error creating reel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel erfolgreich erstellt!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Erstellen des Reels');
    }
  });
  
  const likeReel = useMutation<{ liked: boolean }, Error, string>({
    mutationFn: async (reelId: string) => {
      try {
        const response = await apiClient.post<{ liked: boolean }>(`/reels/${reelId}/like/`);
        return response;
      } catch (error) {
        console.error('Error liking reel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Liken des Reels');
    }
  });
  
  const commentOnReel = useMutation<ReelComment, Error, { reelId: string; content: string }>({
    mutationFn: async ({ reelId, content }: { reelId: string; content: string }) => {
      try {
        const data = await apiClient.post<ReelComment>(`/reels/${reelId}/comments/`, { content });
        return data;
      } catch (error) {
        console.error('Error commenting on reel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reel-comments'] });
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Kommentar hinzugefügt!');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Hinzufügen des Kommentars');
    }
  });
  
  const deleteReel = useMutation<boolean, Error, string>({
    mutationFn: async (reelId: string) => {
      try {
        await apiClient.delete(`/reels/${reelId}/`);
        return true;
      } catch (error) {
        console.error('Error deleting reel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel gelöscht!');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen des Reels');
    }
  });
  
  const shareReel = useMutation<{ shared: boolean }, Error, string>({
    mutationFn: async (reelId: string) => {
      try {
        const response = await apiClient.post<{ shared: boolean }>(`/reels/${reelId}/share/`);
        return response;
      } catch (error) {
        console.error('Error sharing reel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel geteilt!');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Teilen des Reels');
    }
  });

  const formatTimeSince = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: de 
      });
    } catch (error) {
      return 'Unbekannt';
    }
  };

  return {
    reels: reels || [],
    isLoadingReels,
    activeReelIndex,
    setActiveReelIndex,
    getUserReels,
    getReelComments,
    createReel: createReel,
    likeReel: likeReel,
    commentOnReel: commentOnReel,
    deleteReel: deleteReel,
    shareReel: shareReel,
    isCreatingReel: createReel.isPending,
    isLikingReel: likeReel.isPending,
    isCommentingReel: commentOnReel.isPending,
    isDeletingReel: deleteReel.isPending,
    isSharingReel: shareReel.isPending,
    formatTimeSince
  };
};

