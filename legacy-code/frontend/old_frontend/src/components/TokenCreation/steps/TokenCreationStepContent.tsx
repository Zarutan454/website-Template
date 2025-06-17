import React from 'react';
import { Button } from '@/components/ui/button';
import NetworkSelectionStep from './NetworkSelectionStep';
import TokenTypeSelectionStep from './TokenTypeSelectionStep';
import NameSymbolStep from './NameSymbolStep';
import SupplyDetailsStep from './SupplyDetailsStep';
import AdvancedOptionsStep from './AdvancedOptionsStep';
import ReviewStep from './ReviewStep';
import DeploymentStep from './DeploymentStep';
import SuccessStep from './SuccessStep';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight, Rocket, RotateCcw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface TokenCreationStepContentProps {
  step: number;
  onNext: () => void;
  onPrevious: () => void;
  onDeploy: () => Promise<boolean>;
  isDeploying: boolean;
  deployedContract: string | null;
  deploymentError: string | null;
  ownerAddress: string | undefined;
  onRestart: () => void;
  form?: {
    getValues: () => {
      name?: string;
      symbol?: string;
      network?: string;
      features?: {
        mintable?: boolean;
        burnable?: boolean;
      };
    };
  }; // Form prop für Form-basierte Steps
}

const TokenCreationStepContent: React.FC<TokenCreationStepContentProps> = ({
  step,
  onNext,
  onPrevious,
  onDeploy,
  isDeploying,
  deployedContract,
  deploymentError,
  ownerAddress,
  onRestart,
  form
}) => {
  // Render the appropriate step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <NetworkSelectionStep />;
      case 1:
        return <TokenTypeSelectionStep />;
      case 2:
        return <NameSymbolStep />;
      case 3:
        return <SupplyDetailsStep />;
      case 4:
        return <AdvancedOptionsStep />;
      case 5:
        return <ReviewStep />;
      case 6:
        return <DeploymentStep isDeploying={isDeploying} onDeploy={onDeploy} />;
      case 7:
        return (
          <SuccessStep
            contractAddress={deployedContract || ''}
            tokenName={form?.getValues().name || ''}
            tokenSymbol={form?.getValues().symbol || ''}
            network={form?.getValues().network || ''}
            ownerAddress={ownerAddress || ''}
            canMint={!!form?.getValues().features?.mintable}
            canBurn={!!form?.getValues().features?.burnable}
            onReset={onRestart}
          />
        );
      default:
        return null;
    }
  };

  // Zeige Fehler an, wenn vorhanden
  if (deploymentError && step === 6) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="mb-6 border-red-700 bg-red-950/30">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-red-200 font-medium">Deployment fehlgeschlagen</AlertTitle>
          <AlertDescription className="text-red-300">{deploymentError}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Neu starten
          </Button>
        </div>
      </div>
    );
  }

  // Determine if navigation buttons should be shown
  const showNavigation = step < 6 || step === 7;
  const isLastStep = step === 5;
  const isDeploymentStep = step === 6;
  const isSuccessStep = step === 7;

  return (
    <div className="space-y-8">
      <div className={cn(
        "transition-all duration-300",
        isDeploying && "opacity-70 pointer-events-none"
      )}>
        {renderStepContent()}
      </div>

      {showNavigation && (
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={step === 0 || isDeploying}
            className="flex items-center gap-2 transition-all hover:gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>

          {isSuccessStep ? (
            <Button
              onClick={onRestart}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Neuen Token erstellen
            </Button>
          ) : (
            <Button
              onClick={isLastStep ? onDeploy : onNext}
              disabled={isDeploying}
              className={cn(
                "flex items-center gap-2 transition-all",
                !isLastStep && "hover:gap-3"
              )}
            >
              {isDeploying ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  Wird deployed...
                </>
              ) : (
                <>
                  {isLastStep ? (
                    <>
                      Token deployen
                      <Rocket className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Weiter
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenCreationStepContent;
