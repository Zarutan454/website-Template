
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWalletAuth } from "./useWalletAuth";

interface WalletLoginSectionProps {
  onWalletLogin: () => void;
  isLoading: boolean;
  redirectPath?: string;
}

export const WalletLoginSection = ({ 
  onWalletLogin, 
  isLoading: externalLoading,
  redirectPath = '/feed'
}: WalletLoginSectionProps) => {
  const { connect, connectors, isPending } = useConnect({
    mutation: {
      onSuccess: () => {
        toast.success('Wallet erfolgreich verbunden');
      },
      onError: (error) => toast.error(`Fehler beim Verbinden: ${error.message}`)
    }
  });

  const { handleWalletLogin, isAuthenticating } = useWalletAuth();

  // MetaMask Connector finden
  const metamaskConnector = connectors.find(
    c => c.id.toLowerCase().includes('injected') || c.id.toLowerCase().includes('metamask')
  );

  const handleConnectAndLogin = async () => {
    try {
      if (metamaskConnector) {
        connect({ connector: metamaskConnector });
        
        // Kurze Verzögerung, um dem Verbindungsvorgang Zeit zu geben
        setTimeout(async () => {
          const success = await handleWalletLogin(redirectPath);
          if (success) {
            onWalletLogin();
          }
        }, 1000);
      } else {
        toast.error('MetaMask nicht gefunden. Bitte installiere die MetaMask-Erweiterung.');
      }
    } catch (error) {
      toast.error(`Fehler beim Verbinden und Anmelden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  const isLoading = isPending || isAuthenticating || externalLoading;

  return (
    <div className="space-y-4">
      {/* MetaMask Button - Prominent und gut sichtbar */}
      <Button
        onClick={handleConnectAndLogin}
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center h-12 text-base"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <div className="text-xl mr-2">🦊</div>
        )}
        Mit MetaMask verbinden
      </Button>
    </div>
  );
};
