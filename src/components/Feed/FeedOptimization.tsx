import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';

interface Post {
  id: number;
  content: string;
  media_url?: string;
  media_type?: string;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  is_liked_by_user: boolean;
  is_bookmarked_by_user: boolean;
}

interface FeedOptimizationProps {
  children: (posts: Post[], isLoading: boolean, hasNextPage: boolean) => React.ReactNode;
  filter?: 'all' | 'following' | 'trending';
  groupId?: number;
}

const FeedOptimization: React.FC<FeedOptimizationProps> = ({
  children,
  filter = 'all',
  groupId
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Fetch posts with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts', filter, groupId],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        page_size: '20',
      });

      if (filter === 'following') {
        params.append('following', 'true');
      } else if (filter === 'trending') {
        params.append('trending', 'true');
      }

      if (groupId) {
        params.append('group', groupId.toString());
      }

      const response = await apiClient.get(`/posts/?${params.toString()}`);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.searchParams.get('page');
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Auto-load more when scroll reaches bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Feed aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap(page => page.results || []) || [];

  // Error handling
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-muted-foreground">
          Fehler beim Laden der Posts: {error?.message}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-center">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Aktualisiere...' : 'Aktualisieren'}
        </Button>
      </div>

      {/* Posts */}
      {children(allPosts, isLoading, !!hasNextPage)}

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Lade weitere Posts...</span>
          </div>
        </div>
      )}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="h-4" />
      )}

      {/* End of feed */}
      {!hasNextPage && allPosts.length > 0 && (
        <div className="text-center p-4 text-muted-foreground">
          <p className="text-sm">Du hast alle Posts gesehen! 🎉</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allPosts.length === 0 && (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            {filter === 'following' 
              ? 'Folge anderen Nutzern, um ihre Posts zu sehen'
              : 'Noch keine Posts vorhanden'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedOptimization; 