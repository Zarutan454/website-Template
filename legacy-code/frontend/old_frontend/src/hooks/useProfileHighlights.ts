import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ProfileHighlight {
  id: string;
  title: string;
  coverUrl: string;
  user_id?: string;
  created_at?: string;
}

export const useProfileHighlights = (userId: string | undefined) => {
  const [highlights, setHighlights] = useState<ProfileHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighlights = async () => {
    if (!userId) {
      setHighlights([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profile_highlights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setHighlights(data || []);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching profile highlights:', err);
      setError(errorMessage || 'Failed to load highlights');
    } finally {
      setIsLoading(false);
    }
  };

  const createHighlight = async (title: string, coverUrl: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profile_highlights')
        .insert({
          user_id: userId,
          title,
          coverUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setHighlights(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating highlight:', err);
      return null;
    }
  };

  const deleteHighlight = async (highlightId: string) => {
    try {
      const { error } = await supabase
        .from('profile_highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', userId);

      if (error) throw error;

      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      return true;
    } catch (err) {
      console.error('Error deleting highlight:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [userId]);

  return {
    highlights,
    isLoading,
    error,
    createHighlight,
    deleteHighlight,
    refreshHighlights: fetchHighlights
  };
};
