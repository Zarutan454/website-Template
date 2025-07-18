import React, { useState, useEffect, useCallback } from 'react';
import { useMessaging } from '../../hooks/useMessaging';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  MessageSquare, 
  Users, 
  Search, 
  BarChart3, 
  Plus, 
  Settings, 
  Crown, 
  Shield,
  UserPlus,
  UserMinus,
  MoreVertical,
  Send,
  Mic,
  Paperclip,
  Smile
} from 'lucide-react';

interface GroupInfo {
  conversation_id: number;
  name: string;
  description: string;
  conversation_type: string;
  is_private: boolean;
  created_by: {
    id: number;
    username: string;
  };
  participants: Array<{
    user_id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    role: string;
    joined_at: string;
    is_online: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

interface MessageAnalytics {
  conversation_id: number;
  period_days: number;
  total_messages: number;
  messages_by_type: Array<{ message_type: string; count: number }>;
  messages_by_sender: Array<{ sender__username: string; count: number }>;
  daily_messages: Array<{ day: string; count: number }>;
  average_response_time_seconds: number;
  most_active_sender: { sender__username: string; count: number } | null;
  most_common_message_type: { message_type: string; count: number } | null;
}

export const AdvancedMessagingDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    getConversations,
    getMessages,
    sendMessage,
    createGroupConversation,
    addGroupParticipant,
    removeGroupParticipant,
    promoteGroupParticipant,
    getGroupInfo,
    searchMessages,
    getMessageAnalytics,
    getConversationStats,
    connectWebSocket,
    disconnectWebSocket,
  } = useMessaging();

  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [analytics, setAnalytics] = useState<MessageAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    participantIds: [] as number[],
  });

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user, getConversations]);

  // Load group info when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadGroupInfo(selectedConversation);
      loadAnalytics(selectedConversation);
    }
  }, [selectedConversation]);

  const loadGroupInfo = useCallback(async (conversationId: number) => {
    try {
      const info = await getGroupInfo(conversationId);
      setGroupInfo(info);
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  }, [getGroupInfo]);

  const loadAnalytics = useCallback(async (conversationId: number) => {
    try {
      const analyticsData = await getMessageAnalytics(conversationId, 30);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [getMessageAnalytics]);

  const handleCreateGroup = useCallback(async () => {
    try {
      await createGroupConversation(
        newGroupData.name,
        newGroupData.participantIds,
        newGroupData.description,
        newGroupData.isPrivate
      );
      setShowCreateGroup(false);
      setNewGroupData({ name: '', description: '', isPrivate: false, participantIds: [] });
      getConversations(); // Refresh conversations
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }, [createGroupConversation, newGroupData, getConversations]);

  const handleSearch = useCallback(async () => {
    if (!selectedConversation || !searchQuery.trim()) return;

    try {
      const results = await searchMessages(selectedConversation, searchQuery);
      setSearchResults(results.messages || []);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  }, [searchMessages, selectedConversation, searchQuery]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      await sendMessage(selectedConversation, content);
      // Refresh messages
      getMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [sendMessage, selectedConversation, getMessages]);

  const handleParticipantAction = useCallback(async (
    action: 'add' | 'remove' | 'promote',
    participantId: number,
    newRole?: 'moderator' | 'admin'
  ) => {
    if (!selectedConversation) return;

    try {
      switch (action) {
        case 'add':
          await addGroupParticipant(selectedConversation, participantId);
          break;
        case 'remove':
          await removeGroupParticipant(selectedConversation, participantId);
          break;
        case 'promote':
          if (newRole) {
            await promoteGroupParticipant(selectedConversation, participantId, newRole);
          }
          break;
      }
      // Refresh group info
      loadGroupInfo(selectedConversation);
    } catch (error) {
      console.error(`Error ${action}ing participant:`, error);
    }
  }, [selectedConversation, addGroupParticipant, removeGroupParticipant, promoteGroupParticipant, loadGroupInfo]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'moderator':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Messaging</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations">Chats</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Conversations</h3>
                <Button size="sm" onClick={() => setShowCreateGroup(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="h-96">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.avatar_url} />
                        <AvatarFallback>
                          {conversation.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Group Management</h3>
                <Button size="sm" onClick={() => setShowCreateGroup(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {groupInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{groupInfo.name}</span>
                      {groupInfo.is_private && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {groupInfo.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Participants ({groupInfo.participants.length})</h4>
                      {groupInfo.participants.map((participant) => (
                        <div key={participant.user_id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={participant.avatar_url} />
                              <AvatarFallback>
                                {participant.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{participant.display_name}</p>
                              <div className="flex items-center space-x-1">
                                <Badge className={getRoleBadgeColor(participant.role)}>
                                  {participant.role}
                                </Badge>
                                {participant.is_online && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {participant.role === 'member' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleParticipantAction('promote', participant.user_id, 'moderator')}
                                >
                                  <Crown className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleParticipantAction('remove', participant.user_id)}
                                >
                                  <UserMinus className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Message Analytics</h3>

              {analytics && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Messages</p>
                          <p className="text-2xl font-bold">{analytics.total_messages}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                          <p className="text-2xl font-bold">
                            {Math.round(analytics.average_response_time_seconds)}s
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Message Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.messages_by_type.map((type) => (
                          <div key={type.message_type} className="flex justify-between">
                            <span className="capitalize">{type.message_type}</span>
                            <span className="font-medium">{type.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.messages_by_sender.slice(0, 5).map((sender) => (
                          <div key={sender.sender__username} className="flex justify-between">
                            <span>{sender.sender__username}</span>
                            <span className="font-medium">{sender.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={groupInfo?.participants[0]?.avatar_url} />
                    <AvatarFallback>
                      {groupInfo?.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{groupInfo?.name || 'Conversation'}</h3>
                    <p className="text-sm text-gray-500">
                      {groupInfo?.participants.length || 0} participants
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <ScrollArea className="h-full">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${
                      message.is_own_message ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.is_own_message
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={message.sender.avatar_url} />
                          <AvatarFallback>
                            {message.sender.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs opacity-75">
                          {message.sender.display_name}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Smile className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogTitle>Create New Group</DialogTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                value={newGroupData.description}
                onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter group description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="private-group"
                checked={newGroupData.isPrivate}
                onCheckedChange={(checked) => setNewGroupData(prev => ({ ...prev, isPrivate: checked }))}
              />
              <Label htmlFor="private-group">Private Group</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 