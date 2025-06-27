import React, { useEffect, useRef } from 'react';
// import { Message } from '@/hooks/useMessages';
// TODO: Diese Komponente muss auf Django-API migriert werden. useMessages wurde entfernt.
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelative } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onLoadMore, hasMore }) => {
  const { theme } = useTheme();
  const { user: profile } = useAuth();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex items-start space-x-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
            <div className={`h-8 w-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}></div>
            <div className={`p-3 rounded-lg max-w-[80%] ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}>
              <div className="h-4 w-32 mb-2 rounded"></div>
              <div className="h-3 w-48 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Keine Nachrichten</p>
          <p className="text-sm mt-2">Beginne die Konversation, indem du eine Nachricht sendest.</p>
        </div>
      </div>
    );
  }

  const formatMessageTime = (dateString: string) => {
    try {
      return formatRelative(new Date(dateString), new Date(), {
        locale: de
      });
    } catch (error) {
      return 'Unbekannt';
    }
  };

  // Group messages by day
  type MessagesByDay = {
    [date: string]: Message[];
  };

  const groupMessagesByDay = (messages: Message[]): MessagesByDay => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.created_at).toLocaleDateString('de-DE');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as MessagesByDay);
  };

  const messagesByDay = groupMessagesByDay(messages);

  return (
    <div className="space-y-6 px-4 py-6">
      {Object.entries(messagesByDay).map(([date, dayMessages]) => (
        <div key={date} className="space-y-4">
          <div className="text-center">
            <span className={`px-3 py-1 text-xs rounded-full inline-block ${
              theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}>
              {date}
            </span>
          </div>
          
          {dayMessages.map((message) => {
            const isCurrentUser = profile && message.sender_id === profile.id;
            
            return (
              <div 
                key={message.id} 
                className={`flex items-start space-x-2 ${isCurrentUser ? 'justify-end flex-row-reverse space-x-reverse' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.sender_avatar_url ? (
                      <AvatarImage src={message.sender_avatar_url} alt={message.sender_username || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                        {(message.sender_username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
                <div 
                  className={`p-3 rounded-lg max-w-[85%] ${
                    isCurrentUser 
                      ? 'bg-primary text-white' 
                      : theme === 'dark' 
                        ? 'bg-gray-800 text-gray-100' 
                        : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className={`text-xs mt-1 text-right ${
                    isCurrentUser ? 'text-primary-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
