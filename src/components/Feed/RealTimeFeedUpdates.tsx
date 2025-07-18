import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  Users, 
  MessageCircle, 
  Heart,
  Share2,
  Image,
  Video,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFeedWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

interface Post {
  id: number;
  content: string;
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  media_url?: string;
  media_type?: string;
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface PostUpdate {
  type: 'like' | 'comment' | 'share';
  post_id: number;
  user_id: number;
  username: string;
  comment?: {
    id: number;
    content: string;
    author: {
      username: string;
      display_name: string;
    };
  };
}

interface Story {
  id: number;
  content: string;
  media_url: string;
  story_type: string;
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  created_at: string;
  expires_at: string;
}

interface RealTimeFeedUpdatesProps {
  feedType: string;
  onNewPosts?: (posts: Post[]) => void;
  onPostUpdates?: (updates: PostUpdate[]) => void;
  onStoryUpdates?: (stories: Story[]) => void;
  showConnectionStatus?: boolean;
  showNotifications?: boolean;
  maxUpdates?: number;
  updateTimeout?: number;
}

interface UpdateItem {
  id: string;
  type: 'post' | 'like' | 'comment' | 'story' | 'follow';
  data: Post | PostUpdate | Story;
  timestamp: Date;
  isRead: boolean;
}

const RealTimeFeedUpdates: React.FC<RealTimeFeedUpdatesProps> = ({
  feedType,
  onNewPosts,
  onPostUpdates,
  onStoryUpdates,
  showConnectionStatus = true,
  showNotifications = true,
  maxUpdates = 50,
  updateTimeout = 5000
}) => {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [showUpdatesBadge, setShowUpdatesBadge] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');

  const {
    isConnected,
    newPosts,
    postUpdates,
    storyUpdates,
    lastError,
    clearNewPosts,
    clearPostUpdates,
    clearStoryUpdates,
    forceReconnect
  } = useFeedWebSocket(feedType);

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else if (lastError) {
      setConnectionStatus('error');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, lastError]);

  // Process new posts with optimistic updates
  useEffect(() => {
    if (newPosts.length > 0) {
      const newUpdates = newPosts.map(post => ({
        id: `post-${post.id}-${Date.now()}`,
        type: 'post' as const,
        data: post,
        timestamp: new Date(),
        isRead: false
      }));

      setUpdates(prev => {
        const combined = [...newUpdates, ...prev];
        return combined.slice(0, maxUpdates); // Keep only latest updates
      });

      setShowUpdatesBadge(true);
      setLastUpdateTime(new Date());
      
      if (onNewPosts) {
        onNewPosts(newPosts);
      }
      
      if (showNotifications) {
        newPosts.forEach(post => {
          toast.success(`📝 Neuer Beitrag von ${post.author?.username || 'Unbekannt'}`, {
            description: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
            action: {
              label: 'Anzeigen',
              onClick: () => {
                // TODO: Navigate to post
                console.log('Navigate to post:', post.id);
              }
            }
          });
        });
      }
      
      clearNewPosts();
    }
  }, [newPosts, onNewPosts, showNotifications, clearNewPosts, maxUpdates]);

  // Process post updates (likes, comments, shares)
  useEffect(() => {
    if (postUpdates.length > 0) {
      const newUpdates = postUpdates.map(update => ({
        id: `${update.type}-${update.post_id}-${Date.now()}`,
        type: update.type as 'like' | 'comment',
        data: update,
        timestamp: new Date(),
        isRead: false
      }));

      setUpdates(prev => {
        const combined = [...newUpdates, ...prev];
        return combined.slice(0, maxUpdates);
      });

      setShowUpdatesBadge(true);
      setLastUpdateTime(new Date());
      
      if (onPostUpdates) {
        onPostUpdates(postUpdates);
      }
      
      if (showNotifications) {
        postUpdates.forEach(update => {
          const message = getUpdateMessage(update);
          if (message) {
            toast.info(message, {
              duration: 3000,
              action: {
                label: 'Anzeigen',
                onClick: () => {
                  console.log('Navigate to post:', update.post_id);
                }
              }
            });
          }
        });
      }
      
      clearPostUpdates();
    }
  }, [postUpdates, onPostUpdates, showNotifications, clearPostUpdates, maxUpdates]);

