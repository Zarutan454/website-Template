
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import UnifiedPostList from '@/components/Feed/unified/UnifiedPostList';
import { supabase } from '@/lib/supabase';
import { FeedType } from '@/hooks/feed/useFeedData';

interface LikedContentProps {
  userId: string;
  isOwnProfile: boolean;
}

const LikedContent: React.FC<LikedContentProps> = ({ userId, isOwnProfile }) => {
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLikeCount = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { count, error } = await supabase
          .from('likes')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        
        if (error) throw error;
        
        setLikeCount(count || 0);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLikeCount();
  }, [userId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (likeCount === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          {isOwnProfile 
            ? 'Du hast noch keine Inhalte geliked.' 
            : 'Dieser Benutzer hat noch keine Inhalte geliked.'}
        </p>
      </Card>
    );
  }
  
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="posts" className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>Beiträge</span>
        </TabsTrigger>
        <TabsTrigger value="media" className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <span>Medien</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts">
        <UnifiedPostList 
          feedType={"recent" as FeedType}
          showFilters={false}
          showHeader={false}
          showMiningRewards={false}
          enableAutoRefresh={false}
        />
      </TabsContent>
      
      <TabsContent value="media">
        <Card className="p-6 text-center">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Gelikte Medien werden bald verfügbar sein
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default LikedContent;
