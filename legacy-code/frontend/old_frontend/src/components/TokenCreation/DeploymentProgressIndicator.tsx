
import React from 'react';
import { DeploymentStage } from './types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface DeploymentProgressIndicatorProps {
  status: DeploymentStage;
}

export const DeploymentProgressIndicator: React.FC<DeploymentProgressIndicatorProps> = ({ status }) => {
  // Status anzeigen
  const getStatusIcon = () => {
    switch (status.stage) {
      case 'completed':
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case 'failed':
        return <XCircle className="text-red-500 h-5 w-5" />;
      default:
        return <Loader2 className="text-blue-500 h-5 w-5 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status.stage) {
      case 'completed':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-blue-100 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor()}`}>
      <span className="mr-1.5">{getStatusIcon()}</span>
      <span>{status.message}</span>
    </div>
  );
};
