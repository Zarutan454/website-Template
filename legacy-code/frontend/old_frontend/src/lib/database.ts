
import { supabase } from './supabase';

// Post actions
export const likePost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({ user_id: userId, post_id: postId });
    
  // Update the likes count in the posts table
  if (!error) {
    await supabase.rpc('increment_likes', { post_id: postId });
  }
  
  return { data, error };
};

export const unlikePost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
    
  // Update the likes count in the posts table
  if (!error) {
    await supabase.rpc('decrement_likes', { post_id: postId });
  }
  
  return { data, error };
};

export const bookmarkPost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, post_id: postId });
    
  return { data, error };
};

export const unbookmarkPost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
    
  return { data, error };
};

export const createComment = async (userId: string, postId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      post_id: postId,
      content
    });
    
  // Update the comments count in the posts table
  if (!error) {
    await supabase.rpc('increment_comments', { post_id: postId });
  }
  
  return { data, error };
};

export const updatePost = async (userId: string, postId: string, updates: { content: string }) => {
  const { data, error } = await supabase
    .from('posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)
    .eq('author_id', userId);
    
  return { data, error };
};

export const deletePost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', userId);
    
  return { data, error };
};

export const reportPost = async (userId: string, postId: string, reason: string) => {
  // In a real implementation, you would have a table for reports
  // This is a placeholder implementation
  return { data: null, error: null };
};
