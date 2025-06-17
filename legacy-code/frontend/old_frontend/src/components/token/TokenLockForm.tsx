
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { useTokenLocking } from '@/hooks/useTokenLocking';
import { CalendarIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TokenLockFormProps {
  tokenId: string;
  onSuccess?: () => void;
}

const TokenLockForm: React.FC<TokenLockFormProps> = ({ tokenId, onSuccess }) => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(
    addMonths(new Date(), 1) // Default to 1 month from now
  );
  const { lockToken, isLoading } = useTokenLocking();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!address) {
      setFormError('Bitte verbinde deine Wallet');
      return false;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setFormError('Bitte gib eine gültige Anzahl an Tokens ein');
      return false;
    }
    
    if (!unlockDate) {
      setFormError('Bitte wähle ein Datum für die Freigabe');
      return false;
    }

    if (unlockDate <= new Date()) {
      setFormError('Das Freigabedatum muss in der Zukunft liegen');
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await lockToken({
        token_id: tokenId,
        amount,
        unlock_date: unlockDate as Date,
        lock_owner: address as string,
        network: 'ethereum' // This should be dynamically determined in a real implementation
      });
      
      if (result) {
        setFormSuccess('Tokens wurden erfolgreich gesperrt!');
        toast.success('Tokens wurden erfolgreich gesperrt!');
        
        if (onSuccess) onSuccess();
        
        // Reset form
        setAmount('');
        setUnlockDate(addMonths(new Date(), 1));
      }
    } catch (error: any) {
      setFormError(error.message || 'Fehler beim Sperren der Tokens');
      toast.error('Fehler beim Sperren der Tokens');
    }
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            {formSuccess && (
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Erfolg</AlertTitle>
                <AlertDescription>{formSuccess}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Anzahl der Tokens</Label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFormError(null);
                }}
                placeholder="0.0"
                required
                className={formError && !amount ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">
                Die Anzahl der Tokens, die du sperren möchtest
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unlockDate">Freigabedatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="unlockDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !unlockDate && "text-muted-foreground",
                      formError && !unlockDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {unlockDate ? format(unlockDate, "PPP") : <span>Wähle ein Datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={unlockDate}
                    onSelect={(date) => {
                      setUnlockDate(date);
                      setFormError(null);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date()} // Disable past dates
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Wähle das Datum, an dem deine Tokens freigegeben werden sollen
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tokens werden gesperrt...
              </>
            ) : 'Tokens sperren'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TokenLockForm;
