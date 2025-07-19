
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Notification } from '@/hooks/useNotifications';
import { NotificationType } from '@/types/notifications';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, MessageSquare, UserPlus, AtSign, 
  CoinsIcon, BellRing, Megaphone, Share
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider.utils';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  formatTime: (timestamp: string) => string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  formatTime
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getTypeIcon = (type: string) => {
    const notificationType = type as NotificationType;
    switch (notificationType) {
      case 'like':
        return <Heart className="text-pink-500" size={18} />;
      case 'comment':
        return <MessageSquare className="text-blue-500" size={18} />;
      case 'follow':
        return <UserPlus className="text-green-500" size={18} />;
      case 'mention':
        return <AtSign className="text-purple-500" size={18} />;
      case 'mining_reward':
        return <CoinsIcon className="text-amber-500" size={18} />;
      case 'post_share':
        return <Share className="text-indigo-500" size={18} />;
      case 'system':
        return <BellRing className="text-gray-400" size={18} />;
      default:
        return <Megaphone className="text-gray-400" size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    const notificationType = type as NotificationType;
    switch (notificationType) {
      case 'like':
        return 'bg-pink-900/20 border-pink-800 text-pink-400';
      case 'comment':
        return 'bg-blue-900/20 border-blue-800 text-blue-400';
      case 'follow':
        return 'bg-green-900/20 border-green-800 text-green-400';
      case 'mention':
        return 'bg-purple-900/20 border-purple-800 text-purple-400';
      case 'mining_reward':
        return 'bg-amber-900/20 border-amber-800 text-amber-400';
      case 'post_share':
        return 'bg-indigo-900/20 border-indigo-800 text-indigo-400';
      case 'system':
        return 'bg-dark-300 border-gray-700 text-gray-300';
      default:
        return 'bg-dark-300 border-gray-700 text-gray-300';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.target_id && notification.target_type) {
      switch (notification.target_type) {
        case 'post':
          navigate('/feed');
          break;
        case 'user':
          navigate(`/profile/${notification.target_id}`);
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  if (notifications.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${theme === 'dark' ? 'bg-dark-100/70 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'} 
          rounded-lg p-8 text-center border ${theme === 'dark' ? 'border-gray-800/60' : 'border-gray-200/60'}`}
      >
        <BellRing className={`mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-3`} size={48} />
        <h3 className="text-lg font-semibold mb-3">Keine Benachrichtigungen</h3>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
          Du hast noch keine Benachrichtigungen erhalten.
        </p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Benachrichtigungen erscheinen hier, wenn jemand:
        </p>
        <ul className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} inline-block text-left mx-auto`}>
          <li className="flex items-center mb-1">
            <Heart size={14} className="text-pink-500 mr-2" />
            <span>Deinen Beitrag liked</span>
          </li>
          <li className="flex items-center mb-1">
            <MessageSquare size={14} className="text-blue-500 mr-2" />
            <span>Deinen Beitrag kommentiert</span>
          </li>
          <li className="flex items-center mb-1">
            <UserPlus size={14} className="text-green-500 mr-2" />
            <span>Dir folgt</span>
          </li>
          <li className="flex items-center">
            <AtSign size={14} className="text-purple-500 mr-2" />
            <span>Dich in einem Beitrag erwähnt</span>
          </li>
        </ul>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <motion.div 
          key={notification.id}
          initial={{ opacity: 0.8, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3 }}
          onClick={() => handleNotificationClick(notification)}
          className={`${theme === 'dark' ? 'bg-dark-100/70 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'} 
            rounded-lg p-4 flex items-start cursor-pointer transition-all shadow-md hover:shadow-lg
            ${!notification.read 
              ? theme === 'dark' 
                ? 'border-l-4 border-blue-500 shadow-blue-900/10' 
                : 'border-l-4 border-blue-500 shadow-blue-500/10' 
              : theme === 'dark'
                ? 'border border-gray-800/60' 
                : 'border border-gray-200/60'
            } 
            ${theme === 'dark' ? 'hover:bg-dark-300/70' : 'hover:bg-gray-100/70'}`}
        >
          <div className="relative">
            <Avatar className={`h-11 w-11 ${theme === 'dark' ? 'ring-2 ring-dark-300' : 'ring-2 ring-gray-200'}`}>
              {notification.actor_avatar_url ? (
                <AvatarImage src={notification.actor_avatar_url} alt={notification.actor_display_name || 'User'} />
              ) : null}
              <AvatarFallback className={`${theme === 'dark' ? 'bg-dark-300 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {notification.actor_display_name 
                  ? getInitials(notification.actor_display_name)
                  : getInitials(notification.type)}
              </AvatarFallback>
            </Avatar>
            <span className={`absolute -bottom-1 -right-1 p-1 rounded-full ${theme === 'dark' ? 'bg-dark-100' : 'bg-white'} ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'}`}>
              {getTypeIcon(notification.type)}
            </span>
          </div>
          
          <div className="ml-4 flex-1">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {notification.actor_display_name || notification.actor_username || 'System'}
              </span>{' '}
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{notification.content}</span>
            </p>
            
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <span>{formatTime(notification.created_at)}</span>
              <Badge 
                variant="outline" 
                className={`ml-2 text-xs ${getTypeColor(notification.type)}`}
              >
                {notification.type === 'mining_reward' ? 'Mining' : 
                  notification.type === 'system' ? 'System' : 
                  notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </Badge>
              
              {!notification.read && (
                <div className="ml-auto flex items-center">
                  <span className="text-xs mr-1 text-blue-400">Ungelesen</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

