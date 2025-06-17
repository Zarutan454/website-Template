
import { useState } from 'react';
import { useLikeState } from './useLikeState';
import { useLikesCount } from './useLikesCount';
import { useLikeAction } from './useLikeAction';

/**
 * Hook zum Verwalten von Like-Funktionalitäten für Posts
 * Kombiniert useLikeState, useLikesCount und useLikeAction
 */
export const useLikes = (postId: string, userId?: string, onLike?: () => void) => {
  // Verwende die spezialisierten Hooks
  const { liked, setLiked, checkLikeStatus, isLoading: stateLoading } = useLikeState(postId, userId);
  const { likesCount, setLikesCount, fetchLikesCount, isLoading: countLoading } = useLikesCount(postId);
  const { handleLike: handleLikeAction, isProcessing } = useLikeAction(postId, userId, onLike);

  /**
   * Post liken oder Unlike-Status zurücksetzen mit optimistischem UI-Update
   */
  const handleLike = async () => {
    return handleLikeAction(liked, likesCount, setLiked, setLikesCount);
  };

  // Methode zur manuellen Aktualisierung der Like-Daten
  const refreshLikeData = async () => {
    await Promise.all([
      checkLikeStatus(),
      fetchLikesCount()
    ]);
  };

  // Kombinierter Ladezustand
  const isLoading = stateLoading || countLoading;

  return {
    liked,
    setLiked,
    likesCount,
    setLikesCount,
    handleLike,
    checkLikeStatus,
    fetchLikesCount,
    refreshLikeData,
    isLoading,
    isProcessing
  };
};
