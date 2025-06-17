
import { useState, useEffect, useCallback } from 'react';
import { interactionRepository } from '@/repositories/InteractionRepository';

/**
 * Hook zum Verwalten des Like-Status eines Posts
 */
export const useLikeState = (postId: string, userId?: string) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Prüft, ob der Post vom aktuellen Benutzer geliked wurde
   */
  const checkLikeStatus = useCallback(async () => {
    if (!userId || !postId) {
      setLiked(false);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const isLiked = await interactionRepository.isPostLikedByUser(userId, postId);
      
      setLiked(isLiked);
    } catch (error) {
      console.error('[useLikeState] Fehler beim Prüfen des Like-Status:', error);
      setLiked(false);
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId]);

  // Initialisiere Like-Status beim ersten Laden
  useEffect(() => {
    checkLikeStatus();
  }, [postId, userId, checkLikeStatus]);

  return {
    liked,
    setLiked,
    checkLikeStatus,
    isLoading
  };
};
