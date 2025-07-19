import * as React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useFeedWebSocket } from '../../hooks/useWebSocket';
import { usePresence } from '../../hooks/usePresence';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export const WebSocketStatus: React.FC = () => {
  const chatWs = useWebSocket();
  const feedWs = useFeedWebSocket();
  const presenceWs = usePresence();
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  // Update timestamp every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />;
  };

  const getStatusColor = (isConnected: boolean, hasError: boolean) => {
    if (hasError) return "destructive";
    return isConnected ? "default" : "secondary";
  };

  const getStatusText = (isConnected: boolean, error: string | null) => {
    if (error) return `Error: ${error}`;
    return isConnected ? "Connected" : "Disconnected";
  };

  const handleRefresh = () => {
    // Force reconnection by calling disconnect and then letting the hooks reconnect
    chatWs.disconnect();
    feedWs.disconnect();
    presenceWs.disconnect();
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Wifi className="w-4 h-4 mr-2" />
        Show WS Status
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 w-96 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            WebSocket Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Chat WebSocket */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Chat WebSocket:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(chatWs.isConnected)}
            <Badge variant={getStatusColor(chatWs.isConnected, !!chatWs.lastError)}>
              {getStatusText(chatWs.isConnected, chatWs.lastError)}
            </Badge>
          </div>
        </div>
        
        {/* Feed WebSocket */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Feed WebSocket:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(feedWs.isConnected)}
            <Badge variant={getStatusColor(feedWs.isConnected, !!feedWs.lastError)}>
              {getStatusText(feedWs.isConnected, feedWs.lastError)}
            </Badge>
          </div>
        </div>
        
        {/* Presence WebSocket */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Presence WebSocket:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(presenceWs.isConnected)}
            <Badge variant={getStatusColor(presenceWs.isConnected, !!presenceWs.lastError)}>
              {getStatusText(presenceWs.isConnected, presenceWs.lastError)}
            </Badge>
          </div>
        </div>
        
        {/* Connection Summary */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span>Connected:</span>
            <span className="font-mono">
              {[chatWs.isConnected, feedWs.isConnected, presenceWs.isConnected].filter(Boolean).length}/3
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Last Update:</span>
            <span className="font-mono">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        {/* Error Details */}
        {(chatWs.lastError || feedWs.lastError || presenceWs.lastError) && (
          <div className="pt-2 border-t border-border">
            <div className="text-xs font-medium text-destructive mb-1">Errors:</div>
            <div className="space-y-1 text-xs text-destructive">
              {chatWs.lastError && (
                <div className="bg-destructive/10 p-1 rounded">
                  <span className="font-medium">Chat:</span> {chatWs.lastError}
                </div>
              )}
              {feedWs.lastError && (
                <div className="bg-destructive/10 p-1 rounded">
                  <span className="font-medium">Feed:</span> {feedWs.lastError}
                </div>
              )}
              {presenceWs.lastError && (
                <div className="bg-destructive/10 p-1 rounded">
                  <span className="font-medium">Presence:</span> {presenceWs.lastError}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 