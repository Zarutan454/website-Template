import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext.utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { Check, CheckCheck, Clock } from 'lucide-react';
import MessageAttachment from './MessageAttachment';

interface Message {
  id: string;
  content?: string;
  sender_id: string;
  sender_username?: string;
  sender_display_name?: string;
  sender_avatar_url?: string;
  created_at: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice';
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  attachment_size?: number;
  is_read?: boolean;
  is_delivered?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  showSender?: boolean;
  isGroupChat?: boolean;
  isLastMessage?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showSender = false,
  isGroupChat = false,
  isLastMessage = false
}) => {
  const { user: profile } = useAuth();
  const isOwnMessage = message.sender_id === profile?.id;
  
  const formattedTime = format(new Date(message.created_at), 'HH:mm', { locale: de });
  const formattedDate = format(new Date(message.created_at), 'dd. MMMM yyyy', { locale: de });
  
  const hasAttachment = !!message.attachment_url;
  const isImageAttachment = message.message_type === 'image';
  const isVideoAttachment = message.message_type === 'video';
  const isAudioAttachment = message.message_type === 'audio';
  const isFileAttachment = message.message_type === 'file';
  const isVoiceAttachment = message.message_type === 'voice';
  
  const getMessageStatus = () => {
    if (!isOwnMessage || !isLastMessage) return null;
    
    if (message.is_read) {
      return <CheckCheck size={14} className="text-blue-500" />;
    } else if (message.is_delivered) {
      return <CheckCheck size={14} className="text-gray-400" />;
    } else {
      return <Check size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className={cn(
      "flex gap-2 mb-3 group",
      isOwnMessage ? "justify-end" : "justify-start"
    )}>
      {/* Avatar für andere Nachrichten */}
      {!isOwnMessage && (isGroupChat || showSender) && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url || ''} alt={message.sender_username || ''} />
          <AvatarFallback className="bg-gradient-to-br from-primary-500/80 to-secondary-600/80 text-white text-xs">
            {message.sender_display_name?.charAt(0) || message.sender_username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Spacer für eigene Nachrichten */}
      {isOwnMessage && (isGroupChat || showSender) && (
        <div className="w-8 flex-shrink-0" />
      )}
      
      <div className={cn(
        "flex flex-col max-w-[75%]",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {/* Sender Name für Gruppen-Chats */}
        {(isGroupChat || showSender) && !isOwnMessage && message.sender_display_name && (
          <span className="text-xs font-medium text-muted-foreground ml-1 mb-1">
            {message.sender_display_name}
          </span>
        )}
        
        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-2 break-words shadow-sm",
          isOwnMessage 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted border border-gray-200 dark:border-gray-700"
        )}>
          {/* Message Content */}
          {message.content && (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
          
          {/* Attachment */}
          {hasAttachment && (
            <div className={cn("mt-2", message.content ? 'border-t border-current/20 pt-2' : '')}>
              <MessageAttachment 
                url={message.attachment_url || ''}
                name={message.attachment_name || 'Anhang'}
                type={message.attachment_type || 'application/octet-stream'}
                size={message.attachment_size}
              />
            </div>
          )}
          
          {/* Message Footer */}
          <div className="flex items-center gap-1 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-xs flex items-center gap-1",
                    isOwnMessage 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  )}>
                    {formattedTime}
                    {getMessageStatus()}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{formattedDate}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

