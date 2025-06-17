import React from 'react';
import { Message } from '../../hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useProfile } from '../../hooks/useProfile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import MessageAttachment from './MessageAttachment';

interface MessageBubbleProps {
  message: Message;
  showSender?: boolean;
  isGroupChat?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showSender = false,
  isGroupChat = false
}) => {
  const { profile } = useProfile();
  const isOwnMessage = message.sender_id === profile?.id;
  
  const formattedTime = format(new Date(message.created_at), 'HH:mm', { locale: de });
  const formattedDate = format(new Date(message.created_at), 'dd. MMMM yyyy', { locale: de });
  
  const hasAttachment = !!message.attachment_url;
  const isImageAttachment = message.message_type === 'image';
  const isVideoAttachment = message.message_type === 'video';
  const isAudioAttachment = message.message_type === 'audio';
  const isFileAttachment = message.message_type === 'file';
  
  return (
    <div className={cn(
      "flex gap-2 mb-2",
      isOwnMessage ? "justify-end" : "justify-start"
    )}>
      {!isOwnMessage && (isGroupChat || showSender) && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url || ''} alt={message.sender_username || ''} />
          <AvatarFallback>
            {message.sender_display_name?.charAt(0) || message.sender_username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[75%]",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {(isGroupChat || showSender) && !isOwnMessage && message.sender_display_name && (
          <span className="text-xs font-medium text-muted-foreground ml-1 mb-1">
            {message.sender_display_name}
          </span>
        )}
        
        <div className={cn(
          "rounded-lg px-3 py-2 break-words",
          isOwnMessage 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {message.content && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          
          {hasAttachment && (
            <MessageAttachment 
              url={message.attachment_url || ''}
              name={message.attachment_name || 'Anhang'}
              type={message.attachment_type || 'application/octet-stream'}
              size={message.attachment_size}
              className={message.content ? 'mt-2' : ''}
            />
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "text-xs block mt-1",
                  isOwnMessage 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                )}>
                  {formattedTime}
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
  );
};

export default MessageBubble;
