
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, PaperclipIcon, Smile } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider.utils';

interface MessageInputBarProps {
  onSendMessage: (content: string) => void;
  isDisabled: boolean;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({ onSendMessage, isDisabled }) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-border">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Schreibe eine Nachricht..."
            disabled={isDisabled}
            className={`w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[120px] pr-10`}
            rows={1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 text-muted-foreground hover:text-foreground"
            disabled={isDisabled}
            onClick={() => {}}
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isDisabled}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInputBar;

