import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, MoreHorizontal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/utils/dateUtils';
import { MiningActivity } from '@/hooks/mining/types';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';

export interface MiningHistoryProps {
  activities?: MiningActivity[];
  isLoading?: boolean;
}

const MiningHistory: React.FC<MiningHistoryProps> = ({ activities, isLoading = false }) => {
  const historyEntries = activities || [];

  const getEventName = (type: string): string => {
    switch (type) {
      case 'mining_start': return 'Mining gestartet';
      case 'mining_stop': return 'Mining gestoppt';
      case 'token_reward': return 'Token Belohnung';
      case 'post': return 'Beitrag erstellt';
      case 'comment': return 'Kommentar geschrieben';
      case 'like': return 'Beitrag geliked';
      case 'share': return 'Beitrag geteilt';
      case 'invite': return 'Freund eingeladen';
      case 'nft_like': return 'NFT geliked';
      case 'heartbeat': return 'Mining aktiv';
      case 'login': return 'Angemeldet';
      default: return type;
    }
  };

  const getEventStatus = (type: string): 'success' | 'neutral' | 'warning' => {
    switch (type) {
      case 'mining_start': return 'success';
      case 'mining_stop': return 'neutral';
      case 'token_reward': return 'success';
      default: return 'neutral';
    }
  };

  return (
    <Card className="bg-dark-100 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <History className="h-4 w-4 mr-2 text-primary" />
          Mining Verlauf
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner size="md" text="Verlauf wird geladen..." />
          </div>
        ) : historyEntries.length === 0 ? (
          <EmptyState
            title="Keine Mining-Aktivitäten"
            description="Dein Mining-Verlauf wird hier angezeigt, sobald du mit dem Mining beginnst."
            icon={<History className="h-10 w-10" />}
            className="bg-transparent border-gray-800"
          />
        ) : (
          <div className="space-y-3">
            {historyEntries.map(entry => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between text-sm py-2 px-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/10 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{getEventName(entry.activity_type)}</div>
                    <div className="text-xs text-muted-foreground">{formatTimeAgo(entry.created_at)}</div>
                  </div>
                </div>
                {entry.tokens_earned > 0 ? (
                  <StatusBadge 
                    status="success" 
                    text={`+${entry.tokens_earned} BSN`}
                  />
                ) : entry.points > 0 && (
                  <StatusBadge 
                    status="info" 
                    text={`+${entry.points}% Speed`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiningHistory;
