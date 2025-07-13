
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; 
import { useState } from "react";
import { WalletLoginSection } from "./WalletLoginSection";
import { LoginHeader } from "./LoginHeader";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useWalletAuth } from "./useWalletAuth";

export const LoginCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { handleWalletLogin } = useWalletAuth();

  // Wenn der Benutzer verbunden ist, zurück zur Wallet-Seite leiten
  useEffect(() => {
    if (isConnected) {
      navigate("/wallet");
    }
  }, [isConnected, navigate]);

  const handleWalletLoginComplete = async () => {
    setIsLoading(true);
    try {
      const success = await handleWalletLogin('/wallet');
      if (success) {
        navigate('/wallet');
      }
    } catch (error) {
      console.error('Error during wallet login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <LoginHeader 
          title="Wallet verbinden" 
          subtitle="Verbinde deine Wallet, um deine BSN-Token zu verwalten, Transaktionen durchzuführen und eigene Token zu erstellen." 
        />
      </CardHeader>
      <CardContent>
        <WalletLoginSection 
          onWalletLogin={handleWalletLoginComplete}
          isLoading={isLoading}
          redirectPath="/wallet"
        />

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Unterstützte Wallet-Provider:</p>
          <div className="flex justify-center mt-2 space-x-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl">🦊</span>
              <span className="text-xs mt-1">MetaMask</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm">
          <p className="text-gray-500 mb-2">Neu bei BSN Network?</p>
          <p>Installiere eine kompatible Wallet wie MetaMask, um loszulegen. Mit einer Web3-Wallet kannst du BSN-Token sicher verwalten und am Netzwerk teilnehmen.</p>
        </div>
      </CardContent>
    </Card>
  );
};
