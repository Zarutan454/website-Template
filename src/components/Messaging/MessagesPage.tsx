import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Separator } from '../ui/separator';
import { useTheme } from '../ThemeProvider.utils';
import { useProfile } from '../../hooks/useProfile';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, Users, Plus } from 'lucide-react';
import ConversationsList from './components/ConversationsList';
import ConversationView from './components/ConversationView';
import CreateConversationView from './components/CreateConversationView';
import UserProfile from './UserProfile';
import GroupChatList from './GroupChat/GroupChatList';
import GroupChatView from './GroupChat/GroupChatView';
import { UploadResult } from '../../utils/storageUtils';
import { useAuth } from '@/context/AuthContext.utils';
import { useMessaging } from '../../hooks/useMessaging';
import type { Conversation } from '../../types/messaging';

export const MessagesPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { user: profile } = useAuth();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const isNewConversation = location.pathname === '/messages/new';
  
  // Use the new messaging hooks
  const {
    conversations,
    isLoadingConversations,
    createConversation,
    messages,
    conversation,
    isLoadingMessages,
    sendMessage,
    isSending,
    markAsRead,
    selectedConversationId,
    selectConversation,
    // WebSocket features
    isConnected,
    typingUsers,
    sendTyping,
    sendReadReceipt,
    sendReaction,
  } = useMessaging();

  useEffect(() => {
    if (conversationId && conversationId !== 'new' && conversations) {
      const conversation = conversations.find(conv => conv.id.toString() === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        selectConversation(conversation.id);
      }
    }
  }, [conversations, conversationId, selectConversation]);

  useEffect(() => {
    if (chatWindowRef.current && messages && messages.length > 0) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsRead();
    }
  }, [selectedConversationId, markAsRead]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowUserProfile(false);
    selectConversation(conversation.id);
    navigate(`/messages/${conversation.id}`);
  };

  const handleSendMessage = (content: string, attachment?: UploadResult) => {
    if (selectedConversationId) {
      sendMessage(content, attachment);
    }
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
    navigate('/messages/new');
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowUserProfile(false);
    navigate('/messages');
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedConversation(null);
    setShowUserProfile(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'direct' | 'groups');
  };

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-[#10131a] text-white' : 'bg-gray-50 text-gray-900'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-[1600px] mx-auto flex h-[calc(100vh-32px)] shadow-xl rounded-2xl overflow-hidden border border-gray-800/10 dark:border-gray-800/40 bg-white dark:bg-[#181c24]">
        {/* Sidebar/Conversation List */}
        <div className="flex flex-col w-[340px] min-w-[280px] max-w-[400px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181c24] h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181c24]">
            <h1 className="text-xl font-bold tracking-tight">Nachrichten</h1>
            <button
              onClick={handleNewConversation}
              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow"
            >
              <Plus size={16} /> Neu
            </button>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full bg-transparent border-b border-gray-200 dark:border-gray-800">
              <TabsTrigger value="direct" className="flex items-center gap-2 py-3 text-base">
                <MessageSquare size={16} /> Direkt
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2 py-3 text-base">
                <Users size={16} /> Gruppen
              </TabsTrigger>
            </TabsList>
            <TabsContent value="direct" className="flex-1 overflow-y-auto">
              <ConversationsList
                conversations={conversations}
                isLoading={isLoadingConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </TabsContent>
            <TabsContent value="groups" className="flex-1 overflow-y-auto">
              <GroupChatList
                onSelectGroup={handleSelectGroup}
                selectedGroupId={selectedGroupId}
              />
            </TabsContent>
          </Tabs>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-[#f7f9fb] dark:bg-[#131722]">
          <AnimatePresence mode="wait">
            {isNewConversation ? (
              <CreateConversationView
                handleBackToList={handleBackToList}
                isMobile={false}
                theme={theme}
              />
            ) : selectedConversation ? (
              <ConversationView
                conversation={selectedConversation}
                onBack={handleBackToList}
                chatWindowRef={chatWindowRef}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingMessages}
                messages={messages}
                typingUsers={typingUsers}
                sendTyping={sendTyping}
                sendReadReceipt={sendReadReceipt}
                sendReaction={sendReaction}
                isConnected={isConnected}
                theme={theme}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center flex-col text-center select-none">
                <div className="text-5xl mb-4 opacity-30">💬</div>
                <div className="text-lg font-medium opacity-80 mb-2">Wähle eine Konversation oder starte eine neue</div>
                <div className="text-base text-gray-500 dark:text-gray-400">Hier erscheinen deine Nachrichten</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

