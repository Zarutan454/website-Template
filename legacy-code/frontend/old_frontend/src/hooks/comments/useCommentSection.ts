
import { useState, useCallback } from 'react';

/**
 * Custom Hook für die Kommentarfunktionalität
 */
export const useCommentSection = (
  postId: string,
  getComments: () => Promise<Comment[]>,
  addComment: (content: string) => Promise<Comment | null>
) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Kommentare abrufen
  const fetchComments = useCallback(async () => {
    if (!postId) return [];
    
    try {
      setIsLoadingComments(true);
      const fetchedComments = await getComments();
      setComments(fetchedComments || []);
      return fetchedComments || []; // Fix: Return the comments array
    } catch (error) {
      return [];
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId, getComments]);

  // Kommentare anzeigen/ausblenden
  const toggleComments = useCallback(() => {
    const newState = !showComments;
    setShowComments(newState);
    
    if (newState && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, comments.length, fetchComments]);

  // Kommentar abschicken
  const handleSubmitComment = useCallback(async () => {
    if (!commentContent.trim() || !postId) return;
    
    try {
      await addComment(commentContent);
      setCommentContent('');
      // Kommentare neu laden, um den neuen Kommentar anzuzeigen
      await fetchComments();
    } catch (error) {
    }
  }, [commentContent, postId, addComment, fetchComments]);

  return {
    comments,
    isLoadingComments,
    commentContent,
    showComments,
    setCommentContent,
    toggleComments,
    handleSubmitComment,
    fetchComments
  };
};
