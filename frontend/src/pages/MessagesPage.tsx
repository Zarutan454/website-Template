import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useTypingIndicator,
  useReadReceipts,
  useReactions,
  Conversation,
  Message
} from '../hooks/useMessaging';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { 
  Send, 
  Mic, 
  MicOff, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Hooks
  const { conversations, loading: conversationsLoading, updateConversationLastMessage, markConversationAsRead } = useConversations();
  const { messages, loading: messagesLoading, addMessage, updateMessageReaction, markMessageAsRead, hasMore, loadMore } = useMessages(selectedConversation?.id || null);
  const { sendMessage, sending } = useSendMessage();
  const { typingUsers, handleTyping } = useTypingIndicator(selectedConversation?.id || null);
  const { markAsRead } = useReadReceipts(selectedConversation?.id || null);
  const { addReaction, removeReaction } = useReactions();

  // WebSocket integration
  const { isConnected } = useWebSocket(
    // onMessageReceived
    (message) => {
      if (message && selectedConversation?.id === message.conversation_id) {
        addMessage(message);
        markAsRead(message.id);
      }
      // Update conversation list
      updateConversationLastMessage(message.conversation_id, message);
    },
    // onTypingIndicator
    (data) => {
      // Typing indicator is handled by useTypingIndicator hook
    },
    // onReadReceipt
    (data) => {
      if (data.conversationId === selectedConversation?.id) {
        markMessageAsRead(data.messageId);
      }
    },
    // onReactionUpdate
    (data) => {
      updateMessageReaction(data.messageId, data.reactionType, data.action, data.userId, data.userName);
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation, markConversationAsRead]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTyping(user?.id || 0);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim() || sending) return;

    const message = await sendMessage(selectedConversation.id, messageInput.trim());
    if (message) {
      setMessageInput('');
      addMessage(message);
      markAsRead(message.id);
    }
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Here you would typically upload the audio file to your server
        // For now, we'll just send it as a voice message
        if (selectedConversation) {
          const message = await sendMessage(selectedConversation.id, 'Voice message', 'voice', audioUrl);
          if (message) {
            addMessage(message);
            markAsRead(message.id);
          }
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to start recording');
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle reaction
  const handleReaction = (messageId: number, reactionType: string) => {
    const message = messages.find(m => m.id === messageId);
    const hasReaction = message?.reactions.some(r => r.user_id === user?.id && r.reaction_type === reactionType);
    
    if (hasReaction) {
      removeReaction(messageId, reactionType);
    } else {
      addReaction(messageId, reactionType);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-80 border-r bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-8" />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          {conversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-accent ${
                  selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={conversation.participants[0]?.user_avatar} />
                    <AvatarFallback>
                      {conversation.participants[0]?.user_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conversation.participants.map(p => p.user_name).join(', ')}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {conversation.last_message 
                        ? formatDistanceToNow(new Date(conversation.last_message.timestamp), { addSuffix: true })
                        : formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.participants[0]?.user_avatar} />
                    <AvatarFallback>
                      {selectedConversation.participants[0]?.user_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.participants.map(p => p.user_name).join(', ')}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {isConnected && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {typingUsers[selectedConversation.participants[0]?.user_id || 0] && (
                        <span className="text-blue-500">typing...</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : (
                <div className="space-y-4">
                  {hasMore && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadMore}
                      className="w-full"
                    >
                      Load more messages
                    </Button>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${message.sender_id === user.id ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg p-3 ${
                          message.sender_id === user.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {message.message_type === 'voice' ? (
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Mic className="h-4 w-4" />
                              </Button>
                              <span className="text-sm">Voice message</span>
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                        
                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reactions.map((reaction, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {reaction.reaction_type} {reaction.user_name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                          </p>
                          {message.is_read && (
                            <span className="text-xs text-muted-foreground">✓</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Reaction buttons */}
                      <div className={`flex items-center space-x-1 ${message.sender_id === user.id ? 'order-1' : 'order-2'}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(message.id, '👍')}
                          className="h-6 w-6 p-0"
                        >
                          👍
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(message.id, '❤️')}
                          className="h-6 w-6 p-0"
                        >
                          ❤️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(message.id, '😂')}
                          className="h-6 w-6 p-0"
                        >
                          😂
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`h-6 w-6 p-0 ${isRecording ? 'text-red-500' : ''}`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageInput.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 