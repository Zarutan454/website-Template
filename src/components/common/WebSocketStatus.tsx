import * as React from 'react';
import { useFeedWebSocket } from '../../hooks/useWebSocket';
import { Badge } from '../ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface WebSocketStatusProps {
  className?: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ className = '' }) => {
  const { isConnected, isWebSocketEnabled } = useFeedWebSocket();

  const getStatusColor = () => {
    if (!isWebSocketEnabled) return 'bg-gray-500';
    if (isConnected) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (!isWebSocketEnabled) return 'Realtime deaktiviert';
    if (isConnected) return 'Realtime aktiv';
    return 'Verbinde...';
  };

  const getStatusIcon = () => {
    if (!isWebSocketEnabled) return <WifiOff className="w-4 h-4" />;
    if (isConnected) return <Wifi className="w-4 h-4" />;
    return <RefreshCw className="w-4 h-4 animate-spin" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="secondary" 
        className={`flex items-center gap-1 ${getStatusColor()} text-white`}
      >
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
    </div>
  );
}; 