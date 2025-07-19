import { useState, useEffect, useCallback } from 'react';
import { useDjangoWebSocket } from './useDjangoWebSocket';
import { useAuth } from '@/context/AuthContext.utils';
import { toast } from 'sonner';

export interface LivePost {
  id: string;
  content: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  is_liked: boolean;
  is_shared: boolean;
}

export interface LiveFeedEvent {
  type: 'new_post' | 'post_update' | 'post_delete' | 'like' | 'unlike' | 'comment' | 'share';
  post_id: string;
  user_id: string;
  username: string;
  data: any;
  timestamp: string;
}

export interface UseDjangoLiveFeedProps {
  feedType?: 'trending' | 'latest' | 'following';
  autoSubscribe?: boolean;
  enableNotifications?: boolean;
}

/**
 * Django-basierter Live Feed Hook - Migriert von Supabase Real-time
 * 
 * ALT (Supabase):
 * const channel = supabase.channel('feed').on('postgres_changes', callback);
 * 
 * NEU (Django):
 * const { posts, subscribeToFeed, handleLike } = useDjangoLiveFeed();
 */
export const useDjangoLiveFeed = ({ 
  feedType = 'latest', 
  autoSubscribe = true,
  enableNotifications = true 
}: UseDjangoLiveFeedProps) => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<LivePost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const {
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage: wsSendMessage,
    subscribe
  } = useDjangoWebSocket({ autoConnect: true });

  // Subscribe to feed events
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribePost = subscribe('post_update', (event) => {
      const feedEvent = event.data as LiveFeedEvent;
      
      switch (feedEvent.type) {
        case 'new_post':
          handleNewPost(feedEvent);
          break;
        case 'post_update':
          handlePostUpdate(feedEvent);
          break;
        case 'post_delete':
          handlePostDelete(feedEvent);
          break;
        case 'like':
        case 'unlike':
          handleLikeUpdate(feedEvent);
          break;
        case 'comment':
          handleCommentUpdate(feedEvent);
          break;
        case 'share':
          handleShareUpdate(feedEvent);
          break;
      }

      setLastUpdate(new Date().toISOString());
    });

    const unsubscribeNotification = subscribe('notification', (event) => {
      const notification = event.data;
      if (notification.type === 'post_activity' && enableNotifications) {
        // Show toast for post activities
        const message = getNotificationMessage(notification);
        if (message) {
          toast.info(message);
        }
      }
    });

    return () => {
      unsubscribePost();
      unsubscribeNotification();
    };
  }, [isAuthenticated, enableNotifications, subscribe]);

  // Handle new post
  const handleNewPost = useCallback((event: LiveFeedEvent) => {
    const newPost = event.data as LivePost;
    
    setPosts(prev => {
      // Check if post already exists
      const exists = prev.some(p => p.id === newPost.id);
      if (exists) return prev;
      
      // Add to beginning of feed
      return [newPost, ...prev];
    });

    if (enableNotifications && event.user_id !== user?.id) {
      toast.info(`Neuer Post von ${event.username}`);
    }
  }, [user, enableNotifications]);

  // Handle post update
  const handlePostUpdate = useCallback((event: LiveFeedEvent) => {
    const updatedPost = event.data as LivePost;
    
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  }, []);

  // Handle post delete
  const handlePostDelete = useCallback((event: LiveFeedEvent) => {
    setPosts(prev => 
      prev.filter(post => post.id !== event.post_id)
    );

    if (enableNotifications) {
      toast.info('Ein Post wurde gelöscht');
    }
  }, [enableNotifications]);

  // Handle like/unlike update
  const handleLikeUpdate = useCallback((event: LiveFeedEvent) => {
    const { likes_count, is_liked } = event.data;
    
    setPosts(prev => 
      prev.map(post => 
        post.id === event.post_id 
          ? { ...post, likes_count, is_liked }
          : post
      )
    );

    if (enableNotifications && event.user_id !== user?.id) {
      const action = event.type === 'like' ? 'geliked' : 'unliked';
      toast.info(`${event.username} hat einen Post ${action}`);
    }
  }, [user, enableNotifications]);

  // Handle comment update
  const handleCommentUpdate = useCallback((event: LiveFeedEvent) => {
    const { comments_count } = event.data;
    
    setPosts(prev => 
      prev.map(post => 
        post.id === event.post_id 
          ? { ...post, comments_count }
          : post
      )
    );

    if (enableNotifications && event.user_id !== user?.id) {
      toast.info(`${event.username} hat einen Kommentar hinzugefügt`);
    }
  }, [user, enableNotifications]);

  // Handle share update
  const handleShareUpdate = useCallback((event: LiveFeedEvent) => {
    const { shares_count, is_shared } = event.data;
    
    setPosts(prev => 
      prev.map(post => 
        post.id === event.post_id 
          ? { ...post, shares_count, is_shared }
          : post
      )
    );

    if (enableNotifications && event.user_id !== user?.id) {
      toast.info(`${event.username} hat einen Post geteilt`);
    }
  }, [user, enableNotifications]);

  // Get notification message
  const getNotificationMessage = useCallback((notification: any): string | null => {
    switch (notification.type) {
      case 'like':
        return `${notification.actor_username} hat deinen Post geliked`;
      case 'comment':
        return `${notification.actor_username} hat deinen Post kommentiert`;
      case 'share':
        return `${notification.actor_username} hat deinen Post geteilt`;
      case 'follow':
        return `${notification.actor_username} folgt dir jetzt`;
      default:
        return null;
    }
  }, []);

  // Subscribe to feed
  const subscribeToFeed = useCallback(async (type: string = feedType) => {
    if (!isConnected) {
      toast.error('WebSocket nicht verbunden');
      return false;
    }

    try {
      await joinRoom(`feed-${type}`);
      console.log(`Subscribed to feed: ${type}`);
      return true;
    } catch (error) {
      console.error('Error subscribing to feed:', error);
      toast.error('Fehler beim Abonnieren des Feeds');
      return false;
    }
  }, [isConnected, joinRoom, feedType]);

  // Unsubscribe from feed
  const unsubscribeFromFeed = useCallback(async (type: string = feedType) => {
    try {
      await leaveRoom(`feed-${type}`);
      console.log(`Unsubscribed from feed: ${type}`);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from feed:', error);
      return false;
    }
  }, [leaveRoom, feedType]);

  // Like/unlike post
  const handleLike = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    try {
      await wsSendMessage({
        type: 'like_post',
        data: {
          post_id: postId,
          timestamp: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Fehler beim Liken des Posts');
      return false;
    }
  }, [isAuthenticated, wsSendMessage]);

  // Comment on post
  const handleComment = useCallback(async (postId: string, content: string) => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    try {
      await wsSendMessage({
        type: 'comment_post',
        data: {
          post_id: postId,
          content,
          timestamp: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error('Error commenting on post:', error);
      toast.error('Fehler beim Kommentieren');
      return false;
    }
  }, [isAuthenticated, wsSendMessage]);

  // Share post
  const handleShare = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    try {
      await wsSendMessage({
        type: 'share_post',
        data: {
          post_id: postId,
          timestamp: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Fehler beim Teilen des Posts');
      return false;
    }
  }, [isAuthenticated, wsSendMessage]);

  // Create new post
  const createPost = useCallback(async (content: string, mediaUrls?: string[]) => {
    if (!isAuthenticated) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    try {
      await wsSendMessage({
        type: 'create_post',
        data: {
          content,
          media_urls: mediaUrls || [],
          timestamp: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Fehler beim Erstellen des Posts');
      return false;
    }
  }, [isAuthenticated, wsSendMessage]);

  // Auto-subscribe to feed
  useEffect(() => {
    if (autoSubscribe && isConnected) {
      subscribeToFeed();
      
      return () => {
        unsubscribeFromFeed();
      };
    }
  }, [autoSubscribe, isConnected, subscribeToFeed, unsubscribeFromFeed]);

  return {
    // State
    posts,
    isLoading,
    error,
    isConnected,
    lastUpdate,

    // Actions
    subscribeToFeed,
    unsubscribeFromFeed,
    handleLike,
    handleComment,
    handleShare,
    createPost,

    // Event handlers
    handleNewPost,
    handlePostUpdate,
    handlePostDelete,
    handleLikeUpdate,
    handleCommentUpdate,
    handleShareUpdate
  };
}; 

