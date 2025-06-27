
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationItem from './NotificationItem';
import { Notification } from '@/types/notifications';
import { Spinner } from '@/components/ui/spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface NotificationTabsProps {
  notifications: Notification[];
  filteredNotifications: Notification[];
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
  onTabChange: (value: string) => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead?: () => void;
  onRefresh: () => void;
  onDelete?: (id: string) => Promise<void>;
  formatTime: (timestamp: string) => string;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  notifications,
  filteredNotifications,
  activeTab,
  isLoading,
  error,
  onTabChange,
  onMarkAsRead,
  onRefresh,
  onDelete,
  formatTime,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Tabs 
      defaultValue={activeTab} 
      value={activeTab} 
      onValueChange={onTabChange} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="all" className="relative">
          Alle
          <Badge variant="outline" className="ml-2 px-1.5 text-xs">
            {notifications.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="unread" className="relative">
          Ungelesen
          <Badge variant="outline" className="ml-2 px-1.5 text-xs">
            {unreadCount}
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Keine Benachrichtigungen vorhanden
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <NotificationItem 
                    notification={notification} 
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    formatTime={formatTime}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="unread" className="mt-0">
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Keine ungelesenen Benachrichtigungen vorhanden
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <NotificationItem 
                    notification={notification} 
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    formatTime={formatTime}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
