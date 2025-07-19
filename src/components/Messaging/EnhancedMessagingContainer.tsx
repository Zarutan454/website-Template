import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Mic, Paperclip, Smile, Lock, Unlock, Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useMessaging, Message, Conversation } from '../../hooks/useMessaging';
import { VoiceMessageRecorder } from './VoiceMessageRecorder';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

interface EnhancedMessagingContainerProps {
  conversationId?: number;
  onConversationSelect?: (conversation: Conversation) => void;
}

export const EnhancedMessagingContainer: React.FC<EnhancedMessagingContainerProps> = ({
  conversationId,
  onConversationSelect,
}) => {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isTyping,
    typingUsers,
    hasMoreMessages,
    error,
    getConversations,
    getMessages,
    sendMessage,
    sendVoiceMessage,
    markMessagesRead,
    startTyping,
    stopTyping,
    selectConversation,
    addReaction,
    removeReaction,
  } = useMessaging();

  const [messageText, setMessageText] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    getConversations();
  }, [getConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      getMessages(currentConversation.id);
      markMessagesRead(currentConversation.id);
    }
  }, [currentConversation, getMessages, markMessagesRead]);

  // Handle typing
  useEffect(() => {
    if (!currentConversation) return;

    const typingTimer = setTimeout(() => {
      stopTyping(currentConversation.id);
    }, 3000);

    return () => clearTimeout(typingTimer);
  }, [messageText, currentConversation, stopTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !currentConversation) return;

    try {
      await sendMessage(
        currentConversation.id,
        messageText.trim(),
        'text',
        undefined,
        undefined,
        undefined,
        encryptionEnabled
      );
      setMessageText('');
      stopTyping(currentConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [messageText, currentConversation, sendMessage, encryptionEnabled, stopTyping]);

  const handleVoiceMessageComplete = useCallback(async (
    audioBlob: Blob,
    duration: number,
    waveform: number[]
  ) => {
    if (!currentConversation) return;

    try {
      // Convert blob to file
      const voiceFile = new File([audioBlob], 'voice-message.wav', {
        type: 'audio/wav',
      });

      await sendVoiceMessage(currentConversation.id, voiceFile, duration, waveform);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  }, [currentConversation, sendVoiceMessage]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentConversation) return;

    try {
      // Determine message type based on file
      let messageType = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'audio';

      // Upload file and get URL (implement file upload logic)
      const mediaUrl = await uploadFile(file);

      await sendMessage(
        currentConversation.id,
        file.name,
        messageType,
        mediaUrl,
        undefined,
        undefined,
        encryptionEnabled
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [currentConversation, sendMessage, encryptionEnabled]);

  const uploadFile = async (file: File): Promise<string> => {
    // Implement file upload logic here
    // This is a placeholder - you'll need to implement actual file upload
    return URL.createObjectURL(file);
  };

  const handleLoadMoreMessages = useCallback(async () => {
    if (!currentConversation || isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);
    try {
      await getMessages(currentConversation.id, 50, messages.length);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentConversation, isLoadingMore, hasMoreMessages, getMessages, messages.length]);

  const handleReaction = useCallback(async (messageId: number, reactionType: string) => {
    try {
      await addReaction(messageId, reactionType);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [addReaction]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((value: string) => {
    setMessageText(value);
    if (currentConversation) {
      startTyping(currentConversation.id);
    }
  }, [currentConversation, startTyping]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentConversation) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
          <p>Choose a conversation from the list to start messaging</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <img
              src={currentConversation.participants[0]?.avatar_url || '/default-avatar.png'}
              alt={currentConversation.participants[0]?.display_name}
            />
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {currentConversation.conversation_type === 'direct'
                ? currentConversation.participants[0]?.display_name
                : currentConversation.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {currentConversation.participants.map(participant => (
                <span key={participant.id}>
                  {participant.is_online ? '🟢' : '⚪'} {participant.display_name}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEncryptionEnabled(!encryptionEnabled)}
            className={encryptionEnabled ? 'text-green-600' : 'text-gray-400'}
            aria-label={encryptionEnabled ? 'Verschlüsselung deaktivieren' : 'Verschlüsselung aktivieren'}
            title={encryptionEnabled ? 'Verschlüsselung deaktivieren' : 'Verschlüsselung aktivieren'}
          >
            {encryptionEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
          <Badge variant={encryptionEnabled ? 'default' : 'secondary'}>
            {encryptionEnabled ? 'Encrypted' : 'Plain Text'}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMore && (
          <div className="text-center text-sm text-gray-500">
            Loading more messages...
          </div>
        )}
        
        {hasMoreMessages && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMoreMessages}
            className="w-full"
          >
            Load More Messages
          </Button>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.is_own_message ? 'order-2' : 'order-1'}`}>
              {!message.is_own_message && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="w-6 h-6">
                    <img
                      src={message.sender.avatar_url || '/default-avatar.png'}
                      alt={message.sender.display_name}
                    />
                  </Avatar>
                  <span className="text-xs text-gray-500">
                    {message.sender.display_name}
                  </span>
                </div>
              )}
              
              <div
                className={`p-3 rounded-lg ${
                  message.is_own_message
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.message_type === 'voice' ? (
                  <VoiceMessagePlayer
                    audioUrl={message.media_url || ''}
                    duration={message.voice_duration || 0}
                    waveform={message.voice_waveform}
                    isOwnMessage={message.is_own_message}
                  />
                ) : (
                  <div>
                    <p className="text-sm">{message.content}</p>
                    {message.media_url && (
                      <div className="mt-2">
                        {message.message_type === 'image' && (
                          <img
                            src={message.media_url}
                            alt="Media"
                            className="max-w-full rounded"
                          />
                        )}
                        {message.message_type === 'video' && (
                          <video
                            src={message.media_url}
                            controls
                            className="max-w-full rounded"
                          />
                        )}
                        {message.message_type === 'file' && (
                          <a
                            href={message.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            📎 {message.content}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {formatTime(message.created_at)}
                  </span>
                  
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex space-x-1">
                      {message.reactions.map((reaction, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {reaction.reaction_type} {reaction.count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <div className="p-4 border-t">
          <VoiceMessageRecorder
            onRecordingComplete={handleVoiceMessageComplete}
            onCancel={() => setShowVoiceRecorder(false)}
            maxDuration={120}
          />
        </div>
      )}

      {/* Input Area */}
      {!showVoiceRecorder && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Datei anhängen"
              title="Datei anhängen"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceRecorder(true)}
              aria-label="Sprachnachricht aufnehmen"
              title="Sprachnachricht aufnehmen"
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Emoji auswählen"
              title="Emoji auswählen"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            <Input
              ref={inputRef}
              value={messageText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              size="sm"
              aria-label="Nachricht senden"
              title="Nachricht senden"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            aria-label="Datei auswählen"
            title="Datei auswählen"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}; 