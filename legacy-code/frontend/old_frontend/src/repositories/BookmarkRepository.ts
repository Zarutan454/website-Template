
import { supabase } from '@/lib/supabase';
import { BaseRepository } from './base/Repository';

export interface IBookmarkRepository {
  toggleBookmark(userId: string, postId: string): Promise<{ success: boolean, isBookmarked: boolean }>;
  getBookmarkedStatus(userId: string, postId: string): Promise<boolean>;
  getUserBookmarks(userId: string): Promise<string[]>;
}

interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at?: string;
}

export class BookmarkRepository extends BaseRepository<Bookmark, string> implements IBookmarkRepository {
  async findById(id: string): Promise<Bookmark | null> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding bookmark by id:', error);
      return null;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding all bookmarks:', error);
      return [];
    }
  }

  async create(entity: Partial<any>): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([entity])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<any>): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .update(entity)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  }

  async toggleBookmark(userId: string, postId: string): Promise<{ success: boolean, isBookmarked: boolean }> {
    try {
      // Check if the post is already bookmarked
      const { data: existingBookmarks, error: checkError } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (checkError) throw checkError;

      if (existingBookmarks && existingBookmarks.length > 0) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmarks[0].id);

        if (deleteError) throw deleteError;
        
        return { success: true, isBookmarked: false };
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .upsert([
            {
              user_id: userId,
              post_id: postId
            }
          ], { 
            onConflict: 'user_id,post_id',
            ignoreDuplicates: true
          });

        if (insertError) throw insertError;
        
        return { success: true, isBookmarked: true };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Check if error is a unique constraint violation
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return { success: true, isBookmarked: true };
      }
      
      return { success: false, isBookmarked: false };
    }
  }

  async getBookmarkedStatus(userId: string, postId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {
        console.error('Error checking bookmark status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error getting bookmark status:', error);
      return false;
    }
  }

  async getUserBookmarks(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user bookmarks:', error);
        return [];
      }

      return data.map(item => item.post_id);
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const bookmarkRepository = new BookmarkRepository();
