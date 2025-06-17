
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartIcon, MessageSquare, Repeat2, Award, UserPlus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ActivityType = 'post' | 'like' | 'comment' | 'follow' | 'mining';

type ActivityItem = {
  id: string;
  type: ActivityType;
  created_at: string;
  target_id?: string;
  target_type?: string;
  content?: string;
  actor?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  metadata?: {
    points?: number;
    image?: string;
  };
};

// Improved ActivityIcon with animations
const ActivityIcon = React.memo(({ type }: { type: ActivityType }) => {
  const icons = {
    post: { icon: MessageSquare, color: 'text-blue-400' },
    like: { icon: HeartIcon, color: 'text-rose-400' },
    comment: { icon: MessageSquare, color: 'text-emerald-400' },
    follow: { icon: UserPlus, color: 'text-violet-400' },
    mining: { icon: Zap, color: 'text-amber-400' }
  };

  const { icon: Icon, color } = icons[type] || icons.post;

  return (
    <motion.div 
      className={cn('p-2 rounded-full bg-background', color)}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Icon className="h-5 w-5" />
    </motion.div>
  );
});
ActivityIcon.displayName = 'ActivityIcon';

// Enhanced ActivityListItem with interactions
const ActivityListItem = React.memo(({ activity, profile }: { activity: ActivityItem; profile?: any }) => {
  const getActivityContent = () => {
    switch (activity.type) {
      case 'post':
        return { text: 'hat einen Beitrag erstellt', href: `/posts/${activity.target_id}` };
      case 'like':
        return { text: 'hat einen Beitrag geliked', href: `/posts/${activity.target_id}` };
      case 'comment':
        return { text: 'hat kommentiert', href: `/posts/${activity.target_id}#comment-${activity.id}` };
      case 'follow':
        return { text: `folgt jetzt ${activity.actor?.display_name || activity.actor?.username}`, href: `/profile/${activity.actor?.username}` };
      case 'mining':
        return { text: 'hat Mining-Punkte gesammelt', href: `/profile/${profile?.username}/mining` };
      default:
        return { text: 'hat eine Aktion durchgeführt', href: '#' };
    }
  };

  const { text, href } = getActivityContent();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative bg-background hover:bg-muted/50 transition-colors cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => window.open(href, '_blank')}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {activity.type === 'follow' ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.actor?.avatar_url} />
                    <AvatarFallback>{activity.actor?.username?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <ActivityIcon type={activity.type} />
              )}
            </div>
            
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium">{profile?.username}</span>
                <span className="text-muted-foreground text-sm">{text}</span>
                {activity.metadata?.points && (
                  <Badge variant="outline" className="ml-auto">
                    +{activity.metadata.points} XP
                  </Badge>
                )}
              </div>

              {activity.content && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {activity.content}
                </p>
              )}

              {activity.metadata?.image && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img 
                    src={activity.metadata.image} 
                    alt="Post preview" 
                    className="h-24 w-full object-cover"
                  />
                </div>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <time className="text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors">
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true,
                        locale: de 
                      })}
                    </time>
                  </TooltipTrigger>
                  <TooltipContent>
                    {new Date(activity.created_at).toLocaleString('de-DE', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
ActivityListItem.displayName = 'ActivityListItem';

// Enhanced Empty State
const EmptyState = React.memo(({ activeTab }: { activeTab: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-8 text-center space-y-4"
  >
    <div className="bg-muted rounded-full p-4">
      <Award className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="font-medium">Keine Aktivitäten gefunden</h3>
      <p className="text-sm text-muted-foreground">
        {activeTab === 'mining' 
          ? "Beginne mit dem Mining, um Punkte zu sammeln!"
          : "Interagiere mit anderen Nutzern, um Aktivitäten zu generieren"}
      </p>
    </div>
    <Button variant="secondary" size="sm">
      {activeTab === 'mining' ? 'Mining starten' : 'Community entdecken'}
    </Button>
  </motion.div>
));
EmptyState.displayName = 'EmptyState';

// Improved Loading Skeleton
const LoadingSkeleton = React.memo(() => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <Card className="bg-background">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[160px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

interface ActivityFeedProps {
  userId: string;
  limit?: number;
}

// Main Component
const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId, limit = 10 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'social' | 'mining'>('all');
  const { profile } = useProfile();

  // Fetch activities from database
  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [postsResponse, likesResponse, commentsResponse, followsResponse, miningResponse] = await Promise.all([
        supabase
          .from('posts')
          .select('id, created_at, content')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
          
        supabase
          .from('likes')
          .select(`
            id, created_at, post_id,
            post:posts(content)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
          
        supabase
          .from('comments')
          .select(`
            id, created_at, content, post_id
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
          
        supabase
          .from('follows')
          .select(`
            created_at, following_id,
            following:following_id(username, display_name, avatar_url)
          `)
          .eq('follower_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
          
        supabase
          .from('mining_stats')
          .select('*')
          .eq('user_id', userId)
          .single()
      ]);
      
      // Process activities with proper type safety
      const postsActivity = postsResponse.data?.map(post => ({
        id: `post-${post.id}`,
        type: 'post' as ActivityType,
        created_at: post.created_at,
        content: post.content,
        target_id: post.id,
        target_type: 'post',
        metadata: {
          // Add sample image for demo purposes
          image: post.id % 3 === 0 ? `https://source.unsplash.com/random/800x600?sig=${post.id}` : undefined
        }
      })) || [];
      
      const likesActivity = likesResponse.data?.map(like => {
        const postData = like.post || {};
        const postContent = typeof postData === 'object' && postData !== null 
          ? (postData as Record<string, unknown>).content as string || 'Ein Beitrag'
          : 'Ein Beitrag';
        
        return {
          id: `like-${like.id}`,
          type: 'like' as ActivityType,
          created_at: like.created_at,
          content: postContent,
          target_id: like.post_id,
          target_type: 'post'
        };
      }) || [];
      
      const commentsActivity = commentsResponse.data?.map(comment => ({
        id: `comment-${comment.id}`,
        type: 'comment' as ActivityType,
        created_at: comment.created_at,
        content: comment.content,
        target_id: comment.post_id,
        target_type: 'post'
      })) || [];
      
      const followsActivity = followsResponse.data?.map(follow => {
        const following = follow.following || {};
        
        if (typeof following === 'object' && following !== null) {
          return {
            id: `follow-${follow.created_at}-${follow.following_id}`,
            type: 'follow' as ActivityType,
            created_at: follow.created_at,
            target_id: follow.following_id,
            target_type: 'user',
            actor: {
              username: 'username' in following ? String(following.username) : 'Unbekannter Benutzer',
              display_name: 'display_name' in following ? String(following.display_name) : undefined,
              avatar_url: 'avatar_url' in following ? String(following.avatar_url) : undefined
            }
          };
        }
        
        return {
          id: `follow-${follow.created_at}-${follow.following_id}`,
          type: 'follow' as ActivityType,
          created_at: follow.created_at,
          target_id: follow.following_id,
          target_type: 'user',
          actor: {
            username: 'Unbekannter Benutzer',
            display_name: undefined,
            avatar_url: undefined
          }
        };
      }) || [];
      
      const miningActivity = miningResponse.data ? [{
        id: `mining-${miningResponse.data.user_id}`,
        type: 'mining' as ActivityType,
        created_at: miningResponse.data.last_activity_at || miningResponse.data.updated_at,
        content: `${miningResponse.data.daily_points} Mining-Punkte gesammelt`,
        metadata: {
          points: miningResponse.data.daily_points
        }
      }] : [];
      
      const allActivities = [
        ...postsActivity,
        ...likesActivity,
        ...commentsActivity,
        ...followsActivity,
        ...miningActivity
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, limit);
      
      setActivities(allActivities);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    if (userId) {
      fetchActivity();
    }
  }, [userId, fetchActivity]);

  // Memoize filtered activities to prevent recalculation on each render
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (activeTab === 'all') return true;
      if (activeTab === 'posts') return activity.type === 'post';
      if (activeTab === 'social') return ['like', 'comment', 'follow'].includes(activity.type);
      if (activeTab === 'mining') return activity.type === 'mining';
      return true;
    });
  }, [activities, activeTab]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 h-12">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'posts', label: 'Beiträge' },
            { value: 'social', label: 'Sozial' },
            { value: 'mining', label: 'Mining' }
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative data-[state=active]:bg-background"
            >
              {tab.label}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: activeTab === tab.value ? 1 : 0 }}
              />
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="pt-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredActivities.length === 0 ? (
              <EmptyState activeTab={activeTab} />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredActivities.map(activity => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    profile={profile}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default React.memo(ActivityFeed);
