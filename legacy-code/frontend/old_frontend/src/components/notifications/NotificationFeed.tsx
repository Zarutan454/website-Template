
import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';

interface NotificationFeedProps {
  variant?: 'dropdown' | 'page';
  maxHeight?: string;
}

const NotificationFeed: React.FC<NotificationFeedProps> = ({
  variant = 'dropdown',
  maxHeight = '400px'
}) => {
  const [open, setOpen] = useState(false);
  const { profile, isLoading: profileLoading } = useProfile();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    formatTime
  } = useNotifications();

  // Close popup after clicking a notification
  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    // If we're in dropdown mode, close the popup after a short delay
    if (variant === 'dropdown') {
      setTimeout(() => setOpen(false), 300);
    }
  };

  // Close popup when user clicks elsewhere
  useEffect(() => {
    if (variant !== 'dropdown') return;
    
    const handleClickOutside = () => {
      setOpen(false);
    };

    if (open) {
      setTimeout(() => {
        window.addEventListener('click', handleClickOutside);
      }, 10);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [open, variant]);

  if (!profile || profileLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="relative"
      >
        <Link to="/login">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Benachrichtigungen"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[380px] p-0" 
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-3">
            <h4 className="font-medium">Benachrichtigungen</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => markAllAsRead()}
              >
                <Check className="mr-1 h-4 w-4" />
                Alle gelesen
              </Button>
            )}
          </div>
          <Separator />

          <div 
            className={`overflow-auto ${isLoading ? 'flex justify-center items-center' : ''}`}
            style={{ maxHeight }}
          >
            {isLoading ? (
              <div className="py-8">
                <Spinner />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                Keine Benachrichtigungen
              </div>
            ) : (
              <div className="p-2">
                {notifications.slice(0, 10).map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleNotificationClick}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </div>

          <Separator />
          <div className="p-2 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="w-full"
              onClick={() => setOpen(false)}
            >
              <Link to="/notifications">Alle Benachrichtigungen anzeigen</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Page variant - return null, not used currently but prepared for future extension
  return null;
};

export default NotificationFeed;
