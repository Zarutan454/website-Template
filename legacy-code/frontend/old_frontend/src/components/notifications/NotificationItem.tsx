
import React from 'react';
import { Notification } from '@/types/notifications';
import { NotificationIcon } from './NotificationIcon';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  formatTime?: (timestamp: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  formatTime
}) => {
  const handleClick = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
    
    // Wenn die Benachrichtigung ein Ziel hat, könnten wir dorthin navigieren
    if (notification.target_id && notification.target_type === 'post') {
      // Hier könnte Navigation zum Post implementiert werden
    }
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(notification.id);
    }
  };
  
  // Zeitanzeige formatieren
  const formattedTime = formatTime 
    ? formatTime(notification.created_at)
    : formatDistanceToNow(new Date(notification.created_at), { 
        addSuffix: true, 
        locale: de 
      });
      
  // Name des Akteurs bestimmen
  const actorName = notification.actor_display_name || notification.actor_username || 'Jemand';
  
  // Benutzerbild des Akteurs
  const actorAvatar = notification.actor_avatar_url || '';
  
  // Initialen für Avatar-Fallback generieren
  const getInitials = () => {
    if (notification.actor_display_name) {
      return notification.actor_display_name.charAt(0).toUpperCase();
    }
    if (notification.actor_username) {
      return notification.actor_username.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  // Ziel-Link generieren
  const getTargetLink = () => {
    if (notification.target_id) {
      if (notification.target_type === 'post') {
        return `/post/${notification.target_id}`;
      } else if (notification.target_type === 'user' && notification.actor_username) {
        return `/profile/${notification.actor_username}`;
      }
    }
    return null;
  };
  
  const targetLink = getTargetLink();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        p-3 mb-2 rounded-lg transition-colors cursor-pointer
        ${notification.read ? 'bg-background hover:bg-accent/50' : 'bg-primary-foreground hover:bg-primary-foreground/80 border-l-4 border-primary'}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} size={20} />
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 items-center mb-1">
            {notification.actor_id && (
              <Avatar className="h-6 w-6 mr-1">
                <AvatarImage src={actorAvatar} alt={actorName} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            )}
            <span className="font-semibold line-clamp-1">
              {actorName}
            </span>
            <span className="line-clamp-2">
              {notification.content}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
            
            <div className="flex items-center gap-1">
              {targetLink && (
                <Link to={targetLink}>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <ExternalLink size={14} />
                  </Button>
                </Link>
              )}
              
              {onDelete && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
