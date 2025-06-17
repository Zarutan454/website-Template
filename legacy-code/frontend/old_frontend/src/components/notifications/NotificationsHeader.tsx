
import React from 'react';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface NotificationsHeaderProps {
  isLoading: boolean;
  hasUnread: boolean;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  isLoading,
  hasUnread,
  onMarkAllAsRead,
  onRefresh
}) => {
  return (
    <div className="flex items-center gap-2">
      <Bell className="h-6 w-6 mr-2 text-primary" />
      <h1 className="text-2xl font-bold">Benachrichtigungen</h1>
      
      <div className="flex-1"></div>
      
      {hasUnread && (
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllAsRead}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Alle als gelesen markieren</span>
          <span className="sm:hidden">Alle gelesen</span>
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-8 w-8"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
