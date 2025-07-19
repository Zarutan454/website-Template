import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext.utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw, Check } from 'lucide-react';

export const TestNotifications: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatTime
  } = useNotifications();

  const [testResults, setTestResults] = useState<{
    auth: boolean;
    api: boolean;
    notifications: boolean;
    unreadCount: boolean;
  }>({
    auth: false,
    api: false,
    notifications: false,
    unreadCount: false
  });

  useEffect(() => {
    // Test authentication
    setTestResults(prev => ({
      ...prev,
      auth: !!user?.id
    }));

    // Test notifications loading
    if (!isLoading && !error) {
      setTestResults(prev => ({
        ...prev,
        api: true,
        notifications: Array.isArray(notifications),
        unreadCount: typeof unreadCount === 'number'
      }));
    }
  }, [user, isLoading, error, notifications, unreadCount]);

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl mb-2 ${testResults.auth ? 'text-green-500' : 'text-red-500'}`}>
                {testResults.auth ? '✅' : '❌'}
              </div>
              <div className="text-sm font-medium">Authentication</div>
              <div className="text-xs text-gray-500">
                {user?.username || 'No user'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl mb-2 ${testResults.api ? 'text-green-500' : 'text-red-500'}`}>
                {testResults.api ? '✅' : '❌'}
              </div>
              <div className="text-sm font-medium">API Connection</div>
              <div className="text-xs text-gray-500">
                {isLoading ? 'Loading...' : error ? 'Error' : 'Connected'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl mb-2 ${testResults.notifications ? 'text-green-500' : 'text-red-500'}`}>
                {testResults.notifications ? '✅' : '❌'}
              </div>
              <div className="text-sm font-medium">Notifications</div>
              <div className="text-xs text-gray-500">
                {notifications?.length || 0} items
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl mb-2 ${testResults.unreadCount ? 'text-green-500' : 'text-red-500'}`}>
                {testResults.unreadCount ? '✅' : '❌'}
              </div>
              <div className="text-sm font-medium">Unread Count</div>
              <div className="text-xs text-gray-500">
                {unreadCount || 0} unread
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Error:</div>
              <div className="text-red-600 text-sm">{error.message}</div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notifications ({notifications?.length || 0})</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <div className="text-gray-500">Loading notifications...</div>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={notification.read ? 'secondary' : 'default'}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-sm">
                          {notification.content || 'No content'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 

