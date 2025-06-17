
import React from 'react';
import { Bell, RefreshCw, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NotificationType } from '@/types/notifications';
import { Spinner } from '@/components/ui/spinner';
import { NotificationIcon } from './NotificationIcon';

interface EmptyStateProps {
  isCreatingTest: boolean;
  testType: NotificationType;
  onCreateTest: () => Promise<void>;
  onRotateTestType: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isCreatingTest,
  testType,
  onCreateTest,
  onRotateTestType,
  onRefresh,
  isLoading
}) => {
  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center">
      <div className="relative mb-4">
        <Bell className="h-16 w-16 text-muted-foreground opacity-20" />
        <div className="absolute -top-2 -right-2 p-2 rounded-full bg-background">
          <NotificationIcon type={testType} size={24} />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Keine Benachrichtigungen</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Es sind noch keine Benachrichtigungen vorhanden. Benachrichtigungen werden erscheinen, wenn jemand mit deinen Beiträgen interagiert oder dir folgt.
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Aktualisieren
        </Button>
        
        <Button 
          variant="default" 
          onClick={onCreateTest}
          disabled={isCreatingTest}
          className="flex items-center gap-2"
        >
          {isCreatingTest ? (
            <Spinner size="sm" />
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              <span>Test-Benachrichtigung ({testType})</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          onClick={onRotateTestType}
          disabled={isCreatingTest}
        >
          Typ wechseln
        </Button>
      </div>
    </Card>
  );
};
