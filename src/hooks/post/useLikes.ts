import { useLikeActions } from './useLikeActions';

/**
 * Hook zum Verwalten von Like-Funktionalitäten für Posts
 * Wrapper für die zentrale useLikeActions Logik
 */
export const useLikes = (postId: string, userId?: string, onLike?: () => void) => {
  // Verwende die zentrale Like-Logik
  const likeActions = useLikeActions(postId, userId, onLike);

  // Alias für bessere Kompatibilität
  const handleLike = likeActions.toggleLike;

  return {
    // State
    liked: likeActions.liked,
    setLiked: likeActions.setLiked,
    likesCount: likeActions.likesCount,
    setLikesCount: likeActions.setLikesCount,
    isLoading: likeActions.isLoading,
    isProcessing: likeActions.isProcessing,
    
    // Actions
    handleLike,
    checkLikeStatus: likeActions.checkLikeStatus,
    fetchLikesCount: likeActions.fetchLikesCount,
    refreshLikeData: likeActions.refreshLikeData
  };
};
