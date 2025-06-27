import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';
import { NotificationsBadge } from './NotificationsBadge';

interface NotificationsPopoverProps {
  className?: string;
  maxHeight?: string;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ 
  className,
  maxHeight = "400px" 
}) => {
  const [open, setOpen] = useState(false);
  const { user: profile } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    formatTime
  } = useNotifications();

  // Benachrichtigung als gelesen markieren, wenn darauf geklickt wird
  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    // Schließe das Popover nach kurzer Verzögerung
    setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  // Schließe das Popover, wenn woanders hingeklickt wird
  useEffect(() => {
    const handleClickOutside = () => {
      setOpen(false);
    };

    if (open) {
      setTimeout(() => {
        window.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  if (!profile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        asChild
        className={className}
      >
        <Link to="/login">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
        >
          <Bell className="h-5 w-5" />
          <NotificationsBadge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs" />
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
};
