import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useProfile } from '@/hooks/useProfile';
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

import UnifiedPostCard, { UnifiedPostCardProps } from './UnifiedPostCard';
import FeedEmpty from './FeedEmpty';
import FeedError from './FeedError';
import FeedLoading from './FeedLoading';

interface EnhancedFeedProps {
  posts: any[];
  isLoading: boolean;
  error: Error | null;
  showFilters?: boolean;
  showTabs?: boolean;
  showMiningRewards?: boolean;
  initialFilterType?: FilterType;
  initialSortType?: SortType;
  onLike: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onShare: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  onGetComments: (postId: string) => Promise<any[]>;
  onDeleteComment?: (commentId: string) => Promise<boolean>;
  onRetry: () => void;
  onCreatePost?: () => void;
}

const EnhancedFeed: React.FC<EnhancedFeedProps> = ({
  posts,
  isLoading,
  error,
  showFilters = true,
  showTabs = true,
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
  onCreatePost
}) => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const isDarkMode = theme === 'dark';
  const [activeTab, setActiveTab] = useState<FilterType>(initialFilterType);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    filterType, 
    setFilterType, 
    sortType, 
    setSortType, 
    filteredPosts
  } = useFeedFilter({
    posts, 
    currentUserId: profile?.id || '',
    initialFilter: initialFilterType,
    initialSort: initialSortType
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as FilterType);
    setFilterType(value as FilterType);
  };
  
  const handleSortChange = (value: string) => {
    setSortType(value as SortType);
    toast.info(`Sortierung geändert: ${getSortLabel(value as SortType)}`);
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRetry();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("Feed wurde aktualisiert");
  };
  
  const handleCreatePost = () => {
    if (onCreatePost) {
      onCreatePost();
    }
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
    return <FeedError message={error.message} onRetry={onRetry} />;
  }
  
  if (!posts || posts.length === 0) {
    return (
      <FeedEmpty
        darkMode={isDarkMode}
        onCreatePost={handleCreatePost}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {showFilters && (
        <Card className={`${isDarkMode ? 'bg-dark-100 border-gray-800' : 'bg-white border-gray-200'}`}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Feed</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Aktualisieren
              </Button>
            </div>
            <CardDescription>
              {filteredPosts.length} Beiträge gefunden
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pb-4">
            <div className="flex justify-between items-center">
              {showTabs && (
                <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-6">
                    <TabsTrigger value="all" className="text-xs">Alle</TabsTrigger>
                    <TabsTrigger value="latest" className="text-xs">Neueste</TabsTrigger>
                    <TabsTrigger value="popular" className="text-xs">Beliebt</TabsTrigger>
                    <TabsTrigger value="following" className="text-xs">Folge ich</TabsTrigger>
                    <TabsTrigger value="tokens" className="text-xs">Tokens</TabsTrigger>
                    <TabsTrigger value="nfts" className="text-xs">NFTs</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <div className="flex items-center mt-4">
                <Filter className="h-4 w-4 mr-2" />
                <Select value={sortType} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sortieren" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Neueste</SelectItem>
                    <SelectItem value="popular">Beliebt</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        {filteredPosts.map((post: any) => (
          <UnifiedPostCard 
            key={post.id}
            post={post}
            darkMode={isDarkMode}
            currentUserId={profile?.id}
            onLike={() => onLike(post.id)}
            onDelete={onDelete ? () => onDelete(post.id) : undefined}
            onComment={(content) => onComment(post.id, content)}
            onShare={() => onShare(post.id)}
            onReport={onReport ? (reason) => onReport(post.id, reason) : undefined}
            onGetComments={() => onGetComments(post.id)}
            onDeleteComment={onDeleteComment}
            currentUser={profile}
          />
        ))}
      </div>
    </div>
  );
};

export default EnhancedFeed;
