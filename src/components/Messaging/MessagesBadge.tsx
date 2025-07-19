import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/AuthContext.utils';

interface MessagesBadgeProps {
  className?: string;
}

export const MessagesBadge: React.FC<MessagesBadgeProps> = ({ className }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user: profile } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      // TODO: Replace with Django API call
      // const conversations = await messagingAPI.getUnreadConversations(profile.id);
      // const count = conversations.reduce((total, conv) => total + conv.unread_count, 0);
      // setUnreadCount(count);
      setUnreadCount(0); // Temporary placeholder
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchUnreadCount();
    
    // TODO: Replace with Django WebSocket or polling
    // const subscription = messagingAPI.subscribeToMessages(profile?.id, fetchUnreadCount);
    
    return () => {
      // subscription?.unsubscribe();
    };
  }, [fetchUnreadCount, profile?.id]);

  if (unreadCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={className}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
};

