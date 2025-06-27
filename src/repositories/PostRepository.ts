import { socialAPI, type Post, type CreatePostData, type UpdatePostData } from '@/lib/django-api-new';

/**
 * Post Repository - Migriert von Supabase zu Django API
 * 
 * ALT (Supabase):
 * const { data, error } = await supabase
 *   .from('posts')
 *   .select('*, profiles(*)')
 *   .order('created_at', { ascending: false });
 * 
 * NEU (Django):
 * const response = await socialAPI.getPosts();
 */
export class PostRepository {
  
  /**
   * Get all posts with pagination
   */
  async getPosts(page: number = 1, limit: number = 20): Promise<Post[]> {
    return await socialAPI.getPosts(page, limit);
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(): Promise<Post[]> {
    return await socialAPI.getTrendingPosts();
  }

  /**
   * Search posts
   */
  async searchPosts(query: string): Promise<Post[]> {
    const response = await socialAPI.searchPosts(query);
    return response.results || [];
  }

  /**
   * Create new post
   */
  async createPost(postData: CreatePostData): Promise<Post | null> {
    const response = await socialAPI.createPost(postData);
    if (response.error || !response.data) return null;
    return response.data;
  }

  /**
   * Like/Unlike post
   */
  async toggleLike(postId: number): Promise<boolean> {
    const response = await socialAPI.likePost(postId);
    return !response.error;
  }

  /**
   * Get feed posts based on feed type
   */
  async getFeedPosts(feedType: string, userId: string): Promise<Post[]> {
    return await socialAPI.getPosts(1, 50);
  }
}

// Export a singleton instance
export const postRepository = new PostRepository();
