
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Copy, ExternalLink, Rocket, Share2, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getExplorerUrl } from '@/utils/blockchain';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface SuccessStepProps {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  network: string;
  ownerAddress: string;
  canMint: boolean;
  canBurn: boolean;
  onReset: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  contractAddress,
  tokenName,
  tokenSymbol,
  network,
  ownerAddress,
  canMint,
  canBurn,
  onReset
}) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    toast.success('Adresse in die Zwischenablage kopiert');
  };
  
  const explorerUrl = getExplorerUrl(network, contractAddress, 'address');
  
  const [activeTab, setActiveTab] = useState<'details' | 'next-steps'>('details');
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
          <Check className="h-12 w-12 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          Token erfolgreich erstellt!
        </h2>
        
        <p className="text-muted-foreground">
          Dein <span className="font-medium text-primary">{tokenName}</span> (<span className="font-medium">{tokenSymbol}</span>) Token wurde erfolgreich auf der Blockchain deployed.
        </p>
        
        <div className="flex items-center justify-center mt-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" /> Verifiziert
          </Badge>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-primary/20 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5 text-primary" />
              Token Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{tokenName}</span>
                
                <span className="text-muted-foreground">Symbol:</span>
                <span className="font-medium">{tokenSymbol}</span>
                
                <span className="text-muted-foreground">Netzwerk:</span>
                <span className="font-medium capitalize flex items-center">
                  {network}
                  <Badge variant="outline" className="ml-2 text-xs py-0 h-5">
                    {network === 'ethereum' ? 'Mainnet' : network === 'sepolia' ? 'Testnet' : network}
                  </Badge>
                </span>
                
                <span className="text-muted-foreground">Contract:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs truncate max-w-[180px] sm:max-w-[300px] bg-primary/5 px-2 py-1 rounded">
                    {contractAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <span className="text-muted-foreground">Besitzer:</span>
                <span className="font-mono text-xs truncate max-w-[180px] sm:max-w-[300px] bg-primary/5 px-2 py-1 rounded">
                  {ownerAddress}
                </span>
                
                <span className="text-muted-foreground">Features:</span>
                <div className="flex flex-wrap gap-2">
                  {canMint && (
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> Prägbar
                    </Badge>
                  )}
                  {canBurn && (
                    <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> Brennbar
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              className="flex-1 flex items-center gap-2"
              onClick={handleCopyAddress}
              variant="secondary"
            >
              <Copy className="h-4 w-4" />
              Adresse kopieren
            </Button>
            
            {explorerUrl && (
              <Button
                variant="outline"
                className="flex-1 flex items-center gap-2"
                onClick={() => window.open(explorerUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Im Explorer anzeigen
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-blue-500/20 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="h-5 w-5 text-blue-500" />
              Nächste Schritte
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Wallet Integration</h3>
                    <p className="text-sm text-muted-foreground">Füge den Token zu deiner Wallet hinzu, um ihn zu verwalten.</p>
                    <Button variant="link" className="text-xs p-0 h-auto mt-2 text-primary" onClick={() => window.open('https://metamask.io/faqs/', '_blank')}>
                      Anleitung ansehen <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Community teilen</h3>
                    <p className="text-sm text-muted-foreground">Teile deinen Token mit deiner Community und Freunden.</p>
                    <Button variant="link" className="text-xs p-0 h-auto mt-2 text-primary" onClick={handleCopyAddress}>
                      Token-Adresse kopieren <Copy className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Weitere Schritte</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Verifiziere den Smart Contract auf dem Blockchain-Explorer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Erstelle Liquidität für deinen Token in einer DEX</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Entwickle eine Marketingstrategie für deinen Token</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Überwache die Transaktionen und den Wert deines Tokens</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Button 
          onClick={onReset}
          size="lg"
          className="gap-2"
        >
          <Rocket className="h-4 w-4" />
          Weiteren Token erstellen
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SuccessStep;
