
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { toast } from 'sonner';

interface TokenData {
  name: string;
  symbol: string;
  initialSupply: string;
  tokenType: 'standard' | 'marketing' | 'business';
  description?: string;
  canMint: boolean;
  canBurn: boolean;
  network: string;
  maxTransactionLimit?: string;
  maxWalletLimit?: string;
  maxSupply?: string;
  lockupTime?: number;
}

export const useTokenCreation = () => {
  const isMobileView = useMediaQuery('(max-width: 768px)');
  
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    initialSupply: '1000000',
    tokenType: 'standard',
    canMint: true,
    canBurn: true,
    network: 'ethereum',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);
  
  const handleInputChange = (field: keyof TokenData, value: TokenData[keyof TokenData]) => {
    setTokenData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validiere die Eingaben
      if (!tokenData.name || !tokenData.symbol || !tokenData.initialSupply) {
        toast.error('Bitte fülle alle Pflichtfelder aus');
        return;
      }
      
      // Validiere den Initial Supply als Zahl
      const supply = parseFloat(tokenData.initialSupply);
      if (isNaN(supply) || supply <= 0) {
        toast.error('Der Anfangsbestand muss eine positive Zahl sein');
        return;
      }
      
      // Speichere den Token in der Datenbank - hier simuliert
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Token-Informationen gespeichert');
      
      // Nach erfolgreichem Speichern zum Deployment-Tab wechseln
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      toast.error('Fehler beim Speichern der Token-Informationen');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simuliere das Deployment eines Tokens
  const simulateDeployment = async () => {
    try {
      setIsLoading(true);
      
      if (deploymentStep === 0) {
        // Schritt 1: Wallet-Verbindung bestätigen
        setDeploymentStep(1);
        setIsLoading(false);
        return;
      }
      
      if (deploymentStep === 1) {
        // Schritt 2: Smart Contract erstellen und Deployment starten
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setDeploymentStep(2);
        
        // Simuliere das Warten auf die Blockchain-Bestätigung
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        // Deployment abgeschlossen
        setDeploymentStep(3);
        toast.success(`${tokenData.name} Token erfolgreich deployed!`);
        return;
      }
    } catch (error) {
      console.error('Error during deployment:', error);
      toast.error('Fehler beim Deployment des Tokens');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setTokenData({
      name: '',
      symbol: '',
      initialSupply: '1000000',
      tokenType: 'standard',
      canMint: true,
      canBurn: true,
      network: 'ethereum',
    });
    setDeploymentStep(0);
  };
  
  return {
    tokenData,
    isLoading,
    isSubmitting,
    deploymentStep,
    handleInputChange,
    handleSubmit,
    simulateDeployment,
    resetForm,
    isMobileView,
  };
};
