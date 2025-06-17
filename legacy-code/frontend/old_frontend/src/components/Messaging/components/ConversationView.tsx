
import React from 'react';
import { motion } from 'framer-motion';
import { Separator } from '../../ui/separator';
import { MessageSquare } from 'lucide-react';
import ChatWindow from '../ChatWindow';
import EnhancedMessageInput from '../EnhancedMessageInput';
import ConversationHeader from './ConversationHeader';
import { UploadResult } from '../../../utils/storageUtils';

interface ConversationViewProps {
  isMobile: boolean;
  selectedConversation: any;
  showUserProfile: boolean;
  setShowUserProfile: (show: boolean) => void;
  handleBackToList: () => void;
  partnerProfile: any;
  isFollowingUser: boolean;
  handleToggleFollow: () => void;
  messages: any[];
  profile: any;
  chatWindowRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (content: string, attachment?: UploadResult) => void;
  sendMessage: any;
  theme: string;
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
  theme
}) => {
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
          <ChatWindow
            messages={messages || []}
            currentUser={profile}
            partnerProfile={partnerProfile}
            ref={chatWindowRef}
          />
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
          onSendMessage={handleSendMessage}
          isDisabled={!selectedConversation || sendMessage.isPending}
          placeholder="Schreibe eine Nachricht..."
        />
      )}
    </motion.div>
  );
};

export default ConversationView;
