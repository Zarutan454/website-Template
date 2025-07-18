import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/django-api-new';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Fetch unread notification count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/unread-count/');
      return response.data as { count: number };
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const unreadCount = unreadCountData?.count || 0;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsNotificationCenterOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
};

export default NotificationBell; 