import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider.utils';
import { Profile } from '@/hooks/useProfile';

interface ChatListProps {
  conversations: Conversation[];
  selectedChat: Conversation | null;
  onSelectChat: (chat: Conversation) => void;
  currentUser: Profile | null;
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  selectedChat,
  onSelectChat,
  currentUser
}) => {
  const { theme } = useTheme();
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className={`p-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Keine Konversationen gefunden.</p>
        <p className="text-sm mt-2">Beginne eine neue Nachricht, um hier Konversationen zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-[calc(100vh-12rem)]">
      {conversations.map((chat) => {
        const isCreator = chat.creator_id === currentUser?.id;
        const partnerName = isCreator 
          ? (chat.recipient_display_name || chat.recipient_username || 'Unbekannt')
          : (chat.creator_display_name || chat.creator_username || 'Unbekannt');
        
        const partnerAvatar = isCreator ? chat.recipient_avatar_url : chat.creator_avatar_url;
        const lastMessageTime = chat.last_message_at || chat.created_at;
        
        return (
          <motion.div
            key={chat.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedChat?.id === chat.id 
                ? theme === 'dark'
                  ? 'bg-primary-900/20' 
                  : 'bg-primary-50'
                : theme === 'dark'
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectChat(chat)}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center">
              <div className="relative">
                {partnerAvatar ? (
                  <img 
                    src={partnerAvatar} 
                    alt={partnerName} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {partnerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 ${
                  theme === 'dark' ? 'border-gray-800' : 'border-white'
                }`}></div>
              </div>
              
              <div className="flex-1 min-w-0 ml-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {partnerName}
                  </h3>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatTime(lastMessageTime)}
                  </span>
                </div>
                
                {chat.last_message && (
                  <div className="flex items-center text-sm">
                    <p className={`truncate mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {chat.last_message}
                    </p>
                    {chat.unread_count && chat.unread_count > 0 && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChatList;

