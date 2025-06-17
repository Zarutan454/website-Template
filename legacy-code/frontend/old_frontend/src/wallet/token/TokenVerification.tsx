
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, Check, AlertTriangle, Clock } from 'lucide-react';
import { TokenVerificationService } from '@/wallet/services/verification/verificationService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ExplorerLink from '@/components/blockchain/ExplorerLink';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TokenVerificationProps {
  contractAddress: string;
  network: string;
  constructorArgs: any[];
}

export const TokenVerification: React.FC<TokenVerificationProps> = ({
  contractAddress,
  network,
  constructorArgs
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [explorerUrl, setExplorerUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Statusüberprüfung in eigene Funktion extrahieren
  const checkStatus = async () => {
    if (!contractAddress) return;
    
    try {
      setIsChecking(true);
      setError(null);
      
      const result = await TokenVerificationService.checkVerificationStatus(contractAddress);
      
      if (result.success && result.status) {
        setVerificationStatus(result.status);
        if (result.explorerUrl) {
          setExplorerUrl(result.explorerUrl);
        }
        setLastChecked(new Date());
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error checking verification status');
    } finally {
      setIsChecking(false);
    }
  };
  
  // Bei Komponentenaufbau und bei Änderung der Contract-Adresse den aktuellen Status prüfen
  useEffect(() => {
    if (contractAddress) {
      checkStatus();
      
      // Bei "pending" Status alle 30 Sekunden erneut prüfen
      let interval: NodeJS.Timeout | null = null;
      
      if (verificationStatus === 'pending') {
        interval = setInterval(checkStatus, 30000); // Alle 30 Sekunden prüfen
      }
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [contractAddress, verificationStatus, checkStatus]);
  
  // Funktion zum Verifizieren des Contracts
  const handleVerifyContract = async () => {
    if (!contractAddress || !network) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // Verifizierungsanfrage senden
      const result = await TokenVerificationService.submitVerificationRequest({
        contractAddress,
        network,
        constructorArgs
      });
      
      if (result.success) {
        setVerificationStatus('pending');
        toast.success('Verifizierung gestartet', {
          description: 'Dein Contract wird jetzt verifiziert. Dies kann einige Minuten dauern.'
        });
        
        // Status nach kurzer Verzögerung erneut prüfen
        setTimeout(checkStatus, 5000);
      } else {
        setError(result.error || 'Verifikation fehlgeschlagen. Bitte versuche es erneut.');
        toast.error('Verifikation fehlgeschlagen', {
          description: result.error || 'Bitte versuche es später erneut.'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Bei der Verifikation ist ein Fehler aufgetreten');
      toast.error('Fehler bei der Verifikation', {
        description: err.message || 'Ein unbekannter Fehler ist aufgetreten.'
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Status-Badge Variante und Icon basierend auf Verifikationsstatus
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified': return <Check className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };
  
  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified': return 'Verifiziert';
      case 'pending': return 'In Bearbeitung';
      default: return 'Nicht verifiziert';
    }
  };
  
  const getBadgeVariant = () => {
    switch (verificationStatus) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      default: return 'outline';
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Contract verifizieren</span>
          <Badge 
            variant={getBadgeVariant() as any}
            className="flex items-center gap-1"
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Die Verifizierung deines Contracts ermöglicht es anderen Nutzern, deinen Code im Blockchain-Explorer einzusehen und erhöht damit das Vertrauen in deinen Token.
        </p>
        
        {lastChecked && (
          <div className="text-xs text-muted-foreground">
            Zuletzt überprüft: {lastChecked.toLocaleTimeString()}
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={checkStatus}
                  disabled={isChecking || !contractAddress}
                  className="text-xs"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Prüfe...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Status aktualisieren
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Prüfe den aktuellen Verifikationsstatus manuell</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {explorerUrl && (
            <ExplorerLink
              network={network}
              value={contractAddress}
              type="address"
              variant="button"
              label="Auf Explorer anzeigen"
              className="text-xs"
            />
          )}
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleVerifyContract}
            disabled={isVerifying || verificationStatus === 'verified' || verificationStatus === 'pending' || !contractAddress}
            className="text-xs"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Verifiziere...
              </>
            ) : (
              <>Contract verifizieren</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenVerification;
