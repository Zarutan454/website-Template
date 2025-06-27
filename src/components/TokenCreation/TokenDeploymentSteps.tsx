
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DeploymentProgress from './DeploymentProgress';
import { NETWORKS } from './data/tokenData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useAccount } from 'wagmi';
import { estimateDeploymentGas } from '@/wallet/services/contractService';
import { DeploymentStage, DEPLOYMENT_STAGES } from './types';

interface TokenDeploymentStepsProps {
  tokenData: {
    name: string;
    symbol: string;
    initialSupply: string;
    network: string;
    tokenType: 'standard' | 'business' | 'marketing';
    canMint?: boolean;
    canBurn?: boolean;
  };
  currentStep: number;
  onDeploy: (ownerAddress: string) => Promise<void>;
  isDeploying: boolean;
  onReset: () => void;
}

const TokenDeploymentSteps: React.FC<TokenDeploymentStepsProps> = ({
  tokenData,
  currentStep,
  onDeploy,
  isDeploying,
  onReset
}) => {
  const { address } = useAccount();
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStage>(DEPLOYMENT_STAGES.NOT_STARTED);
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationError, setEstimationError] = useState<string | null>(null);

  useEffect(() => {
    if (address && tokenData.network && tokenData.name && tokenData.tokenType) {
      estimateGas();
    }
  }, [address, tokenData]);

  const estimateGas = async () => {
    if (!address) return;

    setIsEstimating(true);
    setEstimationError(null);

    try {
      const deploymentConfig = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        initialSupply: tokenData.initialSupply || '1000000',
        ownerAddress: address,
        network: tokenData.network,
        tokenType: tokenData.tokenType,
        canMint: tokenData.canMint || false,
        canBurn: tokenData.canBurn || false,
        tokenId: 'placeholder-token-id'
      };

      const result = await estimateDeploymentGas(deploymentConfig);
      
      if (result.totalCostEth) {
        setGasEstimate(result.totalCostEth);
      } else {
        setEstimationError(result.error || 'Fehler bei der Gas-Schätzung');
      }
    } catch (error) {
      console.error('Fehler bei der Gas-Schätzung:', error);
      setEstimationError('Konnte Gas-Kosten nicht berechnen. Bitte versuche es später erneut.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleDeploy = async () => {
    if (!address) return;
    
    setDeploymentStatus(DEPLOYMENT_STAGES.DEPLOYING);
    
    await onDeploy(address);
  };

  const selectedNetwork = NETWORKS.find(n => n.id === tokenData.network);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Token Deployment</CardTitle>
          <CardDescription>
            Überprüfe die Details und deploye deinen Token auf die Blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Details</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Name:</span> {tokenData.name}</p>
                <p><span className="font-medium">Symbol:</span> {tokenData.symbol}</p>
                <p><span className="font-medium">Supply:</span> {tokenData.initialSupply}</p>
                <p><span className="font-medium">Token-Typ:</span> {tokenData.tokenType}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Blockchain Info</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Netzwerk:</span> {selectedNetwork?.name}</p>
                <p><span className="font-medium">Gas-Token:</span> {selectedNetwork?.gasToken || selectedNetwork?.currency}</p>
                <p>
                  <span className="font-medium">Geschätzte Kosten:</span> {
                    isEstimating 
                      ? 'Berechne...' 
                      : estimationError 
                        ? 'Nicht verfügbar' 
                        : `${gasEstimate} ${selectedNetwork?.gasToken || selectedNetwork?.currency}`
                  }
                </p>
                <p><span className="font-medium">Wallet:</span> {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Nicht verbunden'}</p>
              </div>
            </div>
          </div>
          
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertTitle>Wichtiger Hinweis</AlertTitle>
            <AlertDescription>
              Das Deployment eines Tokens ist eine irreversible Aktion. Nach dem Deployment können bestimmte Parameter nicht mehr geändert werden.
            </AlertDescription>
          </Alert>
          
          {estimationError && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-500" />
              <AlertTitle>Gas-Schätzung fehlgeschlagen</AlertTitle>
              <AlertDescription>{estimationError}</AlertDescription>
            </Alert>
          )}
          
          {isDeploying && <DeploymentProgress status={deploymentStatus} network={tokenData.network} />}
          
          <div className="flex justify-between flex-wrap gap-2">
            <Button variant="outline" onClick={onReset} disabled={isDeploying}>
              Zurücksetzen
            </Button>
            <Button 
              onClick={handleDeploy} 
              disabled={!address || isDeploying || isEstimating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isEstimating 
                ? 'Berechne Gas-Kosten...' 
                : isDeploying 
                  ? 'Wird deployed...' 
                  : 'Token Deployen'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenDeploymentSteps;
