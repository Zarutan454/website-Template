import React, { useState } from 'react';
import { useDjangoNotifications } from '@/hooks/notifications/useDjangoNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  AtSign, 
  Activity, 
  Coins, 
  Share2, 
  Settings,
  Check,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Beispiel-Komponente für die Verwendung des Django Notification Systems
 * 
 * ALT (Supabase):
 * const { data: notifications } = useSupabaseQuery('notifications');
 * 
 * NEU (Django):
 * const { notifications, unreadCount, markAsRead } = useDjangoNotifications();
 */
const DjangoNotificationExample: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    like_notifications: true,
    comment_notifications: true,
    follow_notifications: true,
    mention_notifications: true,
    mining_notifications: true,
    system_notifications: true
  });

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    isRefreshing,
    fetchNotifications,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getSettings,
    updateSettings,
    subscribeToPush,
    unsubscribeFromPush
  } = useDjangoNotifications({
    enableAutoRefresh: true,
    refreshInterval: 30000
  });

  // Load settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      const currentSettings = await getSettings();
      if (currentSettings) {
        setSettings(currentSettings);
      }
    };
    loadSettings();
  }, [getSettings]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const confirmed = window.confirm('Möchtest du diese Benachrichtigung wirklich löschen?');
    if (confirmed) {
      await deleteNotification(notificationId);
    }
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    const success = await updateSettings({ [key]: value });
    if (!success) {
      // Revert on error
      setSettings(settings);
    }
  };

  const handlePushSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        });

        await subscribeToPush({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, 
              new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0))
            )),
            auth: btoa(String.fromCharCode.apply(null, 
              new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0))
            ))
          }
        });
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        toast.error('Fehler beim Aktivieren der Push-Benachrichtigungen');
      }
    } else {
      toast.error('Push-Benachrichtigungen werden nicht unterstützt');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'post_activity':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'mining_reward':
        return <Coins className="w-4 h-4 text-yellow-500" />;
      case 'post_share':
        return <Share2 className="w-4 h-4 text-indigo-500" />;
      case 'system':
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'border-l-red-500';
      case 'comment':
        return 'border-l-blue-500';
      case 'follow':
        return 'border-l-green-500';
      case 'mention':
        return 'border-l-purple-500';
      case 'post_activity':
        return 'border-l-orange-500';
      case 'mining_reward':
        return 'border-l-yellow-500';
      case 'post_share':
        return 'border-l-indigo-500';
      case 'system':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Fehler: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Benachrichtigungen</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
            >
              Alle als gelesen markieren
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Benachrichtigungseinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>E-Mail-Benachrichtigungen</span>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Push-Benachrichtigungen</span>
                <Switch
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Like-Benachrichtigungen</span>
                <Switch
                  checked={settings.like_notifications}
                  onCheckedChange={(checked) => handleSettingChange('like_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Kommentar-Benachrichtigungen</span>
                <Switch
                  checked={settings.comment_notifications}
                  onCheckedChange={(checked) => handleSettingChange('comment_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Follow-Benachrichtigungen</span>
                <Switch
                  checked={settings.follow_notifications}
                  onCheckedChange={(checked) => handleSettingChange('follow_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Mention-Benachrichtigungen</span>
                <Switch
                  checked={settings.mention_notifications}
                  onCheckedChange={(checked) => handleSettingChange('mention_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Mining-Benachrichtigungen</span>
                <Switch
                  checked={settings.mining_notifications}
                  onCheckedChange={(checked) => handleSettingChange('mining_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>System-Benachrichtigungen</span>
                <Switch
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) => handleSettingChange('system_notifications', checked)}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={handlePushSubscription} variant="outline" size="sm">
                Push-Benachrichtigungen aktivieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <div className="space-y-2">
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Benachrichtigungen...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Keine Benachrichtigungen vorhanden</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow ${
                !notification.read ? 'bg-blue-50 border-blue-200' : ''
              } ${getNotificationColor(notification.type)} border-l-4`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {notification.actor_avatar_url ? (
                          <img
                            src={notification.actor_avatar_url}
                            alt={notification.actor_display_name || notification.actor_username}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {(notification.actor_display_name || notification.actor_username || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()} - {new Date(notification.created_at).toLocaleTimeString()}
                        </span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            Neu
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!notification.read && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                        title="Als gelesen markieren"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteNotification(notification.id)}
                      variant="ghost"
                      size="sm"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline" disabled={isLoading}>
            {isLoading ? 'Lade...' : 'Mehr Benachrichtigungen laden'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DjangoNotificationExample; 
