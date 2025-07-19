import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext.utils';
import { useTheme } from '@/components/ThemeProvider.utils';
import { MessageCircle, Plus, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Conversation {
  id: string;
  creator_id: string;
  recipient_id: string;
  creator_username?: string;
  creator_display_name?: string;
  creator_avatar_url?: string;
  recipient_username?: string;
  recipient_display_name?: string;
  recipient_avatar_url?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  is_group?: boolean;
  group_name?: string;
  group_avatar_url?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  setSearchQuery
}) => {
  const { user: profile } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
      if (diffInHours < 24) {
        return format(date, "HH:mm", { locale: de });
      } else if (diffInHours < 168) {
        return format(date, "EEEEEE", { locale: de });
      } else {
        return format(date, "dd.MM", { locale: de });
      }
    } catch (err) {
      return "";
    }
  };

  const getConversationInfo = (conversation: Conversation) => {
    if (conversation.is_group) {
      return {
        name: conversation.group_name || 'Gruppe',
        avatar: conversation.group_avatar_url,
        initials: (conversation.group_name || 'G')[0].toUpperCase()
      };
    }
    const isCreator = profile?.id === conversation.creator_id;
    const partnerName = isCreator 
      ? conversation.recipient_display_name || conversation.recipient_username
      : conversation.creator_display_name || conversation.creator_username;
    const partnerAvatar = isCreator
      ? conversation.recipient_avatar_url
      : conversation.creator_avatar_url;
    const initials = partnerName ? partnerName.charAt(0).toUpperCase() : '?';
    return {
      name: partnerName || 'Unbekannter Benutzer',
      avatar: partnerAvatar,
      initials
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full px-6 pt-6">
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center p-4 rounded-xl mb-2 bg-gray-100 dark:bg-gray-800"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full px-6 pt-6">
      {/* Suche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Suche..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      {/* Leerer State */}
      {conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center select-none py-12 bg-transparent">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-300 mb-2">Keine Konversationen gefunden.</h3>
          <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-4">
            Beginne eine neue Nachricht, um hier Konversationen zu sehen.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {conversations.map((conversation, index) => {
            const conversationInfo = getConversationInfo(conversation);
            const unreadCount = conversation.unread_count || 0;
            const isSelected = selectedConversation && conversation.id === selectedConversation.id;
            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 rounded-xl flex items-center cursor-pointer transition-all duration-200 mb-1 ${
                  isSelected
                    ? isDarkMode ? 'bg-primary/20 border border-primary/30' : 'bg-primary/10 border border-primary/20'
                    : unreadCount > 0
                    ? isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-gray-100 hover:bg-gray-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={{ minHeight: 72 }}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {conversationInfo.avatar ? (
                      <AvatarImage src={conversationInfo.avatar} alt={conversationInfo.name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary-500/80 to-secondary-600/80 text-white font-medium">
                        {conversationInfo.initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* Online Status Indicator */}
                  {!conversation.is_group && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold truncate text-base">
                      {conversationInfo.name}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.last_message_at ? formatDate(conversation.last_message_at) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate max-w-[220px] ${
                      unreadCount > 0 
                        ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {conversation.last_message || 'Neue Konversation'}
                    </p>
                    {unreadCount > 0 && (
                      <Badge 
                        className="ml-2 bg-primary-500 hover:bg-primary-500 text-white"
                        variant="default"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;


