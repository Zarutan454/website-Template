import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { interactionRepository } from '@/repositories/InteractionRepository';

/**
 * Zentrale Like-Logik für Posts
 * Kombiniert alle Like-Funktionalitäten in einem Hook
 */
export const useLikeActions = (postId: string, userId?: string, onLikeComplete?: () => void) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Prüft, ob der Post vom aktuellen Benutzer geliked wurde
   */
  const checkLikeStatus = useCallback(async () => {
    if (!userId || !postId) {
      setLiked(false);
      return;
    }
    
    try {
      const isLiked = await interactionRepository.isPostLikedByUser(postId);
      setLiked(isLiked);
    } catch (error) {
      console.error('[useLikeActions] Fehler beim Prüfen des Like-Status:', error);
      setLiked(false);
    }
  }, [postId, userId]);

  /**
   * Lädt die Anzahl der Likes für den Post
   */
  const fetchLikesCount = useCallback(async () => {
    if (!postId) {
      setLikesCount(0);
      return;
    }
    
    try {
      const count = await interactionRepository.getPostLikesCount(postId);
      setLikesCount(count);
    } catch (error) {
      console.error('[useLikeActions] Fehler beim Laden der Likes-Anzahl:', error);
      setLikesCount(0);
    }
  }, [postId]);

  /**
   * Behandelt die Like-Aktion mit optimistischem UI-Update
   */
  const toggleLike = async () => {
    if (!userId || isProcessing) {
      if (!userId) {
        toast.error("Bitte melde dich an, um Beiträge zu liken");
      }
      return false;
    }

    // Optimistische UI-Aktualisierung
    const newLikedState = !liked;
    const newLikesCount = newLikedState 
      ? likesCount + 1 
      : Math.max(0, likesCount - 1);
    
    setLiked(newLikedState);
    setLikesCount(newLikesCount);
    
    try {
      setIsProcessing(true);
      // API-Aufruf zum Togglen des Likes
      const result = await interactionRepository.togglePostLike(postId);
      
      if (result.success) {
        // Falls das Backend-Ergebnis anders ist als unsere optimistische Aktualisierung,
        // aktualisieren wir den UI-Status entsprechend
        if (result.isLiked !== newLikedState) {
          setLiked(result.isLiked);
        }
        
        if (result.likesCount !== newLikesCount) {
          setLikesCount(result.likesCount);
        }
        
        // Callback, falls vorhanden
        if (onLikeComplete) {
          onLikeComplete();
        }
        
        return result.isLiked;
      } else {
        // Bei Fehlschlag den ursprünglichen Zustand wiederherstellen
        setLiked(!newLikedState);
        setLikesCount(newLikesCount === likesCount + 1 ? likesCount : likesCount + 1);
        toast.error("Fehler beim Liken des Beitrags");
        return !newLikedState;
      }
    } catch (error) {
      console.error('[useLikeActions] Error toggling like:', error);
      
      // Bei Fehler den ursprünglichen Zustand wiederherstellen
      setLiked(!newLikedState);
      setLikesCount(newLikesCount === likesCount + 1 ? likesCount : likesCount + 1);
      
      toast.error("Ein Fehler ist aufgetreten");
      return !newLikedState;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Manuelle Aktualisierung der Like-Daten
   */
  const refreshLikeData = async () => {
    setIsLoading(true);
    await Promise.all([
      checkLikeStatus(),
      fetchLikesCount()
    ]);
    setIsLoading(false);
  };

  // Initialisiere Like-Daten beim ersten Laden
  useEffect(() => {
    const initializeLikeData = async () => {
      setIsLoading(true);
      await Promise.all([
        checkLikeStatus(),
        fetchLikesCount()
      ]);
      setIsLoading(false);
    };

    initializeLikeData();
  }, [postId, userId, checkLikeStatus, fetchLikesCount]);

  return {
    // State
    liked,
    setLiked,
    likesCount,
    setLikesCount,
    isLoading,
    isProcessing,
    
    // Actions
    toggleLike,
    checkLikeStatus,
    fetchLikesCount,
    refreshLikeData
  };
}; 
