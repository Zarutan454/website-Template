import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { FilterType, SortType, useFeedFilter } from '@/hooks/feed/useFeedFilter';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Filter } from 'lucide-react';

import UnifiedPostCard from './UnifiedPostCard';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import FeedLoading from './FeedLoading';
import { Post, Comment, type UserProfile } from '@/lib/django-api-new';

interface EnhancedFeedProps {
  posts: Post[];
  isLoading: boolean;
  error: Error | string | null;
  hasMore: boolean;
  loadMore: () => void;
  showMiningRewards?: boolean;
  initialFilterType?: FilterType;
  initialSortType?: SortType;
  onLike?: (postId: string) => Promise<boolean>;
  onComment?: (postId: string, content: string) => Promise<Comment | null>;
  onShare?: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onGetComments?: (postId: string) => Promise<Comment[]>;
  onDeleteComment?: (commentId: string) => Promise<boolean>;
  onRetry: () => void;
}

const EnhancedFeed: React.FC<EnhancedFeedProps> = ({
  posts,
  isLoading,
  error,
  hasMore,
  loadMore,
  showMiningRewards = true,
  initialFilterType = 'all',
  initialSortType = 'newest',
  onLike,
  onComment,
  onShare,
  onDelete,
  onReport,
  onGetComments,
  onDeleteComment,
  onRetry,
}) => {
  const { theme } = useTheme();
  const { user: profile } = useAuth();
  const isDarkMode = theme === 'dark';
  const [activeTab, setActiveTab] = useState<FilterType>(initialFilterType);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortType, setSortType] = useState<SortType>('newest');

  const filteredPosts = Array.isArray(posts) ? posts : []; 
  
  console.log('🔍 EnhancedFeed Debug:', {
    postsLength: posts?.length,
    postsType: typeof posts,
    isArray: Array.isArray(posts),
    hasMore,
    isLoading
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRetry();
    setIsRefreshing(false);
    toast.success("Feed wurde aktualisiert");
  };
  
  const getSortLabel = (sort: SortType): string => {
    switch (sort) {
      case 'newest': return 'Neueste';
      case 'popular': return 'Beliebt';
      case 'trending': return 'Trending';
      default: return 'Sortieren';
    }
  };
  
  const getTabLabel = (filter: FilterType): string => {
    switch (filter) {
      case 'all': return 'Alle';
      case 'latest': return 'Neueste';
      case 'popular': return 'Beliebt';
      case 'following': return 'Folge ich';
      case 'tokens': return 'Tokens';
      case 'nfts': return 'NFTs';
      default: return '';
    }
  };
  
  if (isLoading && posts.length === 0) {
    return <FeedLoading />;
  }
  
  if (error) {
    return <FeedError message={typeof error === 'string' ? error : error.message} onRetry={onRetry} />;
  }
  
  if (!posts || posts.length === 0) {
    return (
      <FeedEmpty
        darkMode={isDarkMode}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      
      <InfiniteScroll
        dataLength={filteredPosts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<FeedLoading />}
        endMessage={
          <p style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>
            <b>Yay! Du hast alles gesehen.</b>
          </p>
        }
        scrollThreshold="200px"
      >
        <div className="space-y-4">
          {filteredPosts.map((post: Post) => (
            <UnifiedPostCard
              key={post.id}
              post={post}
              darkMode={isDarkMode}
              currentUserId={profile?.id}
              currentUser={profile as UserProfile | null}
              onLike={onLike}
              onDelete={onDelete}
              onComment={onComment}
              onShare={onShare}
              onReport={onReport}
              onGetComments={onGetComments}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default EnhancedFeed;
