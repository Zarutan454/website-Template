
import React from 'react';
import { DeploymentStage, DeploymentStageType } from './types';
import { CheckCircle, XCircle, Loader2, Clock, Shield } from 'lucide-react';
import ExplorerLink from '@/components/blockchain/ExplorerLink';
import DeploymentProgressBar from './DeploymentProgressBar';

interface DeploymentProgressProps {
  status: DeploymentStage;
  network: string;
}

const DeploymentProgress: React.FC<DeploymentProgressProps> = ({ status, network }) => {
  // Rendering der verschiedenen Deploymentstatus
  const renderStatusIcon = () => {
    switch (status.stage) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'preparing':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'verifying':
        return <Shield className="h-6 w-6 text-purple-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status.stage) {
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'failed': return 'text-red-700 bg-red-50 border-red-200';
      case 'verifying': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`p-4 rounded-lg border ${getStatusColor()} flex items-start gap-3`}>
        <div className="mt-1">
          {renderStatusIcon()}
        </div>
        <div>
          <h3 className="font-medium text-lg">
            {status.stage === 'completed' && 'Deployment erfolgreich'}
            {status.stage === 'failed' && 'Deployment fehlgeschlagen'}
            {status.stage === 'preparing' && 'Vorbereitung...'}
            {status.stage === 'deploying' && 'Token wird deployed...'}
            {status.stage === 'confirming' && 'Warte auf Bestätigung...'}
            {status.stage === 'verifying' && 'Contract wird verifiziert...'}
          </h3>
          <p className="mt-1">
            {status.message || 'Aktualisiere Status...'}
          </p>
          
          {status.error && (
            <p className="mt-2 text-red-600 text-sm">
              Fehler: {status.error}
            </p>
          )}
          
          {status.txHash && (
            <div className="mt-3">
              <ExplorerLink 
                network={network} 
                value={status.txHash} 
                type="transaction" 
                label="Transaktion auf Blockchain-Explorer anzeigen"
                variant="button"
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      {status.stage !== 'not-started' && (
        <DeploymentProgressBar status={status} network={network} />
      )}
    </div>
  );
};

export default DeploymentProgress;
