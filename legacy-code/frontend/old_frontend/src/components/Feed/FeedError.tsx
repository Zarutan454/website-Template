
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FeedErrorProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

const FeedError: React.FC<FeedErrorProps> = ({
  message,
  onRetry,
  retryText = "Erneut versuchen"
}) => {
  return (
    <Card className="w-full border-amber-500/20 bg-dark-200/50">
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="p-6 rounded-full mb-4 bg-amber-500/10">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <h3 className="text-xl font-medium mb-4">
          Fehler beim Laden
        </h3>
        <p className="text-sm max-w-md mb-6 text-muted-foreground">
          {message}
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {retryText}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FeedError;
