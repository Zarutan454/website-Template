
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification } from '@/hooks/useNotifications';
import { Heart, MessageCircle, UserPlus, AtSign, Bell, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  formatTime: (timestamp: string) => string;
  onMarkAsRead: () => void;
  variant?: 'full' | 'compact';
  className?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  formatTime,
  onMarkAsRead,
  variant = 'full',
  className = ''
}) => {
  // Bestimme das Symbol für den Benachrichtigungstyp
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case 'post_activity':
        return <Bell className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle Link-Ziel basierend auf Typ und Ziel
  const getNavigationLink = () => {
    if (notification.target_type === 'post' && notification.target_id) {
      return `/post/${notification.target_id}`;
    } else if (notification.target_type === 'user' && notification.target_id) {
      return `/profile/${notification.target_id}`;
    } else if (notification.actor_id) {
      return `/profile/${notification.actor_id}`;
    }
    return '#';
  };

  // Initialen für Avatar-Fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Render-Variante: Kompakt (für Dropdown)
  if (variant === 'compact') {
    return (
      <motion.div
        className={`flex items-start gap-2 p-2 cursor-pointer transition-colors duration-150 ${!notification.read ? 'bg-primary-foreground/30' : ''} ${className}`}
        onClick={() => {
          if (!notification.read) {
            onMarkAsRead();
          }
        }}
        whileHover={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)' }}
      >
        <div className="relative mt-1">
          {notification.actor_avatar_url ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.actor_avatar_url} alt={notification.actor_display_name || 'Benutzer'} />
              <AvatarFallback>{getInitials(notification.actor_display_name)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary-foreground">
              {getNotificationIcon()}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        </div>
        
        <div className="flex-1 text-sm">
          <div className="line-clamp-2">
            <span className="font-medium">
              {notification.actor_display_name || notification.actor_username || 'Jemand'}
            </span>
            {' '}
            <span className="text-muted-foreground">{notification.content}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatTime(notification.created_at)}
          </div>
        </div>
        
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
        )}
      </motion.div>
    );
  }

  // Render-Variante: Vollständig
  return (
    <Link
      to={getNavigationLink()}
      className={`block border-b last:border-0 transition-colors hover:bg-accent/10 ${!notification.read ? 'bg-primary-foreground/30' : ''} ${className}`}
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead();
        }
      }}
    >
      <motion.div
        className="flex items-start gap-3 p-4"
        whileHover={{ backgroundColor: 'rgba(var(--accent-rgb), 0.05)' }}
      >
        <div className="relative">
          {notification.actor_avatar_url ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={notification.actor_avatar_url} alt={notification.actor_display_name || 'Benutzer'} />
              <AvatarFallback>{getInitials(notification.actor_display_name)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary-foreground">
              {getNotificationIcon()}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-card flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-sm">
            <span className="font-medium">
              {notification.actor_display_name || notification.actor_username || 'Jemand'}
            </span>
            {' '}
            <span className="text-muted-foreground">{notification.content}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatTime(notification.created_at)}
          </div>
        </div>
        
        {!notification.read && (
          <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2"></div>
        )}
      </motion.div>
    </Link>
  );
};

export default NotificationItem;
