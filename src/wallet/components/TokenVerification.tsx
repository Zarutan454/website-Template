
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { verifyContract, checkVerificationStatus } from '@/services/verification/verificationService';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield, ShieldCheck, Loader2 } from 'lucide-react';

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
  const [isPolling, setIsPolling] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const checkStatus = async () => {
    if (contractAddress) {
      try {
        const result = await checkVerificationStatus(contractAddress);
        if (result.success) {
          setVerificationStatus(result.status as 'unverified' | 'pending' | 'verified');
          if (result.explorerUrl) {
            setExplorerUrl(result.explorerUrl);
          }
          
          // If status is pending, continue polling
          return result.status === 'pending';
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }
    return false;
  };
  
  // Initial status check
  useEffect(() => {
    const initialCheck = async () => {
      const shouldContinuePolling = await checkStatus();
      if (shouldContinuePolling) {
        setIsPolling(true);
      }
    };
    
    if (contractAddress) {
      initialCheck();
    }
  }, [contractAddress]);
  
  // Setup polling if status is pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling && verificationStatus === 'pending') {
      interval = setInterval(async () => {
        const shouldContinuePolling = await checkStatus();
        if (!shouldContinuePolling) {
          setIsPolling(false);
          clearInterval(interval);
        }
      }, 10000); // Check every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, verificationStatus, contractAddress]);

  const handleVerification = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyContract(
        contractAddress,
        network,
        constructorArgs
      );

      if (result.success) {
        setVerificationStatus('pending');
        setIsPolling(true);
        toast({
          title: "Verifizierung gestartet",
          description: "Der Contract wird nun verifiziert. Dies kann einige Minuten dauern.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
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

      <div className="flex items-center gap-4">
        <Button
          onClick={handleVerification}
          disabled={isVerifying || verificationStatus === 'verified' || verificationStatus === 'pending'}
          variant={verificationStatus === 'unverified' ? 'default' : 'outline'}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifiziere...
            </>
          ) : verificationStatus === 'verified' ? (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Contract verifiziert
            </>
          ) : verificationStatus === 'pending' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifizierung läuft...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Contract verifizieren
            </>
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
