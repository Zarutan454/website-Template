
import React from 'react';
import { DeploymentStage, DeploymentStageType } from './types';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { getExplorerUrl } from '@/utils/blockchain';
import { Button } from '@/components/ui/button';

interface DeploymentProgressBarProps {
  status: DeploymentStage;
  network: string;
}

const DeploymentProgressBar: React.FC<DeploymentProgressBarProps> = ({ status, network }) => {
  const stages: DeploymentStageType[] = ['preparing', 'deploying', 'confirming', 'verifying', 'completed'];
  
  // Determine current stage index
  const currentStageIndex = stages.indexOf(status.stage as DeploymentStageType);
  
  // Function to get the explorer URL based on network and hash
  const getExplorerLink = () => {
    if (!status.txHash) return null;
    return getExplorerUrl(network, status.txHash, 'transaction');
  };
  
  const explorerUrl = getExplorerLink();
  
  return (
    <div className="space-y-4">
      {/* Status message */}
      <div className="flex items-center gap-2">
        {status.stage === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : status.stage === 'failed' ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        )}
        <span className="font-medium">
          {status.message || 'Deploying token...'}
        </span>
      </div>
      
      {/* Progress bar */}
      {status.stage !== 'failed' && status.stage !== 'not-started' && (
        <div className="space-y-2">
          <div className="flex justify-between mb-1 text-xs text-gray-500">
            <span>Vorbereitung</span>
            <span>Deployment</span>
            <span>Bestätigung</span>
            <span>Verifizierung</span>
            <span>Abgeschlossen</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${status.stage === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ 
                width: status.stage === 'completed' 
                  ? '100%' 
                  : `${Math.max(5, Math.min(95, ((currentStageIndex + 1) / stages.length) * 100))}%` 
              }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {status.stage === 'failed' && status.error && (
        <div className="bg-red-50 text-red-800 rounded-md p-3 flex items-start gap-2 mt-2 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>{status.error}</div>
        </div>
      )}
      
      {/* Transaction hash */}
      {status.txHash && (
        <div className="text-sm mt-4">
          <p className="text-gray-500 mb-1">Transaction Hash:</p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 p-1 rounded text-xs break-all">
              {status.txHash}
            </code>
            {explorerUrl && (
              <Button variant="outline" size="sm" onClick={() => window.open(explorerUrl, '_blank')} className="h-7 px-2">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Explorer
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentProgressBar;
