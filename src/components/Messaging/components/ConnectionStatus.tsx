import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  isConnecting 
}) => {
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <Wifi className="h-4 w-4 animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>Disconnected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600 text-sm">
      <Wifi className="h-4 w-4" />
      <span>Connected</span>
    </div>
  );
}; 