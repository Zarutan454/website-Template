import { useCallback } from 'react';
import { postRepository } from '@/repositories/PostRepository';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CreatePostData } from '@/types/posts';

/**
 * Hook für Post-Aktionen wie Liken, Löschen, Teilen
 */
export const usePostActions = (
  setPosts: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>,
  setAdaptedPosts: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>,
  fetchPosts: (feedType?: string) => Promise<void>
) => {
  /**
   * Erstellt einen neuen Post
   */
  const createPost = useCallback(async (profileId: string, postData: CreatePostData) => {
    if (!profileId) {
      toast.error("Du musst angemeldet sein, um einen Beitrag zu erstellen");
      return { success: false, error: "Not authenticated" };
    }
    
    try {
      const result = await postRepository.createPost(
        profileId,
        postData
      );
      
      if (!result.success) throw result.error;
      
      // Posts neu laden
      await fetchPosts();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error('Fehler beim Erstellen des Beitrags');
      return { success: false, error: err };
    }
  }, [fetchPosts]);

  /**
   * Likt oder Unlikt einen Post
   */
  const likePost = useCallback(async (postId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      console.log(`[usePostActions] Toggle like for post ${postId} by user ${userData.user.id}`);
      
      // Check if post is already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('post_id', postId)
        .single();
      
      if (existingLike) {
        // Unlike post
        console.log(`[usePostActions] User ${userData.user.id} is unliking post ${postId}`);
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('post_id', postId);
        
        if (deleteError) throw deleteError;
        
        // Decrement likes count in the posts table
        const { error: updateError } = await supabase.rpc('decrement_likes', { post_id: postId });
        if (updateError) {
          console.error('[usePostActions] Error decrementing likes count:', updateError);
        }
        
        // Update local state
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1), is_liked_by_user: false } : p
        ));
        
        // Also update adaptedPosts
        setAdaptedPosts(prev => prev.map((p: any) => 
          p.id === postId ? { ...p, likesCount: Math.max(0, p.likesCount - 1), isLiked: false } : p
        ));
        
        return false; // Return false for "unliked"
      } else {
        // Like post
        console.log(`[usePostActions] User ${userData.user.id} is liking post ${postId}`);
        const { error: insertError } = await supabase
          .from('likes')
          .insert([
            { user_id: userData.user.id, post_id: postId }
          ]);
        
        if (insertError) throw insertError;
        
        // Increment likes count in the posts table
        const { error: updateError } = await supabase.rpc('increment_likes', { post_id: postId });
        if (updateError) {
          console.error('[usePostActions] Error incrementing likes count:', updateError);
        }
        
        // Get post author to create notification
        const { data: postData } = await supabase
          .from('posts')
          .select('author_id')
          .eq('id', postId)
          .single();
        
        // Create notification if the liker is not the author
        if (postData && postData.author_id !== userData.user.id) {
          console.log(`[usePostActions] Creating like notification for post author ${postData.author_id}`);
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([
              {
                user_id: postData.author_id,
                type: 'like',
                content: 'hat deinen Beitrag geliked',
                actor_id: userData.user.id,
                target_id: postId,
                target_type: 'post'
              }
            ]);
            
          if (notificationError) {
            console.error('[usePostActions] Error creating like notification:', notificationError);
          }
        }
        
        // Update local state
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: p.likes_count + 1, is_liked_by_user: true } : p
        ));
        
        // Also update adaptedPosts
        setAdaptedPosts(prev => prev.map((p: any) => 
          p.id === postId ? { ...p, likesCount: p.likesCount + 1, isLiked: true } : p
        ));
        
        return true; // Return true for "liked"
      }
    } catch (err: any) {
      console.error('[usePostActions] Error liking post:', err);
      toast.error('Fehler beim Liken des Posts');
      return false;
    }
  }, [setPosts, setAdaptedPosts]);

  /**
   * Löscht einen Post
   */
  const deletePost = useCallback(async (postId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      // Check if user owns the post
      const { data: postData } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      if (postData.author_id !== userData.user.id) {
        throw new Error('Not authorized to delete this post');
      }
      
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (deleteError) throw deleteError;
      
      // Update local state
      setPosts(prev => prev.filter(p => p.id !== postId));
      setAdaptedPosts(prev => prev.filter((p: any) => p.id !== postId));
      
      toast.success('Beitrag wurde gelöscht');
      return true;
    } catch (err: any) {
      console.error('Error deleting post:', err);
      toast.error(err.message || 'Fehler beim Löschen des Beitrags');
      return false;
    }
  }, [setPosts, setAdaptedPosts]);

  /**
   * Teilt einen Post
   */
  const sharePost = useCallback(async (postId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      // Record share
      const { error: shareError } = await supabase
        .from('post_shares')
        .insert([
          { user_id: userData.user.id, post_id: postId }
        ]);
      
      if (shareError) {
        // Falls die Tabelle nicht existiert, verwenden wir die RPC-Funktion für Shares
        console.log('[usePostActions] post_shares table might not exist, using RPC function instead');
        const { error: rpcError } = await supabase.rpc('increment_shares', { post_id: postId });
        if (rpcError) throw rpcError;
      } else {
        // Wenn die Tabelle existiert, erhöhen wir auch den Zähler
        await supabase.rpc('increment_shares', { post_id: postId });
      }
      
      // Get post author to create notification
      const { data: postData } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      // Create notification if the sharer is not the author
      if (postData && postData.author_id !== userData.user.id) {
        console.log(`[usePostActions] Creating share notification for post author ${postData.author_id}`);
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: postData.author_id,
              type: 'share',
              content: 'hat deinen Beitrag geteilt',
              actor_id: userData.user.id,
              target_id: postId,
              target_type: 'post'
            }
          ]);
          
        if (notificationError) {
          console.error('[usePostActions] Error creating share notification:', notificationError);
        }
      }
      
      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, shares_count: p.shares_count + 1 } : p
      ));
      
      // Also update adaptedPosts
      setAdaptedPosts(prev => prev.map((p: any) => 
        p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p
      ));
      
      toast.success('Beitrag wurde geteilt');
      return true;
    } catch (err: any) {
      console.error('[usePostActions] Error sharing post:', err);
      toast.error('Fehler beim Teilen des Beitrags');
      return false;
    }
  }, [setPosts, setAdaptedPosts]);

  return {
    createPost,
    likePost,
    deletePost,
    sharePost
  };
};
