
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export const SendTokenForm: React.FC = () => {
  const { balances, sendTokens } = useWallet();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Nur Zahlen und einen Dezimalpunkt erlauben
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };
  
  const handleSelectToken = (value: string) => {
    setSelectedToken(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount || !selectedToken) {
      toast({
        title: "Eingabefehler",
        description: "Bitte fülle alle Felder aus",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Validiere Empfängeradresse
      if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        throw new Error('Ungültige Wallet-Adresse');
      }
      
      // Validiere Betrag
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Ungültiger Betrag');
      }
      
      // Prüfe verfügbares Guthaben
      const token = balances.find(b => b.token_id === selectedToken);
      if (!token) {
        throw new Error('Token nicht gefunden');
      }
      
      if (amountValue > token.balance) {
        throw new Error('Nicht genügend Guthaben');
      }
      
      // Sende Tokens
      const success = await sendTokens(recipient, selectedToken, amountValue);
      
      if (success) {
        toast({
          title: "Transaktion erfolgreich",
          description: `${amount} ${token.token_symbol} wurden an ${recipient.slice(0, 6)}...${recipient.slice(-4)} gesendet`,
        });
        
        // Formular zurücksetzen
        setAmount('');
        setRecipient('');
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedTokenData = balances.find(token => token.token_id === selectedToken);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token senden</CardTitle>
        <CardDescription>Sende Token an eine andere Wallet-Adresse</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Token auswählen</Label>
            <Select value={selectedToken} onValueChange={handleSelectToken}>
              <SelectTrigger id="token">
                <SelectValue placeholder="Token auswählen" />
              </SelectTrigger>
              <SelectContent>
                {balances.map(token => (
                  <SelectItem key={token.token_id} value={token.token_id}>
                    <div className="flex items-center">
                      <span>{token.token_symbol}</span>
                      <span className="ml-2 text-muted-foreground">({token.balance.toFixed(6)})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTokenData && (
              <p className="text-xs text-muted-foreground">
                Verfügbar: {selectedTokenData.balance.toFixed(6)} {selectedTokenData.token_symbol}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Betrag</Label>
            <Input
              id="amount"
              placeholder="0.0"
              value={amount}
              onChange={handleAmountChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipient">Empfänger-Adresse</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={handleRecipientChange}
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !amount || !recipient || !selectedToken}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                Senden
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground text-center">
          Transaktionen können nicht rückgängig gemacht werden. Bitte überprüfe die Adresse vor dem Senden.
        </p>
      </CardFooter>
    </Card>
  );
};
