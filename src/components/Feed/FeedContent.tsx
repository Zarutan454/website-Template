import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { Post, CreatePostData } from '@/types/posts';
import UnifiedFeedContainer from './UnifiedFeedContainer';
// Fix import casing issue by using a relative path
import CreatePostBoxLight from './CreatePostBoxLight';
import { FeedType } from '@/hooks/feed/useFeedData';
import { AnimatePresence } from 'framer-motion';

interface FeedContentProps {
  activeTab: FeedType;
  handleTabChange: (tab: FeedType) => void;
  handleOpenCreateModal: (initialData?: Partial<CreatePostData>) => void;
  feedType: FeedType;
}

const FeedContent: React.FC<FeedContentProps> = ({
  activeTab,
  handleTabChange,
  handleOpenCreateModal,
  feedType
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const { user: profile } = useAuth();
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-8">
      <div className="animate-in grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Mittlere Spalte - Hauptfeed */}
        <div className="animate-in">
          <CreatePostBoxLight 
            darkMode={isDarkMode} 
            onCreatePost={handleOpenCreateModal} 
          />
          
          <Tabs defaultValue={activeTab} onValueChange={(value) => handleTabChange(value as FeedType)}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="recent" className="data-[state=active]:bg-primary/20">
                Neueste
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-primary/20">
                Beliebt
              </TabsTrigger>
              <TabsTrigger value="following" className="data-[state=active]:bg-primary/20">
                Folge ich
              </TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-primary/20">
                Tokens
              </TabsTrigger>
              <TabsTrigger value="nfts" className="data-[state=active]:bg-primary/20">
                NFTs
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="recent" className="mt-0">
                <UnifiedFeedContainer 
                  feedType="recent"
                  showFilters={true}
                  showMiningRewards={true}
                />
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0">
                <UnifiedFeedContainer 
                  feedType="popular"
                  showFilters={true}
                  showMiningRewards={true}
                />
              </TabsContent>
              
              <TabsContent value="following" className="mt-0">
                <UnifiedFeedContainer 
                  feedType="following"
                  showFilters={true}
                  showMiningRewards={true}
                />
              </TabsContent>
              
              <TabsContent value="tokens" className="mt-0">
                <UnifiedFeedContainer 
                  feedType="tokens"
                  showFilters={true}
                  showMiningRewards={true}
                />
              </TabsContent>
              
              <TabsContent value="nfts" className="mt-0">
                <UnifiedFeedContainer 
                  feedType="nfts"
                  showFilters={true}
                  showMiningRewards={true}
                />
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FeedContent;
