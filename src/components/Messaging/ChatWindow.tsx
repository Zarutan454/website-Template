
import React, { forwardRef } from 'react';
import { useTheme } from '@/components/ThemeProvider.utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  [key: string]: unknown;
}
interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}
interface ChatWindowProps {
  messages: Message[];
  currentUser: UserProfile;
  partnerProfile: UserProfile;
  error?: unknown;
  onRetry?: () => void;
}

const ChatWindow = forwardRef<HTMLDivElement, ChatWindowProps>(({
  messages,
  currentUser,
  partnerProfile,
  error,
  onRetry
}, ref) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';


  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'HH:mm', { locale: de });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  // Gruppenweise Nachrichten nach Absender
  const groupedMessages = messages && messages.length > 0 ? messages.reduce((acc: { sender_id: string; messages: Message[] }[], message: Message, index: number) => {
    const prevMessage = messages[index - 1];
    
    if (index === 0 || prevMessage.sender_id !== message.sender_id) {
      // Neue Gruppe beginnen
      acc.push({
        sender_id: message.sender_id,
        messages: [message]
      });
    } else {
      // Zur vorherigen Gruppe hinzufügen
      acc[acc.length - 1].messages.push(message);
    }
    
    return acc;
  }, []) : [];



  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Fehler beim Laden der Nachrichten</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Es gab ein Problem beim Laden der Konversation. Bitte versuche es später erneut.
        </p>
        {onRetry && (
          <Button onClick={onRetry}>
            Erneut versuchen
          </Button>
        )}
      </div>
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-muted-foreground">
          Keine Nachrichten. Starte die Konversation, indem du eine Nachricht sendest.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      {groupedMessages.map((group, groupIndex) => {
        const isCurrentUser = currentUser && group.sender_id === currentUser.id;
        

        
        return (
          <div 
            key={`group-${groupIndex}`}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isCurrentUser && partnerProfile && (
              <Avatar className="h-8 w-8 mr-2 mt-0.5 flex-shrink-0">
                {partnerProfile.avatar_url ? (
                  <AvatarImage src={partnerProfile.avatar_url} alt={partnerProfile.display_name || partnerProfile.username} />
                ) : (
                  <AvatarFallback className="bg-primary-500/10 text-primary-500">
                    {getInitials(partnerProfile.display_name || partnerProfile.username)}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            
            <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
              {group.messages.map((message: Message, messageIndex: number) => (
                <div 
                  key={message.id || `message-${groupIndex}-${messageIndex}`}
                  className={`
                    mb-1 px-3 py-2 rounded-lg
                    ${isCurrentUser 
                      ? isDarkMode 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-primary-500 text-white'
                      : isDarkMode 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }
                    ${messageIndex === 0 ? 'rounded-t-lg' : ''}
                    ${messageIndex === group.messages.length - 1 ? 'rounded-b-lg' : ''}
                    ${isCurrentUser && messageIndex === 0 ? 'rounded-tr-sm' : ''}
                    ${!isCurrentUser && messageIndex === 0 ? 'rounded-tl-sm' : ''}
                  `}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  <div className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : 'text-left'} ${
                    isDarkMode ? 'text-white/60' : isCurrentUser ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.created_at)}
                  </div>
                </div>
              ))}
            </div>
            
            {isCurrentUser && currentUser && (
              <Avatar className="h-8 w-8 ml-2 mt-0.5 flex-shrink-0">
                {currentUser.avatar_url ? (
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.display_name || currentUser.username} />
                ) : (
                  <AvatarFallback className="bg-primary-500/10 text-primary-500">
                    {getInitials(currentUser.display_name || currentUser.username)}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </div>
        );
      })}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;

