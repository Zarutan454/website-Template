
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

interface MessagesBadgeProps {
  className?: string;
}

export const MessagesBadge: React.FC<MessagesBadgeProps> = ({ className }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useProfile();

  // Ungelesene Nachrichten zählen
  useEffect(() => {
    if (!profile) return;

    const fetchUnreadCount = async () => {
      try {
        // Alle Konversationen des Benutzers abrufen
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`creator_id.eq.${profile.id},recipient_id.eq.${profile.id}`);

        if (!conversations || conversations.length === 0) {
          setUnreadCount(0);
          return;
        }

        // Alle ungelesenen Nachrichten in diesen Konversationen zählen
        const conversationIds = conversations.map(c => c.id);
        const { data, error } = await supabase
          .from('messages')
          .select('id')
          .in('conversation_id', conversationIds)
          .eq('read', false)
          .neq('sender_id', profile.id);

        if (error) {
          return;
        }

        setUnreadCount(data.length);
      } catch (error) {
      }
    };

    fetchUnreadCount();

    // Echtzeitkanal für neue Nachrichten
    const channel = supabase
      .channel('unread-messages-counter')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${profile.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `read=eq.true`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

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
