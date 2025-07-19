import React, { useState, useEffect } from 'react';
import { Bell, Check, X, MessageCircle, Heart, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'friend_request' | 'group_invite' | 'message' | 'post_shared';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/');
      return response.data as Notification[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/unread-count/');
      return response.data as { count: number };
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiClient.patch(`/notifications/${notificationId}/`, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/mark-all-read/');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Alle Benachrichtigungen als gelesen markiert');
    },
  });

  // Update unread count
  useEffect(() => {
    if (unreadCountData) {
      setUnreadCount(unreadCountData.count);
    }
  }, [unreadCountData]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'group_invite':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'post_shared':
        return <MessageCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-blue-50 border-blue-200';
      case 'friend_request':
        return 'bg-green-50 border-green-200';
      case 'group_invite':
        return 'bg-purple-50 border-purple-200';
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'post_shared':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        // Navigate to post
        if (notification.data?.post_id) {
          window.location.href = `/post/${notification.data.post_id}`;
        }
        break;
      case 'friend_request':
        // Navigate to profile
        if (notification.data?.user_id) {
          window.location.href = `/profile/${notification.data.user_id}`;
        }
        break;
      case 'group_invite':
        // Navigate to group
        if (notification.data?.group_id) {
          window.location.href = `/group/${notification.data.group_id}`;
        }
        break;
      case 'message':
        // Navigate to messages
        window.location.href = '/messages';
        break;
      default:
        break;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `vor ${diffInHours} Std`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
    
    return date.toLocaleDateString('de-DE');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Benachrichtigungen
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Alle gelesen
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[60vh]">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Lade Benachrichtigungen...</p>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Keine Benachrichtigungen</h3>
                <p className="text-sm text-muted-foreground">
                  Du hast noch keine Benachrichtigungen erhalten.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter; 