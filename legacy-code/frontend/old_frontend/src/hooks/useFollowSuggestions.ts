
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { RelationshipUser } from './useUserRelationships';

export const useFollowSuggestions = (limit: number = 5) => {
  const [suggestions, setSuggestions] = useState<RelationshipUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();

  const fetchSuggestions = useCallback(async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      // Get users the current user isn't following yet
      // This is a simplified implementation - a more sophisticated algorithm 
      // would consider mutual connections, interests, etc.
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio')
        .neq('id', profile.id)
        .not('id', 'in', (subquery) => {
          return subquery
            .from('user_relationships')
            .select('related_user_id')
            .eq('user_id', profile.id)
            .eq('relationship_type', 'following');
        })
        .not('id', 'in', (subquery) => {
          return subquery
            .from('user_relationships')
            .select('related_user_id')
            .eq('user_id', profile.id)
            .eq('relationship_type', 'blocked');
        })
        .order('followers_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching follow suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile, limit]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    refreshSuggestions: fetchSuggestions
  };
};
