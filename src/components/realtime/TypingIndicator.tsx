import * as React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className
}) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} schreibt...`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0]} und ${typingUsers[1]} schreiben...`;
    }
    return `${typingUsers[0]} und ${typingUsers.length - 1} weitere schreiben...`;
  };

  return (
    <div className={cn("flex items-center space-x-2 p-2 text-sm text-muted-foreground", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator; 