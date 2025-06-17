
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePost = (
  postId: string, 
  userId?: string,
  onLike?: () => void,
  onComment?: () => void,
  onShare?: () => void
) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleLike = async () => {
    if (!userId) return;

    try {
      if (liked) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);
          
        if (error) throw error;
        
        // Decrement likes count in posts
        await supabase.rpc('decrement_likes', { post_id: postId });
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            post_id: postId
          });
          
        if (error) throw error;
        
        // Increment likes count in posts
        await supabase.rpc('increment_likes', { post_id: postId });
        
        onLike?.();
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      toast.error('Fehler beim Liken/Unliken des Beitrags');
    }
  };

  const handleBookmark = async () => {
    if (!userId) return;

    try {
      if (bookmarked) {
        // Unbookmark the post
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);
          
        if (error) throw error;
        
        toast.info('Lesezeichen entfernt');
      } else {
        // Bookmark the post
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            post_id: postId
          });
          
        if (error) throw error;
        
        toast.success('Zu Lesezeichen hinzugefügt');
      }
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Fehler beim Setzen des Lesezeichens');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: userId,
          post_id: postId,
          content: commentText.trim()
        });
      
      if (error) throw error;
      
      // Increment comments count
      await supabase.rpc('increment_comments', { post_id: postId });
      
      setCommentText('');
      toast.success('Kommentar hinzugefügt');
      onComment?.();
    } catch (error) {
      console.error('Error commenting:', error);
      toast.error('Fehler beim Erstellen des Kommentars');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    // You can implement sharing functionality here
    onShare?.();
  };

  const handleEdit = async (content: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('author_id', userId);
        
      if (error) throw error;
      
      toast.success('Beitrag aktualisiert');
      setIsEditing(false);
      setEditedContent('');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Fehler beim Aktualisieren des Beitrags');
    }
  };

  const handleDelete = async () => {
    if (!userId) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', userId);
        
      if (error) throw error;
      
      toast.success('Beitrag gelöscht');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Fehler beim Löschen des Beitrags');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async (reason: string) => {
    if (!userId) return;

    try {
      setIsReporting(true);
      // Here you would typically have a table for reported posts
      // For now, we'll just show a toast
      toast.success('Beitrag wurde gemeldet. Vielen Dank für deinen Hinweis.');
      setReportReason('');
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Fehler beim Melden des Beitrags');
    } finally {
      setIsReporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://blockchain-social.network/post/${postId}`);
    toast.success('Link in die Zwischenablage kopiert');
  };

  return {
    liked,
    bookmarked,
    showComments,
    commentText,
    isSubmittingComment,
    isEditing,
    editedContent,
    isDeleting,
    isReporting,
    reportReason,
    handleLike,
    handleBookmark,
    handleComment,
    handleShare,
    handleEdit,
    handleDelete,
    handleReport,
    handleCopyLink,
    setShowComments,
    setCommentText,
    setIsEditing,
    setEditedContent,
    setReportReason
  };
};
