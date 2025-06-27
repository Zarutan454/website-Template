import React, { useState } from 'react';
import { useDjangoWebSocket } from '@/hooks/realtime/useDjangoWebSocket';
import { useDjangoLiveChat } from '@/hooks/realtime/useDjangoLiveChat';
import { useDjangoLiveFeed } from '@/hooks/realtime/useDjangoLiveFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wifi, 
  WifiOff, 
  MessageCircle, 
  Heart, 
  Share2, 
  Send,
  Users,
  Activity,
  RefreshCw,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Beispiel-Komponente für die Verwendung des Django Real-time Systems
 * 
 * ALT (Supabase):
 * const channel = supabase.channel('notifications').on('postgres_changes', callback);
 * 
 * NEU (Django):
 * const { isConnected, subscribe, sendMessage } = useDjangoWebSocket();
 */
const DjangoRealTimeExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'websocket' | 'chat' | 'feed'>('websocket');
  const [message, setMessage] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');

  // WebSocket Hook
  const {
    isConnected,
    isConnecting,
    error: wsError,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    subscribedRooms,
    subscribedUsers
  } = useDjangoWebSocket({ autoConnect: true });

  // Live Chat Hook
  const {
    messages,
    conversations,
    sendMessage: sendChatMessage,
    joinConversation,
    leaveConversation,
    createConversation,
    isConnected: chatConnected
  } = useDjangoLiveChat({ 
    conversationId: selectedConversation,
    autoJoin: true 
  });

  // Live Feed Hook
  const {
    posts,
    handleLike,
    handleComment,
    handleShare,
    createPost,
    isConnected: feedConnected,
    lastUpdate
  } = useDjangoLiveFeed({ 
    feedType: 'latest',
    autoSubscribe: true,
    enableNotifications: true 
  });

  // Subscribe to notifications
  React.useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('notification', (event) => {
      console.log('Real-time notification:', event);
      toast.info(`Neue Benachrichtigung: ${event.data.content}`);
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    await sendMessage({
      type: 'test_message',
      data: { content: message, timestamp: new Date().toISOString() }
    });

    setMessage('');
  };

  const handleSendChatMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    await sendChatMessage(message);
    setMessage('');
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    await createPost(postContent);
    setPostContent('');
  };

  const handleCreateConversation = async () => {
    const participants = ['user1', 'user2']; // Example user IDs
    await createConversation(participants, 'Neue Konversation', false);
  };

  const handleJoinRoom = async (room: string) => {
    await sendMessage({
      type: 'join_room',
      data: { room }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Real-time System</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Verbunden
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Getrennt
              </>
            )}
          </Badge>
          <Button
            onClick={isConnected ? disconnect : connect}
            variant="outline"
            size="sm"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isConnected ? (
              'Trennen'
            ) : (
              'Verbinden'
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {wsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">WebSocket Fehler: {wsError}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'websocket' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('websocket')}
        >
          WebSocket
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('chat')}
        >
          Live Chat
        </Button>
        <Button
          variant={activeTab === 'feed' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('feed')}
        >
          Live Feed
        </Button>
      </div>

      {/* WebSocket Tab */}
      {activeTab === 'websocket' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verbindungsstatus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>WebSocket:</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? 'Verbunden' : 'Getrennt'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Chat:</span>
                <Badge variant={chatConnected ? "default" : "destructive"}>
                  {chatConnected ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Feed:</span>
                <Badge variant={feedConnected ? "default" : "destructive"}>
                  {feedConnected ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              {lastUpdate && (
                <div className="text-sm text-gray-600">
                  Letzte Aktualisierung: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Abonnements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Aktive Räume:</h4>
                <div className="space-y-1">
                  {subscribedRooms.length > 0 ? (
                    subscribedRooms.map(room => (
                      <Badge key={room} variant="outline" className="mr-1">
                        {room}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Keine aktiven Räume</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Abonnierte Benutzer:</h4>
                <div className="space-y-1">
                  {subscribedUsers.length > 0 ? (
                    subscribedUsers.map(userId => (
                      <Badge key={userId} variant="outline" className="mr-1">
                        {userId}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Keine abonnierten Benutzer</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Message */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Test Nachricht senden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nachricht eingeben..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!isConnected}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Konversationen</span>
                <Button onClick={handleCreateConversation} size="sm">
                  <Users className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.id 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {conv.name || `Konversation ${conv.id.slice(0, 8)}`}
                      </span>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Nachrichten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {messages.map(msg => (
                      <div key={msg.id} className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {msg.sender_username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{msg.sender_username}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nachricht eingeben..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    />
                    <Button onClick={handleSendChatMessage} disabled={!chatConnected}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Wähle eine Konversation aus
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle>Neuer Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Was denkst du?"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleCreatePost} disabled={!feedConnected}>
                    Post erstellen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Live Feed</h2>
            {posts.map(post => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {post.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{post.display_name}</span>
                        <span className="text-sm text-gray-500">@{post.username}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mb-3">{post.content}</p>
                      
                      {/* Post Actions */}
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={post.is_liked ? 'text-red-500' : ''}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                          {post.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments_count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post.id)}
                          className={post.is_shared ? 'text-blue-500' : ''}
                        >
                          <Share2 className={`w-4 h-4 mr-1 ${post.is_shared ? 'fill-current' : ''}`} />
                          {post.shares_count}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Noch keine Posts vorhanden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DjangoRealTimeExample; 