  // Process story updates
  useEffect(() => {
    if (storyUpdates.length > 0) {
      const newUpdates = storyUpdates.map(story => ({
        id: `story-${story.id}-${Date.now()}`,
        type: 'story' as const,
        data: story,
        timestamp: new Date(),
        isRead: false
      }));

      setUpdates(prev => {
        const combined = [...newUpdates, ...prev];
        return combined.slice(0, maxUpdates);
      });

      setShowUpdatesBadge(true);
      setLastUpdateTime(new Date());
      
      if (onStoryUpdates) {
        onStoryUpdates(storyUpdates);
      }
      
      if (showNotifications) {
        storyUpdates.forEach(story => {
          toast.success(`📸 Neue Story von ${story.author?.username || 'Unbekannt'}`, {
            action: {
              label: 'Anzeigen',
              onClick: () => {
                console.log('Navigate to story:', story.id);
              }
            }
          });
        });
      }
      
      clearStoryUpdates();
    }
  }, [storyUpdates, onStoryUpdates, showNotifications, clearStoryUpdates, maxUpdates]);

  // Auto-hide updates after timeout
  useEffect(() => {
    if (showUpdatesBadge && updateTimeout > 0) {
      const timer = setTimeout(() => {
        setShowUpdatesBadge(false);
      }, updateTimeout);

      return () => clearTimeout(timer);
    }
  }, [showUpdatesBadge, updateTimeout]);

  // Get update message for notifications
  const getUpdateMessage = useCallback((update: PostUpdate): string | null => {
    switch (update.type) {
      case 'like':
        return `❤️ ${update.username} hat einen Post geliked`;
      case 'comment':
        return `💬 ${update.comment?.author?.username || 'Unbekannt'} hat kommentiert`;
      case 'share':
        return `📤 ${update.username} hat einen Post geteilt`;
      default:
        return null;
    }
  }, []);

  // Mark updates as read
  const markUpdatesAsRead = useCallback(() => {
    setUpdates(prev => prev.map(update => ({ ...update, isRead: true })));
    setShowUpdatesBadge(false);
  }, []);

  // Clear all updates
  const clearAllUpdates = useCallback(() => {
    setUpdates([]);
    setShowUpdatesBadge(false);
  }, []);

  // Connection status component
  const ConnectionStatus = useMemo(() => {
    if (!showConnectionStatus) return null;

    const statusConfig = {
      connected: {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        text: 'Live',
        className: 'text-green-600 bg-green-50 border-green-200'
      },
      connecting: {
        icon: <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />,
        text: 'Verbinde...',
        className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      },
      disconnected: {
        icon: <WifiOff className="h-4 w-4 text-gray-500" />,
        text: 'Offline',
        className: 'text-gray-600 bg-gray-50 border-gray-200'
      },
      error: {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        text: 'Fehler',
        className: 'text-red-600 bg-red-50 border-red-200'
      }
    };

    const config = statusConfig[connectionStatus];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium',
          config.className
        )}
      >
        {config.icon}
        <span>{config.text}</span>
        {connectionStatus === 'error' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={forceReconnect}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  }, [connectionStatus, showConnectionStatus, forceReconnect]);

  // Updates badge
  const UpdatesBadge = useMemo(() => {
    if (!showUpdatesBadge || updates.length === 0) return null;

    const unreadCount = updates.filter(u => !u.isRead).length;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative"
        >
          <Badge 
            variant="destructive" 
            className="cursor-pointer hover:bg-red-600 transition-colors"
            onClick={markUpdatesAsRead}
          >
            <Bell className="h-3 w-3 mr-1" />
            {unreadCount} neue Updates
          </Badge>
        </motion.div>
      </AnimatePresence>
    );
  }, [showUpdatesBadge, updates, markUpdatesAsRead]);

  // Update statistics
  const updateStats = useMemo(() => {
    const stats = {
      posts: updates.filter(u => u.type === 'post').length,
      likes: updates.filter(u => u.type === 'like').length,
      comments: updates.filter(u => u.type === 'comment').length,
      stories: updates.filter(u => u.type === 'story').length,
      follows: updates.filter(u => u.type === 'follow').length
    };

    return stats;
  }, [updates]);

  return (
    <div className="flex items-center gap-4">
      {ConnectionStatus}
      
      {UpdatesBadge}
      
      {/* Update Statistics */}
      {updates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-gray-500"
        >
          {updateStats.posts > 0 && (
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              {updateStats.posts}
            </div>
          )}
          {updateStats.likes > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {updateStats.likes}
            </div>
          )}
          {updateStats.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {updateStats.comments}
            </div>
          )}
          {updateStats.stories > 0 && (
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              {updateStats.stories}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Clear Updates Button */}
      {updates.length > 0 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={clearAllUpdates}
          className="text-gray-500 hover:text-gray-700"
        >
          Löschen
        </Button>
      )}
      
      {/* Last Update Time */}
      {lastUpdateTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-400"
        >
          Letztes Update: {lastUpdateTime.toLocaleTimeString()}
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeFeedUpdates; 