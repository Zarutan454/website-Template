
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Hashtag {
  id: string;
  name: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export const useHashtags = () => {
  const getTrendingHashtags = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hashtags')
          .select('*')
          .order('post_count', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Error fetching trending hashtags:', error);
          throw error;
        }
        
        return data as Hashtag[];
      } catch (err) {
        console.error('Error in getTrendingHashtags:', err);
        toast.error('Fehler beim Laden der Trending-Hashtags');
        return [] as Hashtag[];
      }
    },
  });

  const searchHashtags = async (searchTerm: string): Promise<Hashtag[]> => {
    try {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .ilike('name', `${searchTerm}%`)
        .order('post_count', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error searching hashtags:', error);
        throw error;
      }
      
      return data as Hashtag[];
    } catch (err) {
      console.error('Error in searchHashtags:', err);
      return [];
    }
  };

  const updateHashtagCounts = async (hashtags: string[]): Promise<void> => {
    if (!hashtags || hashtags.length === 0) return;
    
    try {
      // For each hashtag in the array
      for (const tag of hashtags) {
        // Check if hashtag already exists
        const { data: existingTag, error: searchError } = await supabase
          .from('hashtags')
          .select('id, post_count')
          .eq('name', tag.toLowerCase())
          .maybeSingle();
          
        if (searchError) {
          console.error(`Error checking if hashtag #${tag} exists:`, searchError);
          continue;
        }
        
        if (existingTag) {
          // Update existing hashtag count
          const { error: updateError } = await supabase
            .from('hashtags')
            .update({ 
              post_count: (existingTag.post_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTag.id);
            
          if (updateError) {
            console.error(`Error updating hashtag #${tag} count:`, updateError);
          }
        } else {
          // Create new hashtag
          const { error: insertError } = await supabase
            .from('hashtags')
            .insert([
              { 
                name: tag.toLowerCase(), 
                post_count: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
            
          if (insertError) {
            console.error(`Error creating new hashtag #${tag}:`, insertError);
          }
        }
      }
    } catch (err) {
      console.error('Error in updateHashtagCounts:', err);
    }
  };

  return {
    trendingHashtags: getTrendingHashtags.data || [],
    isLoading: getTrendingHashtags.isLoading,
    error: getTrendingHashtags.error,
    searchHashtags,
    updateHashtagCounts
  };
};
