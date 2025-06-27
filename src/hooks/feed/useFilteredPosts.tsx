
import { useState, useEffect, useMemo } from 'react';
import { adaptPostForCardSync, isTokenRelatedPost, isNFTRelatedPost } from '@/utils/postAdapter';
import { Post } from '@/types/posts';

interface UseFilteredPostsProps {
  posts: any[];
  currentUserId: string;
  filterType?: string;
  sortType?: string;
}

/**
 * Hook zum Filtern und Sortieren von Posts mit Performanceoptimierung
 */
export const useFilteredPosts = ({
  posts,
  currentUserId,
  filterType = 'latest',
  sortType = 'newest'
}: UseFilteredPostsProps) => {
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  
  // Listen-Speicherung im Memo für Performance
  const adaptedPosts = useMemo(() => {
    if (!posts || posts.length === 0 || !currentUserId) return [];
    return posts.map(post => adaptPostForCardSync(post, currentUserId));
  }, [posts, currentUserId]);
  
  // Filterung und Sortierung anwenden
  useEffect(() => {
    if (!adaptedPosts || adaptedPosts.length === 0) {
      setFilteredPosts([]);
      return;
    }
    
    let filtered = [...adaptedPosts];
    
    // Filter anwenden
    if (filterType === 'tokens') {
      filtered = filtered.filter((post) => isTokenRelatedPost(post));
    } else if (filterType === 'nfts') {
      filtered = filtered.filter((post) => isNFTRelatedPost(post));
    }
    
    // Sortierung anwenden
    if (sortType === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortType === 'popular') {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (sortType === 'trending') {
      filtered.sort((a, b) => {
        const scoreA = (b.likes_count || 0) * 2 + (b.comments_count || 0) * 3 + (b.shares_count || 0) * 5;
        const scoreB = (a.likes_count || 0) * 2 + (a.comments_count || 0) * 3 + (a.shares_count || 0) * 5;
        return scoreA - scoreB;
      });
    }
    
    setFilteredPosts(filtered);
  }, [adaptedPosts, filterType, sortType]);
  
  return { filteredPosts };
};
