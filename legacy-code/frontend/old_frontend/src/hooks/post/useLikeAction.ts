
import { useState } from 'react';
import { toast } from 'sonner';
import { interactionRepository } from '@/repositories/InteractionRepository';

/**
 * Hook zum Verwalten der Like-Aktion für einen Post
 */
export const useLikeAction = (
  postId: string, 
  userId?: string, 
  onLikeComplete?: () => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Behandelt die Like-Aktion mit optimistischem UI-Update
   */
  const handleLike = async (
    currentlyLiked: boolean,
    currentLikesCount: number,
    setLiked: (isLiked: boolean) => void,
    setLikesCount: (count: number) => void
  ) => {
    if (!userId || isProcessing) {
      if (!userId) {
        toast.error("Bitte melde dich an, um Beiträge zu liken");
      }
      return false;
    }

    // Optimistische UI-Aktualisierung
    const newLikedState = !currentlyLiked;
    const newLikesCount = newLikedState 
      ? currentLikesCount + 1 
      : Math.max(0, currentLikesCount - 1);
    
    setLiked(newLikedState);
    setLikesCount(newLikesCount);
    
    try {
      setIsProcessing(true);
      // API-Aufruf zum Togglen des Likes
      const result = await interactionRepository.togglePostLike(userId, postId);
      
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
        setLiked(currentlyLiked);
        setLikesCount(currentLikesCount);
        toast.error("Fehler beim Liken des Beitrags");
        return currentlyLiked;
      }
    } catch (error) {
      console.error(`[useLikeAction] Error toggling like:`, error);
      
      // Bei Fehler den ursprünglichen Zustand wiederherstellen
      setLiked(currentlyLiked);
      setLikesCount(currentLikesCount);
      
      toast.error("Ein Fehler ist aufgetreten");
      return currentlyLiked;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleLike,
    isProcessing
  };
};
