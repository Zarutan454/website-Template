import { supabase } from '@/lib/supabase';
import { BaseRepository } from './base/Repository';
import { Profile } from '@/hooks/useProfile';

export interface IUserRepository {
  getCurrentUser(): Promise<Profile | null>;
  getUserProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null>;
  followUser(followerId: string, followingId: string): Promise<boolean>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<Partial<Profile>[]>;
  getFollowing(userId: string): Promise<Partial<Profile>[]>;
}

export class UserRepository extends BaseRepository<Profile, string> implements IUserRepository {
  async findById(id: string): Promise<Profile | null> {
    return this.getUserProfile(id);
  }

  async findAll(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
        
      if (error) throw error;
      return data as Profile[];
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }

  async create(entity: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([entity])
        .select()
        .single();
        
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<Profile>): Promise<Profile | null> {
    return this.updateProfile(id, entity);
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Note: This would require admin privileges or special handling
      // Usually users are not deleted but deactivated
      const { error } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<Profile | null> {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!authUser.user) return null;
      
      return this.getUserProfile(authUser.user.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // First check if already following
      const isAlreadyFollowing = await this.isFollowing(followerId, followingId);
      if (isAlreadyFollowing) return true;
      
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
        
      if (error) throw error;
      
      // Update follower count for the followed user
      await supabase.rpc('update_follower_count', { 
        target_user_id: followingId, 
        count_change: 1 
      });
      
      // Update following count for the follower
      await supabase.rpc('update_following_count', { 
        user_id: followerId, 
        count_change: 1 
      });
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
        
      if (error) throw error;
      
      // Update follower count for the unfollowed user
      await supabase.rpc('update_follower_count', { 
        target_user_id: followingId, 
        count_change: -1 
      });
      
      // Update following count for the follower
      await supabase.rpc('update_following_count', { 
        user_id: followerId, 
        count_change: -1 
      });
      
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking if following:', error);
      return false;
    }
  }

  async getFollowers(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          follower:follower_id (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            followers_count
          )
        `)
        .eq('following_id', userId);
        
      if (error) throw error;
      
      return data.map(item => item.follower);
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  async getFollowing(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          following:following_id (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            followers_count
          )
        `)
        .eq('follower_id', userId);
        
      if (error) throw error;
      
      return data.map(item => item.following);
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();
