import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  lastError?: string | null;
  onReconnect?: () => void;
  className?: string;
  showReconnectButton?: boolean;
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({
  isConnected,
  isConnecting,
  lastError,
  onReconnect,
  className,
  showReconnectButton = true
}) => {
  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    if (lastError) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Verbinde...';
    if (isConnected) return 'Verbunden';
    if (lastError) return 'Fehler';
    return 'Getrennt';
  };

  const getStatusIcon = () => {
    if (isConnecting) return <RefreshCw className="w-3 h-3 animate-spin" />;
    if (isConnected) return <CheckCircle className="w-3 h-3" />;
    if (lastError) return <AlertCircle className="w-3 h-3" />;
    return <WifiOff className="w-3 h-3" />;
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center space-x-1",
          isConnected && "border-green-500 text-green-700",
          isConnecting && "border-yellow-500 text-yellow-700",
          lastError && "border-red-500 text-red-700"
        )}
      >
        <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Badge>
      
      {showReconnectButton && !isConnected && !isConnecting && onReconnect && (
        <Button
          onClick={onReconnect}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Verbinden
        </Button>
      )}
      
      {lastError && (
        <span className="text-xs text-red-600 max-w-xs truncate">
          {lastError}
        </span>
      )}
    </div>
  );
};

export default RealTimeStatus; 