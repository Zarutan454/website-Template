import * as React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useFeedWebSocket } from '../../hooks/useWebSocket';
import { usePresence } from '../../hooks/usePresence';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const WebSocketStatus: React.FC = () => {
  const chatWs = useWebSocket();
  const feedWs = useFeedWebSocket();
  const presenceWs = usePresence();

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">WebSocket Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Chat WebSocket:</span>
          <Badge variant={chatWs.isConnected ? "default" : "destructive"}>
            {chatWs.isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Feed WebSocket:</span>
          <Badge variant={feedWs.isConnected ? "default" : "destructive"}>
            {feedWs.isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Presence WebSocket:</span>
          <Badge variant={presenceWs.isConnected ? "default" : "destructive"}>
            {presenceWs.isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        {(chatWs.lastError || feedWs.lastError || presenceWs.lastError) && (
          <div className="text-xs text-red-400 mt-2">
            {chatWs.lastError && <div>Chat: {chatWs.lastError}</div>}
            {feedWs.lastError && <div>Feed: {feedWs.lastError}</div>}
            {presenceWs.lastError && <div>Presence: {presenceWs.lastError}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 