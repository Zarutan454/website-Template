
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface FeedRefreshBarProps {
  lastRefreshed: Date;
  hasNewData: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

/**
 * Komponente zur Anzeige der Aktualisierungszeit und Steuerung der Feed-Aktualisierung
 */
const FeedRefreshBar: React.FC<FeedRefreshBarProps> = ({
  lastRefreshed,
  hasNewData,
  isRefreshing,
  onRefresh
}) => {
  // Formatierung der Zeit seit der letzten Aktualisierung
  const timeAgo = formatDistanceToNow(lastRefreshed, { 
    addSuffix: true,
    locale: de  // Deutsche Lokalisierung
  });
  
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-md text-sm">
      <div className="text-muted-foreground">
        Letzte Aktualisierung: {timeAgo}
      </div>
      
      <div className="flex items-center space-x-2">
        {hasNewData && (
          <span className="text-primary animate-pulse">
            Neue Beiträge verfügbar
          </span>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Feed aktualisieren"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default FeedRefreshBar;
