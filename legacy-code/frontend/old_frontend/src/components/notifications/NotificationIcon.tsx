
import React from 'react';
import { NotificationType } from '@/types/notifications';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  Users, 
  AtSign, 
  Share2, 
  Database, 
  Award, 
  Settings, 
  Zap
} from 'lucide-react';

interface NotificationIconProps {
  type: NotificationType | string;
  size?: number;
  className?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ 
  type, 
  size = 16, 
  className = "text-primary" 
}) => {
  switch (type) {
    case 'like':
      return <Heart size={size} className={`${className} text-red-500`} />;
    case 'comment':
      return <MessageSquare size={size} className={`${className} text-blue-500`} />;
    case 'follow':
      return <Users size={size} className={`${className} text-green-500`} />;
    case 'mention':
      return <AtSign size={size} className={`${className} text-purple-500`} />;
    case 'post_activity':
      return <Share2 size={size} className={`${className} text-indigo-500`} />;
    case 'mining_reward':
      return <Database size={size} className={`${className} text-yellow-500`} />;
    case 'post_share':
      return <Share2 size={size} className={`${className} text-orange-500`} />;
    case 'system':
      return <Settings size={size} className={`${className} text-gray-500`} />;
    case 'achievement':
      return <Award size={size} className={`${className} text-emerald-500`} />;
    default:
      return <Bell size={size} className={className} />;
  }
};
