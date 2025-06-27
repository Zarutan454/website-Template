import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ChatList from '../ChatList';
// import { Conversation } from '@/hooks/useMessages';
// TODO: Diese Komponente muss auf Django-API migriert werden. useMessages wurde entfernt.

interface ConversationsListProps {
  isLoadingConversations: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: Conversation[];
  selectedConversation: Conversation | null;
  handleSelectConversation: (conversation: Conversation) => void;
  handleNewConversation: () => void;
  theme: string;
  profile: any;
  isMobile: boolean;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  isLoadingConversations,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  selectedConversation,
  handleSelectConversation,
  handleNewConversation,
  theme,
  profile,
  isMobile
}) => {
  return (
    <motion.div
      initial={isMobile ? { x: -300, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full md:w-1/3 border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex flex-col`}
    >
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare size={20} className="text-primary" />
          Nachrichten
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNewConversation}
          className="h-8 w-8"
        >
          <Plus size={20} />
        </Button>
      </div>
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
                  <div className={`h-3 w-2/3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ChatList 
            conversations={filteredConversations || []}
            selectedChat={selectedConversation}
            onSelectChat={handleSelectConversation}
            currentUser={profile}
          />
        )}
      </div>
    </motion.div>
  );
};

export default ConversationsList;
