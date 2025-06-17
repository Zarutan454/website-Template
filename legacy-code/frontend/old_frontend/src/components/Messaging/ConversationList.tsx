
import React from 'react';
import { Conversation } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation
}) => {
  const { profile } = useProfile();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
      
      if (diffInHours < 24) {
        return format(date, "HH:mm", { locale: de });
      } else if (diffInHours < 168) { // Weniger als eine Woche
        return format(date, "EEEEEE", { locale: de });
      } else {
        return format(date, "dd.MM", { locale: de });
      }
    } catch (err) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Konversationen</h2>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Konversationen</h2>
      </div>
      
      {conversations.length === 0 ? (
        <div className="text-center text-gray-500 p-6">
          <p>Keine Konversationen vorhanden</p>
          <p className="text-sm mt-2">Beginne eine neue Unterhaltung mit einem Benutzer</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map(conversation => {
            const isCreator = profile?.id === conversation.creator_id;
            const partnerName = isCreator 
              ? conversation.recipient_display_name || conversation.recipient_username
              : conversation.creator_display_name || conversation.creator_username;
            const partnerAvatar = isCreator
              ? conversation.recipient_avatar_url
              : conversation.creator_avatar_url;
            const initials = partnerName ? partnerName.charAt(0).toUpperCase() : '?';
            
            // Ungelesene Nachrichten zählen
            const unreadCount = conversation.unread_count || 0;

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors ${
                  conversation.id === selectedConversationId
                    ? isDarkMode ? 'bg-primary-900/40' : 'bg-primary-100'
                    : unreadCount > 0
                    ? isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Avatar className="h-12 w-12">
                  {partnerAvatar ? (
                    <AvatarImage src={partnerAvatar} alt={partnerName || 'User'} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold truncate">{partnerName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.last_message_at)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate max-w-[200px] ${
                      unreadCount > 0 
                        ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {conversation.last_message || 'Neue Konversation'}
                    </p>
                    
                    {unreadCount > 0 && (
                      <Badge 
                        className="ml-2 bg-primary-500 hover:bg-primary-500"
                        variant="default"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
