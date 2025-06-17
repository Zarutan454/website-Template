
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Hook zum Teilen von Posts
 */
export const useSharing = (postId: string, onShare?: () => void) => {
  const [sharesCount, setSharesCount] = useState(0);

  /**
   * Post teilen und Shares-Zähler erhöhen
   */
  const handleShare = async () => {
    try {
      // Increment shares count through RPC function
      const { error } = await supabase.rpc('increment_shares', {
        post_id: postId
      });

      if (error) throw error;
      
      setSharesCount(prev => prev + 1);
      toast.success('Beitrag geteilt');
      onShare?.();
      return true;
    } catch (error) {
      toast.error('Fehler beim Teilen des Beitrags');
      return false;
    }
  };

  /**
   * Postlink in die Zwischenablage kopieren
   */
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(`https://blockchain-social.network/post/${postId}`);
      toast.success('Link in die Zwischenablage kopiert');
      return true;
    } catch (error) {
      toast.error('Fehler beim Kopieren des Links');
      return false;
    }
  };

  /**
   * Shares-Anzahl abrufen
   */
  const fetchSharesCount = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('shares_count')
        .eq('id', postId)
        .single();
        
      if (error) throw error;
      
      setSharesCount(data?.shares_count || 0);
      return data?.shares_count || 0;
    } catch (error) {
      return 0;
    }
  };

  return {
    sharesCount,
    setSharesCount,
    handleShare,
    handleCopyLink,
    fetchSharesCount
  };
};
