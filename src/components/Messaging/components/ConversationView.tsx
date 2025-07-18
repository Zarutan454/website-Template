
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Separator } from '../../ui/separator';
import { MessageSquare } from 'lucide-react';
import ChatWindow from '../ChatWindow';
import EnhancedMessageInput from '../EnhancedMessageInput';
import ConversationHeader from './ConversationHeader';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { VoiceMessageRecorder } from './VoiceMessageRecorder';
import { UploadResult } from '../../../utils/storageUtils';

interface ConversationViewProps {
  isMobile: boolean;
  selectedConversation: {
    id: number;
    participants: Array<{ id: number; username: string }>;
  } | null;
  showUserProfile: boolean;
  setShowUserProfile: (show: boolean) => void;
  handleBackToList: () => void;
  partnerProfile: {
    id: number;
    username: string;
    display_name?: string;
  } | null;
  isFollowingUser: boolean;
  handleToggleFollow: () => void;
  messages: Array<{
    id: number;
    content: string;
    sender: { id: number; username: string };
    created_at: string;
    message_type: string;
    voice_duration?: number;
    voice_waveform?: number[];
    is_read?: boolean;
  }>;
  profile: {
    id: number;
    username: string;
  } | null;
  chatWindowRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (content: string, attachment?: File) => void;
  sendMessage: { isPending: boolean };
  theme: string;
  // Add WebSocket props
  isConnected: boolean;
  typingUsers: string[];
  sendTyping: (isTyping: boolean) => void;
  sendReadReceipt: (messageIds: string[]) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  isMobile,
  selectedConversation,
  showUserProfile,
  setShowUserProfile,
  handleBackToList,
  partnerProfile,
  isFollowingUser,
  handleToggleFollow,
  messages,
  profile,
  chatWindowRef,
  handleSendMessage,
  sendMessage,
  theme,
  // Add WebSocket props
  isConnected,
  typingUsers,
  sendTyping,
  sendReadReceipt
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [message, setMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle typing indicator
  const handleTyping = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 2000);
  }, [isTyping, sendTyping]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Send read receipts when messages are viewed
  useEffect(() => {
    if (messages && messages.length > 0 && isConnected) {
      const unreadMessages = messages.filter(msg => !msg.is_read && msg.sender.id !== profile?.id);
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id.toString());
        sendReadReceipt(messageIds);
      }
    }
  }, [messages, isConnected, profile?.id, sendReadReceipt]);

  const handleLocalSendMessage = (content: string, attachment?: UploadResult) => {
    if (content.trim()) {
      handleSendMessage(content, attachment?.file);
      setMessage('');
    }
  };

  const handleVoiceMessageSent = () => {
    setShowVoiceRecorder(false);
    // Refresh messages
    window.location.reload();
  };

  const renderMessage = (msg: ConversationViewProps['messages'][0]) => {
    const isOwnMessage = msg.sender.id === profile?.id;
    
    return (
      <div
        key={msg.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {msg.message_type === 'voice' ? (
            <VoiceMessagePlayer
              messageId={msg.id}
              duration={msg.voice_duration || 0}
              waveform={msg.voice_waveform || []}
              isOwnMessage={isOwnMessage}
            />
          ) : (
            <div>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={isMobile ? { x: 300, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full md:w-2/3 flex flex-col ${showUserProfile ? 'md:w-1/3' : 'md:w-2/3'}`}
    >
      <ConversationHeader 
        isMobile={isMobile}
        handleBackToList={handleBackToList}
        partnerProfile={partnerProfile}
        isFollowingUser={isFollowingUser}
        handleToggleFollow={handleToggleFollow}
        setShowUserProfile={setShowUserProfile}
        showUserProfile={showUserProfile}
      />
      <Separator />
      <div className="flex-1 overflow-y-auto">
        {selectedConversation ? (
          <>
            <ChatWindow
              messages={messages || []}
              currentUser={profile}
              partnerProfile={partnerProfile}
              ref={chatWindowRef}
            />
            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                {typingUsers.length === 1 ? (
                  <span>{partnerProfile?.display_name || partnerProfile?.username} is typing...</span>
                ) : (
                  <span>Multiple people are typing...</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 p-6">
              <MessageSquare size={40} className="mx-auto mb-4 text-gray-400" />
              <p>Wähle eine Konversation oder starte eine neue</p>
            </div>
          </div>
        )}
      </div>
      {selectedConversation && (
        <EnhancedMessageInput
          onSendMessage={handleLocalSendMessage}
          isDisabled={!selectedConversation || sendMessage.isPending}
          placeholder="Schreibe eine Nachricht..."
          onTyping={handleTyping}
        />
      )}

      {/* Voice Message Recorder */}
      {showVoiceRecorder && (
        <VoiceMessageRecorder
          conversationId={selectedConversation?.id}
          onMessageSent={handleVoiceMessageSent}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}
    </motion.div>
  );
};

export default ConversationView;
