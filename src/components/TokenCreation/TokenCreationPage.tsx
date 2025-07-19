import React, { useState, useEffect } from 'react';
import { useTokenCreation } from './context/TokenCreationContext.utils';
import TokenWizardStepper from './navigation/TokenWizardStepper';
import TokenCreationStepContent from './steps/TokenCreationStepContent';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Coins, ArrowLeft, Sparkles, ChevronRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletConnectPrompt from '../wallet/WalletConnectPrompt';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

const TokenCreationPage: React.FC = () => {
  const { 
    currentStep, 
    handleNextStep, 
    handlePreviousStep,
    deployTokenContract,
    isDeploying,
    deploymentError,
    deployedContract,
    ownerAddress,
    form,
    resetForm
  } = useTokenCreation();
  
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  
  // Step titles for the stepper
  const steps = [
    "Netzwerk auswählen",
    "Token-Typ",
    "Name & Symbol",
    "Supply & Einstellungen",
    "Erweiterte Optionen",
    "Überprüfung",
    "Deployment",
    "Erfolgreich"
  ];
  
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If wallet not connected, show connect prompt
  if (!isConnected) {
    return (
      <motion.div 
        className="container mx-auto p-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-primary" />
                Token erstellen
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </div>
            <CardDescription className="mt-1">
              Erstelle deinen eigenen Token auf der Blockchain
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 border-y border-primary/10">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                </motion.div>
                
                <motion.h2 
                  className="text-2xl font-bold"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Erstelle deinen eigenen Token
                </motion.h2>
                
                <motion.p 
                  className="text-muted-foreground"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Mit unserem Token-Wizard kannst du in wenigen Schritten deinen eigenen Token erstellen und auf der Blockchain deployen.
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="pt-4"
                >
                  <WalletConnectPrompt message="Bitte verbinde deine Wallet, um einen Token zu erstellen." />
                </motion.div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30">
            <div className="w-full space-y-4">
              <h3 className="text-sm font-medium">Vorteile deines eigenen Tokens:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Rocket className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Einfaches Deployment</h4>
                    <p className="text-xs text-muted-foreground">Deploye deinen Token mit wenigen Klicks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Anpassbare Funktionen</h4>
                    <p className="text-xs text-muted-foreground">Wähle aus verschiedenen Token-Typen</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Sofort einsatzbereit</h4>
                    <p className="text-xs text-muted-foreground">Nutze deinen Token direkt nach dem Deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {showIntro && (
        <motion.div 
          key="intro-overlay"
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="p-5 rounded-full bg-primary/20">
                <Coins className="h-16 w-16 text-primary" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-3xl font-bold mb-2"
            >
              Token Creator
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-muted-foreground"
            >
              Erstelle deinen eigenen Token in wenigen Schritten
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Spinner size="lg" className="mt-8" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      <motion.div 
        key="main-content"
        className="container mx-auto p-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: showIntro ? 2 : 0 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">{currentStep + 1}</span> von {steps.length}
          </div>
        </div>
        
        <Card className="border-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-primary" />
                Token erstellen
              </CardTitle>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {steps[currentStep]}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {currentStep === 0 && "Wähle das Netzwerk für deinen Token aus"}
              {currentStep === 1 && "Wähle den Typ deines Tokens"}
              {currentStep === 2 && "Gib deinem Token einen Namen und ein Symbol"}
              {currentStep === 3 && "Lege die Gesamtmenge und Einstellungen fest"}
              {currentStep === 4 && "Konfiguriere erweiterte Optionen für deinen Token"}
              {currentStep === 5 && "Überprüfe alle Einstellungen vor dem Deployment"}
              {currentStep === 6 && "Deploye deinen Token auf die Blockchain"}
              {currentStep === 7 && "Dein Token wurde erfolgreich erstellt"}
            </CardDescription>
          </CardHeader>
          
          <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-y border-primary/10">
            <TokenWizardStepper 
              steps={steps} 
              currentStep={currentStep} 
            />
          </div>
          
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div 
                className="mt-2"
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TokenCreationStepContent 
                  step={currentStep}
                  onNext={handleNextStep}
                  onPrevious={handlePreviousStep}
                  onDeploy={deployTokenContract}
                  isDeploying={isDeploying}
                  deployedContract={deployedContract}
                  deploymentError={deploymentError}
                  ownerAddress={ownerAddress}
                  onRestart={resetForm}
                  form={form}
                />
              </motion.div>
            </AnimatePresence>
          </CardContent>
          
          {currentStep < 6 && (
            <CardFooter className="border-t border-gray-800 p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Fortschritt</h3>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((currentStep / (steps.length - 1)) * 100)}% abgeschlossen
                  </span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2 mb-4">
                  <motion.div 
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Tipp: {currentStep === 0 && "Wähle das Netzwerk, auf dem dein Token deployed werden soll. Testnetze sind ideal zum Testen."}
                  {currentStep === 1 && "Standard-Tokens sind einfach zu erstellen. Business-Tokens bieten zusätzliche Funktionen wie Steuern."}
                  {currentStep === 2 && "Wähle einen einzigartigen Namen und ein kurzes Symbol (2-4 Zeichen) für deinen Token."}
                  {currentStep === 3 && "Die Gesamtmenge bestimmt, wie viele Tokens erstellt werden. Dezimalstellen beeinflussen die Teilbarkeit."}
                  {currentStep === 4 && "Erweiterte Optionen ermöglichen dir, deinen Token mit speziellen Funktionen auszustatten."}
                  {currentStep === 5 && "Überprüfe alle Einstellungen sorgfältig. Nach dem Deployment können einige Parameter nicht mehr geändert werden."}
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default TokenCreationPage;
