import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Rocket, AlertTriangle, Wallet, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { DeploymentStage } from '../types';
import TokenDeploymentStatus from '../TokenDeploymentStatus';
import { useTokenCreation } from '../context/TokenCreationContext.utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export interface DeploymentStepProps {
  isDeploying: boolean;
  onDeploy: () => Promise<boolean>;
  deploymentStatus?: DeploymentStage;
  onReset?: () => void;
}

const DeploymentStep: React.FC<DeploymentStepProps> = ({
  isDeploying,
  onDeploy,
  deploymentStatus,
  onReset
}) => {
  const { form } = useTokenCreation();
  const network = form?.getValues().network || 'ethereum';
  const tokenName = form?.getValues().name || 'Token';
  const tokenSymbol = form?.getValues().symbol || '';
  const [deployProgress, setDeployProgress] = useState(0);
  
  useEffect(() => {
    if (isDeploying && !deploymentStatus) {
      const interval = setInterval(() => {
        setDeployProgress(prev => {
          const newProgress = prev + (Math.random() * 5);
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 800);
      
      return () => clearInterval(interval);
    } else if (deploymentStatus?.stage === 'completed') {
      setDeployProgress(100);
    } else if (!isDeploying) {
      setDeployProgress(0);
    }
  }, [isDeploying, deploymentStatus]);
  
  // If we don't have a deploymentStatus prop, create a default one based on isDeploying
  const status = deploymentStatus || (isDeploying 
    ? { stage: 'deploying', message: 'Token wird auf die Blockchain deployed...' } 
    : { stage: 'not-started' });
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Token Deployment</h2>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {network}
        </div>
      </div>
      
      {status.stage !== 'not-started' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <TokenDeploymentStatus 
            deploymentStatus={status}
            network={network}
            onReset={onReset}
          />
          
          {isDeploying && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Deployment Fortschritt</span>
                <span>{Math.round(deployProgress)}%</span>
              </div>
              <Progress value={deployProgress} className="h-2" />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Alert className="border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600 font-medium">Wichtiger Hinweis</AlertTitle>
            <AlertDescription className="text-amber-700/80">
              Dies ist der letzte Schritt. Nach dem Deployment können einige Parameter nicht mehr geändert werden.
              Bitte stelle sicher, dass alle Einstellungen korrekt sind.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-primary/20 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Token Details</h3>
                      <p className="text-sm text-muted-foreground mb-4">Überprüfe deine Token-Informationen</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{tokenName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Symbol:</span>
                          <span className="font-medium">{tokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Netzwerk:</span>
                          <span className="font-medium">{network}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Supply:</span>
                          <span className="font-medium">{form?.getValues().supply || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-primary/20 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Wallet Bereit?</h3>
                      <p className="text-sm text-muted-foreground mb-2">Stelle sicher, dass deine Wallet bereit ist</p>
                      
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                          <span>Mit {network} verbunden</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                          <span>Genügend ETH für Gas-Gebühren</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" />
                          <span>Wallet ist entsperrt</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6">
                  <div className="text-xs text-muted-foreground">
                    Dein Token wird auf dem <strong>{network}</strong> Netzwerk deployed.
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-6"
          >
            <Button 
              onClick={onDeploy} 
              className="w-full flex items-center justify-center gap-2 h-14 text-base"
              size="lg"
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Token wird deployed...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  Token Deployen <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DeploymentStep;
