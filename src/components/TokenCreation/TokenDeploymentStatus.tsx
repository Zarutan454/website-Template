
import React from 'react';
import { DeploymentStage } from './types';
import DeploymentProgress from './DeploymentProgress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface TokenDeploymentStatusProps {
  deploymentStatus: DeploymentStage;
  network: string;
  onReset?: () => void;
}

const TokenDeploymentStatus: React.FC<TokenDeploymentStatusProps> = ({
  deploymentStatus,
  network,
  onReset
}) => {
  // Error state
  if (deploymentStatus.stage === 'failed') {
    return (
      <div className="space-y-6">
        <DeploymentProgress status={deploymentStatus} network={network} />
        
        <div className="flex justify-between mt-8">
          {onReset && (
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Anfang
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Seite neu laden
          </Button>
        </div>
      </div>
    );
  }
  
  // Success state
  if (deploymentStatus.stage === 'completed') {
    return (
      <div className="space-y-6">
        <DeploymentProgress status={deploymentStatus} network={network} />
        
        {onReset && (
          <div className="flex justify-end mt-8">
            <Button 
              onClick={onReset}
              className="flex items-center gap-2"
            >
              Weiteren Token erstellen
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // In progress state
  return (
    <div className="space-y-6">
      <DeploymentProgress status={deploymentStatus} network={network} />
      
      <div className="flex items-center justify-center mt-8">
        <p className="text-sm text-muted-foreground">
          Der Token wird gerade deployed. Bitte warten Sie, bis der Vorgang abgeschlossen ist.
        </p>
      </div>
    </div>
  );
};

export default TokenDeploymentStatus;
