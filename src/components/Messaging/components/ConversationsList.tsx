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
  profile: Record<string, unknown>;
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
  const isDark = theme === 'dark';
  const conversations = filteredConversations || [];
  return (
    <motion.div
      initial={isMobile ? { x: -300, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full min-w-[340px] max-w-[400px] flex flex-col h-full bg-transparent border-r ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
    >
      <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-transparent">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
          <MessageSquare size={20} className="text-primary" />
          Nachrichten
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNewConversation}
          className="h-9 w-9"
        >
          <Plus size={20} />
        </Button>
      </div>
      <div className="px-6 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche..."
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Separator />
      <div className="flex-1 flex flex-col justify-center items-center px-4 pb-4">
        {isLoadingConversations ? (
          <div className="w-full flex flex-col gap-3 pt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`} />
                  <div className={`h-3 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`} />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center select-none py-12 w-full bg-transparent">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-300 mb-2">Keine Konversationen gefunden.</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-4">
              Beginne eine neue Nachricht, um hier Konversationen zu sehen.
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <ChatList 
              conversations={conversations}
              selectedChat={selectedConversation}
              onSelectChat={handleSelectConversation}
              currentUser={profile}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ConversationsList;
