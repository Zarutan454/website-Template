
import { supabase } from '@/lib/supabase';
import { CreatePostData } from '@/types/posts';
import { toast } from 'sonner';
import { BaseRepository } from './BaseRepository';
import { interactionRepository } from './InteractionRepository';

/**
 * Repository für Post-bezogene Datenbankoperationen
 */
class PostRepository extends BaseRepository {
  /**
   * Erstellt einen neuen Post
   */
  async createPost(userId: string, data: CreatePostData) {
    try {
      // Hashtags aus dem Inhalt extrahieren, wenn vorhanden
      const hashtags = this.extractHashtags(data.content);
      
      const { data: post, error } = await this.supabase
        .from('posts')
        .insert([{
          author_id: userId,
          content: data.content,
          media_url: data.media_url || null,
          media_type: data.media_type || null,
          hashtags: hashtags
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, post };
    } catch (error: unknown) {
      return { success: false, error };
    }
  }
  
  /**
   * Lädt Posts für einen bestimmten Feed-Typ
   */
  async getFeedPosts(feedType: string, userId: string) {
    try {
      // Basisabfrage mit Join zu den Benutzerprofilen (über users statt profiles)
      let query = this.supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      // Filter je nach Feed-Typ anwenden
      if (feedType === 'following') {
        // Posts von Benutzern, denen der aktuelle Benutzer folgt
        const { data: followingIds } = await this.supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);
        
        if (followingIds && followingIds.length > 0) {
          const ids = followingIds.map(f => f.following_id);
          query = query.in('author_id', ids);
        } else {
          // Keine Follows, leere Liste zurückgeben
          return [];
        }
      } else if (feedType === 'popular') {
        // Beliebte Posts nach Likes sortieren
        query = query.order('likes_count', { ascending: false });
      } else if (feedType === 'tokens' || feedType === 'nfts') {
        // Spezialisierte Feeds werden clientseitig gefiltert
        // hier könnten wir später spezielle Server-Queries hinzufügen
      }
      
      const { data: posts, error } = await query;
      
      if (error) throw error;
      
      // Post-Processing für clientseitigen State
      const processedPosts = await this.processPostsForClient(posts, userId);
      
      return processedPosts;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Verarbeitet Posts für die Client-Anzeige
   */
  private async processPostsForClient(posts: any[], userId: string) {
    try {
      // Check if posts exist and are an array
      if (!posts || !Array.isArray(posts)) return [];
      
      // For each post, check if the user has liked it
      const processedPosts = await Promise.all(posts.map(async (post) => {
        // Check if post is liked by the current user using interactionRepository
        const isLiked = await interactionRepository.isPostLikedByUser(userId, post.id);
        
        // Add is_liked_by_user flag
        return {
          ...post,
          is_liked_by_user: isLiked
        };
      }));
      
      return processedPosts;
    } catch (error) {
      return posts; // Return original posts if processing fails
    }
  }
  
  /**
   * Aktualisiert einen Post
   */
  async updatePost(postId: string, userId: string, data: Partial<CreatePostData>) {
    try {
      // Check if user is the author of the post
      const { data: post, error: fetchError } = await this.supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('author_id', userId)
        .single();
      
      if (fetchError || !post) {
        throw new Error('Post not found or you are not authorized to update it');
      }
      
      // Extract hashtags from content if provided
      let hashtags = undefined;
      if (data.content) {
        hashtags = this.extractHashtags(data.content);
      }
      
      // Update the post
      const { data: updatedPost, error } = await this.supabase
        .from('posts')
        .update({
          ...data,
          hashtags,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, post: updatedPost };
    } catch (error: unknown) {
      return { success: false, error };
    }
  }
  
  /**
   * Löscht einen Post
   */
  async deletePost(postId: string) {
    try {
      const { error } = await this.supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Liked oder unlikt einen Post - delegiert an InteractionRepository
   */
  async togglePostLike(userId: string, postId: string) {
    return await interactionRepository.togglePostLike(userId, postId);
  }
  
  /**
   * Prüft, ob ein Post von einem Benutzer geliked wurde - delegiert an InteractionRepository
   */
  async isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
    return await interactionRepository.isPostLikedByUser(userId, postId);
  }
  
  /**
   * Erstellt einen Kommentar für einen Post
   */
  async createComment(userId: string, postId: string, content: string) {
    try {
      const { data: comment, error } = await this.supabase
        .from('comments')
        .insert([{
          author_id: userId,
          user_id: userId, // For backward compatibility
          post_id: postId,
          content
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Increment the comments_count
      await this.supabase.rpc('increment_comments', { post_id: postId });
      
      return comment;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Lädt Kommentare für einen Post
   */
  async getPostComments(postId: string) {
    try {
      // Hier ist der Fehler, die Beziehung muss eindeutig angegeben werden
      // mit !fk_author um den richtigen Foreign Key zu verwenden
      const { data: comments, error } = await this.supabase
        .from('comments')
        .select(`
          *,
          author:users!author_id(id, username, display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return comments || [];
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Löscht einen Kommentar
   */
  async deleteComment(commentId: string, userId: string) {
    try {
      // First, get the comment to find the post_id
      const { data: comment, error: fetchError } = await this.supabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .eq('author_id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete the comment
      const { error } = await this.supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', userId);
      
      if (error) throw error;
      
      // Decrement the comments_count
      if (comment && comment.post_id) {
        await this.supabase.rpc('decrement_comments', { post_id: comment.post_id });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Teilt einen Post - delegiert an InteractionRepository
   */
  async sharePost(postId: string) {
    return await interactionRepository.sharePost(postId);
  }
  
  /**
   * Meldet einen Post - delegiert an InteractionRepository
   */
  async reportPost(userId: string, postId: string, reason: string) {
    return await interactionRepository.reportPost(userId, postId, reason);
  }
  
  /**
   * Extrahiert Hashtags aus dem Inhalt
   */
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
    const matches = content.match(hashtagRegex);
    
    if (!matches) return [];
    
    // Extract just the tag text without the # symbol
    return matches.map(tag => tag.substring(1));
  }
}

export const postRepository = new PostRepository();
