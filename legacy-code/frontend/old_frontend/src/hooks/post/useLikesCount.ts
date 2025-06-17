
import { useState, useEffect, useCallback } from 'react';
import { interactionRepository } from '@/repositories/InteractionRepository';

/**
 * Hook zur Verwaltung der Likes-Anzahl für einen Post
 */
export const useLikesCount = (postId: string) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  /**
   * Lädt die Anzahl der Likes für den Post
   */
  const fetchLikesCount = useCallback(async () => {
    if (!postId) {
      setLikesCount(0);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Verwende die API-Funktion aus dem InteractionRepository
      const count = await interactionRepository.getPostLikesCount(postId);
      
      setLikesCount(count);
    } catch (error) {
      console.error('[useLikesCount] Fehler beim Laden der Likes-Anzahl:', error);
      setLikesCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // Initialisiere Likes-Anzahl beim ersten Laden
  useEffect(() => {
    fetchLikesCount();
  }, [postId, fetchLikesCount]);

  return {
    likesCount,
    setLikesCount,
    fetchLikesCount,
    isLoading
  };
};
