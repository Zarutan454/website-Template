import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2, Zap } from 'lucide-react';
import { useMining } from '@/hooks/useMining';
import { Button } from '@/components/ui/button';

export const MiningActivityWidget: React.FC = () => {
  const { miningStats, recentActivities, isLoading, isMining, startMining, stopMining } = useMining();

  const handleMiningToggle = () => {
    if (isMining) {
      stopMining();
    } else {
      startMining();
    }
  };

  const getActivityLabel = (type: string): string => {
    switch (type) {
      case 'post': return 'Beitrag erstellt';
      case 'comment': return 'Kommentar verfasst';
      case 'like': return 'Beitrag geliked';
      case 'share': return 'Beitrag geteilt';
      case 'login': return 'Täglicher Login';
      case 'invite': return 'Freund eingeladen';
      case 'mining': return 'Mining-Aktivität';
      case 'mining_start': return 'Mining gestartet';
      case 'airdrop': return 'Airdrop erhalten';
      case 'trending': return 'Trending Beitrag';
      case 'boost': return 'Beitrag geboostet';
      case 'gift': return 'Geschenk erhalten';
      case 'plus': return 'Plus-Aktivität';
      default: return type;
    }
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'post': return <span>📝</span>;
      case 'comment': return <span>💬</span>;
      case 'like': return <span>👍</span>;
      case 'login': return <span>🔑</span>;
      case 'share': return <span>🔗</span>;
      case 'invite': return <span>👥</span>;
      case 'mining': 
      case 'mining_start': return <span>⛏️</span>;
      case 'airdrop': return <span>🪂</span>;
      case 'trending': return <span>📈</span>;
      case 'boost': return <span>🚀</span>;
      case 'gift': return <span>🎁</span>;
      case 'plus': return <span>➕</span>;
      default: return <span>🔔</span>;
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Vor weniger als einer Stunde';
    } else if (diffHours < 24) {
      return `Vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `Vor ${days} Tag${days > 1 ? 'en' : ''}`;
    }
  };

  return (
    <Card className="bg-dark-100 border-gray-800 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary-400" />
            Mining-Aktivitäten
          </CardTitle>
          <Button 
            size="sm"
            variant={isMining ? "destructive" : "default"}
            className="flex items-center gap-1"
            onClick={handleMiningToggle}
          >
            <Zap className="h-4 w-4" />
            {isMining ? "Stoppen" : "Starten"}
          </Button>
        </div>
        <CardDescription>Die letzten Aktivitäten, mit denen du Token verdient hast</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 mr-3">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{getActivityLabel(activity.activity_type)}</div>
                    <div className="text-xs text-gray-400">{formatTime(new Date(activity.created_at))}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-400">+{activity.tokens_earned} BSN</div>
                  <div className="text-xs text-gray-400">{activity.points} Punkte</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">Noch keine Mining-Aktivitäten</p>
            <p className="text-sm text-gray-500 mt-2">Starte das Mining, um BSN Token zu verdienen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
