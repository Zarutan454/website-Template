
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessagesBadge } from '@/components/Messaging/MessagesBadge';
import { useTheme } from '@/components/ThemeProvider.utils';

export const MessagesDropdown = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="relative">
      <Link to="/messages">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
          aria-label="Nachrichten"
        >
          <MessageCircle size={20} />
          <MessagesBadge className="absolute -top-1 -right-1" />
        </Button>
      </Link>
    </div>
  );
};

export default MessagesDropdown;

