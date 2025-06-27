
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TokenVerificationService } from '@/wallet/services/verification/verificationService';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenVerificationProps {
  contractAddress: string;
  network: string;
  constructorArgs: any[];
}

export function TokenVerification({ 
  contractAddress, 
  network, 
  constructorArgs 
}: TokenVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkStatus = async () => {
    if (!contractAddress) return;
    
    try {
      setIsChecking(true);
      setError(null);
      
      const result = await TokenVerificationService.checkVerificationStatus(contractAddress);
      
      if (result.success) {
        setVerificationStatus(result.status as 'unverified' | 'pending' | 'verified');
        if (result.explorerUrl) {
          setExplorerUrl(result.explorerUrl);
        }
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (contractAddress) {
      checkStatus();
    }
    // Poll status every 30 seconds if pending
    const interval = setInterval(() => {
      if (verificationStatus === 'pending' && contractAddress) {
        checkStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [contractAddress, verificationStatus]);

  const handleVerification = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const result = await TokenVerificationService.submitVerificationRequest({
        contractAddress,
        network,
        constructorArgs
      });

      if (result.success) {
        setVerificationStatus('pending');
        toast({
          title: "Verifizierung gestartet",
          description: "Der Contract wird nun verifiziert. Dies kann einige Minuten dauern.",
        });
        
        // Status nach kurzer Verzögerung erneut prüfen
        setTimeout(checkStatus, 5000);
      } else {
        setError(result.error || "Verifizierung fehlgeschlagen");
        toast({
          title: "Verifizierung fehlgeschlagen",
          description: result.error || "Bitte versuche es später erneut",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {verificationStatus === 'verified' ? (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          ) : (
            <Shield className="h-5 w-5 text-yellow-500" />
          )}
          <span className="font-medium">Contract Verifizierung</span>
        </div>
        <Badge
          variant={
            verificationStatus === 'verified' 
              ? 'default'
              : verificationStatus === 'pending' 
                ? 'secondary' 
                : 'outline'
          }
          className={verificationStatus === 'verified' ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          {verificationStatus === 'verified' ? 'Verifiziert' : 
           verificationStatus === 'pending' ? 'In Bearbeitung' : 
           'Nicht verifiziert'}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={handleVerification}
          disabled={isVerifying || verificationStatus === 'verified' || verificationStatus === 'pending'}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifiziere...
            </>
          ) : verificationStatus === 'verified' ? (
            'Contract verifiziert'
          ) : verificationStatus === 'pending' ? (
            'Verifizierung läuft...'
          ) : (
            'Contract verifizieren'
          )}
        </Button>

        <Button 
          variant="outline" 
          onClick={checkStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>

        {explorerUrl && (
          <Button variant="outline" onClick={() => window.open(explorerUrl, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Auf Explorer anzeigen
          </Button>
        )}
      </div>
    </div>
  );
}
