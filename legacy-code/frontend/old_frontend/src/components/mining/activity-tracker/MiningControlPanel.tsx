
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, StopCircle, Timer, BadgeCheck } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface MiningControlPanelProps {
  isMining: boolean;
  isHealthy: boolean;
  timeElapsed: number;
  streakDays: number;
  toggleMining: () => Promise<void>;
  isTogglingMining: boolean;
}

const MiningControlPanel: React.FC<MiningControlPanelProps> = ({
  isMining,
  isHealthy,
  timeElapsed,
  streakDays,
  toggleMining,
  isTogglingMining
}) => {
  // Formatiere die verstrichene Zeit in Stunden, Minuten und Sekunden
  const formattedTime = formatDuration(timeElapsed);

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Mining-Kontrolle</span>
          <div className="flex items-center gap-2">
            {isMining && (
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-2">Status:</span>
                <span className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
              </div>
            )}
            {streakDays > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <span>{streakDays} Tage Streak</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isMining && (
            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Aktive Zeit</span>
              </div>
              <span className="font-mono text-sm">{formattedTime}</span>
            </div>
          )}

          <Button 
            onClick={toggleMining} 
            disabled={isTogglingMining}
            variant={isMining ? "destructive" : "default"}
            className="w-full"
            size="lg"
          >
            {isTogglingMining ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                {isMining ? "Stoppe Mining..." : "Starte Mining..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isMining ? (
                  <>
                    <StopCircle className="h-5 w-5" />
                    Mining stoppen
                  </>
                ) : (
                  <>
                    <Hammer className="h-5 w-5" />
                    Mining starten
                  </>
                )}
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {isMining 
              ? "Mining ist aktiv. Du erhältst BSN Token für deine Aktivitäten." 
              : "Starte Mining, um BSN Token für deine Aktivitäten zu erhalten."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningControlPanel;
