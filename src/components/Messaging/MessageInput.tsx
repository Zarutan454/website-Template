
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Paperclip, Smile } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { handleError } from '@/components/common/ErrorHandler';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isDisabled: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isDisabled,
  placeholder = "Schreibe eine Nachricht...",
  autoFocus = true
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      try {
        onSendMessage(message.trim());
        setMessage('');
        
        // Textarea nach dem Senden fokussieren
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        handleError(error, 'unknown');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Nachricht bei Enter (ohne Shift) senden
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Automatische Höhenanpassung der Textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // Textarea fokussieren, wenn die Komponente eingebunden wird
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
      <div className={`flex items-end space-x-2 rounded-lg p-2 ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'
      }`}>
        <div className="flex space-x-1 flex-shrink-0">
          <Button
            type="button"
            disabled={isDisabled}
            size="icon"
            variant="ghost"
            className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
            title="Anhang hinzufügen"
          >
            <Paperclip size={18} />
          </Button>
        </div>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          className={`min-h-[40px] max-h-[150px] flex-grow resize-none border-0 focus-visible:ring-0 ${
            theme === 'dark' ? 'bg-gray-800/80 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        />
        
        <div className="flex space-x-1 flex-shrink-0">
          <Button
            type="button"
            disabled={isDisabled}
            size="icon"
            variant="ghost"
            className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
            title="Emoji einfügen"
          >
            <Smile size={18} />
          </Button>
          
          <Button
            type="submit"
            disabled={!message.trim() || isDisabled}
            size="icon"
            className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:opacity-50"
            title="Nachricht senden"
          >
            <SendHorizontal size={18} className="text-white" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
