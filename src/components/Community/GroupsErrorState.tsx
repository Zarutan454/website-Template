
import React from 'react';
import { ErrorDisplay } from '@/components/common/ErrorHandler';

interface GroupsErrorStateProps {
  onRetry?: () => void;
  message?: string;
}

const GroupsErrorState: React.FC<GroupsErrorStateProps> = ({ 
  onRetry,
  message = "Es ist ein Fehler beim Laden der Gruppen aufgetreten." 
}) => {
  return (
    <ErrorDisplay 
      message={message} 
      onRetry={onRetry}
      retryText="Erneut versuchen"
    />
  );
};

export default GroupsErrorState;
