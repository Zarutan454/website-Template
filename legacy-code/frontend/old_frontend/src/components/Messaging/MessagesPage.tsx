
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useConversations, useMessages, Conversation } from '../../hooks/useMessages';
import { Separator } from '../ui/separator';
import { useTheme } from '../ThemeProvider';
import { useProfile } from '../../hooks/useProfile';
import { useFollowSystem } from '../../hooks/useFollowSystem';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, Users } from 'lucide-react';
import ConversationsList from './components/ConversationsList';
import ConversationView from './components/ConversationView';
import CreateConversationView from './components/CreateConversationView';
import UserProfile from './UserProfile';
import GroupChatList from './GroupChat/GroupChatList';
import GroupChatView from './GroupChat/GroupChatView';
import { UploadResult } from '../../utils/storageUtils';

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
  const { profile } = useProfile();
  const { isFollowing, followUser, unfollowUser } = useFollowSystem();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const isNewConversation = location.pathname === '/messages/new';
  
  const { 
    conversations, 
    isLoading: isLoadingConversations,
    createConversation
  } = useConversations();

  const { 
    messages, 
    isLoading: isLoadingMessages,
    sendMessage,
    markAsRead
  } = useMessages(selectedConversation?.id || conversationId || null);

  useEffect(() => {
    if (conversationId && conversationId !== 'new' && conversations) {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversations, conversationId]);

  useEffect(() => {
    if (chatWindowRef.current && messages && messages.length > 0) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsRead();
    }
  }, [selectedConversation, markAsRead]);

  const handleSelectConversation = (conversation: Conversation) => {
    console.log('Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    setShowUserProfile(false);
    navigate(`/messages/${conversation.id}`);
  };

  const handleSendMessage = (content: string, attachment?: UploadResult) => {
    if (selectedConversation) {
      console.log('Sending message in conversation:', selectedConversation.id);
      sendMessage.mutate({ 
        content,
        attachment_url: attachment?.url,
        message_type: attachment ? getMessageTypeFromAttachment(attachment) : 'text',
        attachment_name: attachment?.name,
        attachment_size: attachment?.size,
        attachment_type: attachment?.type
      });
    } else {
      console.warn('No selected conversation to send message to');
    }
  };
  
  const getMessageTypeFromAttachment = (attachment: UploadResult): 'text' | 'image' | 'video' | 'audio' | 'file' => {
    const type = attachment.type.split('/')[0];
    
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'audio';
      default:
        return 'file';
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

  const getPartnerProfile = () => {
    if (!selectedConversation || !profile) {
      console.warn('Cannot get partner profile: missing selected conversation or user profile');
      return null;
    }
    
    const isCreator = selectedConversation.creator_id === profile.id;
    
    // Debug the partner information
    console.log('Current user ID:', profile.id);
    console.log('Is creator:', isCreator);
    console.log('Creator ID:', selectedConversation.creator_id);
    console.log('Recipient ID:', selectedConversation.recipient_id);
    console.log('Creator data:', {
      username: selectedConversation.creator_username,
      display_name: selectedConversation.creator_display_name,
      avatar_url: selectedConversation.creator_avatar_url
    });
    console.log('Recipient data:', {
      username: selectedConversation.recipient_username,
      display_name: selectedConversation.recipient_display_name,
      avatar_url: selectedConversation.recipient_avatar_url
    });
    
    const partnerId = isCreator ? selectedConversation.recipient_id : selectedConversation.creator_id;
    const partnerUsername = isCreator ? selectedConversation.recipient_username : selectedConversation.creator_username;
    const partnerDisplayName = isCreator ? selectedConversation.recipient_display_name : selectedConversation.creator_display_name;
    const partnerAvatarUrl = isCreator ? selectedConversation.recipient_avatar_url : selectedConversation.creator_avatar_url;
    
    // Return the partner profile information
    return {
      id: partnerId,
      username: partnerUsername || 'Unknown',
      display_name: partnerDisplayName || partnerUsername || 'Unknown',
      avatar_url: partnerAvatarUrl,
      created_at: selectedConversation.created_at,
      updated_at: selectedConversation.created_at,
      bio: null,
      wallet_address: null,
      posts_count: 0,
      followers_count: 0,
      tokens: 0
    };
  };

  const checkFollowStatus = async () => {
    const partnerProfile = getPartnerProfile();
    if (!partnerProfile) {
      console.warn('Cannot check follow status: partner profile is null');
      return;
    }
    
    try {
      console.log('Checking follow status for user ID:', partnerProfile.id);
      const following = await isFollowing(partnerProfile.id);
      console.log('Follow status result:', following);
      setIsFollowingUser(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      checkFollowStatus();
    }
  }, [selectedConversation]);

  const handleToggleFollow = async () => {
    const partnerProfile = getPartnerProfile();
    if (!partnerProfile) {
      console.warn('Cannot toggle follow: partner profile is null');
      return;
    }
    
    try {
      if (isFollowingUser) {
        console.log('Unfollowing user:', partnerProfile.id);
        const success = await unfollowUser(partnerProfile.id);
        if (success) {
          setIsFollowingUser(false);
          toast.success(`Du folgst ${partnerProfile.display_name || partnerProfile.username} nicht mehr.`);
        }
      } else {
        console.log('Following user:', partnerProfile.id);
        const success = await followUser(partnerProfile.id);
        if (success) {
          setIsFollowingUser(true);
          toast.success(`Du folgst jetzt ${partnerProfile.display_name || partnerProfile.username}.`);
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Fehler beim Ändern des Folge-Status');
    }
  };

  const filteredConversations = searchQuery && conversations
    ? conversations.filter(conv => {
        const isCreator = conv.creator_id === profile?.id;
        const partnerName = isCreator
          ? (conv.recipient_display_name || conv.recipient_username || '')
          : (conv.creator_display_name || conv.creator_username || '');
        
        return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  const isMobile = window.innerWidth < 768;
  const showConversationList = !isMobile || (!selectedConversation && !isNewConversation);
  const showMessages = !isMobile || selectedConversation;
  const showNewConversation = !isMobile || isNewConversation;
  const partnerProfile = getPartnerProfile();

  console.log('Render state:', {
    conversationId,
    selectedConversation: selectedConversation?.id,
    isMobile,
    showConversationList,
    showMessages,
    showNewConversation,
    hasPartnerProfile: !!partnerProfile
  });

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedConversation(null);
    setActiveTab('groups');
    if (isMobile) {
      navigate(`/messages/groups/${groupId}`);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'direct' | 'groups');
    if (value === 'direct') {
      setSelectedGroupId(null);
    } else {
      setSelectedConversation(null);
    }
  };

  return (
    <div className={`bg-background rounded-lg border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} overflow-hidden h-[calc(100vh-180px)]`}>
      <Tabs 
        defaultValue="direct" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="h-full flex flex-col"
      >
        <TabsList className="mx-4 mt-2 justify-start">
          <TabsTrigger value="direct" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Direktnachrichten
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Gruppen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="flex-1 flex overflow-hidden mt-2">
          <div className="flex h-full w-full">
            <AnimatePresence initial={false}>
              {showConversationList && (
                <ConversationsList 
                  isLoadingConversations={isLoadingConversations}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredConversations={filteredConversations || []}
                  selectedConversation={selectedConversation}
                  handleSelectConversation={handleSelectConversation}
                  handleNewConversation={handleNewConversation}
                  theme={theme}
                  profile={profile}
                  isMobile={isMobile}
                />
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {showMessages && selectedConversation && (
                <ConversationView 
                  isMobile={isMobile}
                  selectedConversation={selectedConversation}
                  showUserProfile={showUserProfile}
                  setShowUserProfile={setShowUserProfile}
                  handleBackToList={handleBackToList}
                  partnerProfile={partnerProfile}
                  isFollowingUser={isFollowingUser}
                  handleToggleFollow={handleToggleFollow}
                  messages={messages || []}
                  profile={profile}
                  chatWindowRef={chatWindowRef}
                  handleSendMessage={handleSendMessage}
                  sendMessage={sendMessage}
                  theme={theme}
                />
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {showNewConversation && isNewConversation && (
                <CreateConversationView 
                  handleBackToList={handleBackToList}
                  isMobile={isMobile}
                  theme={theme}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showUserProfile && partnerProfile && (
                <UserProfile 
                  user={partnerProfile}
                  isFollowing={isFollowingUser}
                  onToggleFollow={handleToggleFollow}
                  onClose={() => setShowUserProfile(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
        
        <TabsContent value="groups" className="flex-1 flex overflow-hidden mt-2">
          <div className="flex h-full w-full">
            <AnimatePresence initial={false}>
              {(!isMobile || !selectedGroupId) && (
                <GroupChatList
                  onSelectGroup={handleSelectGroup}
                  selectedGroupId={selectedGroupId || undefined}
                  isMobile={isMobile}
                />
              )}
            </AnimatePresence>
            
            <AnimatePresence initial={false}>
              {(!isMobile || selectedGroupId) && selectedGroupId && (
                <GroupChatView
                  groupId={selectedGroupId}
                />
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
