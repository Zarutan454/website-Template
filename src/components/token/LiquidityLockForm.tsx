
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface LiquidityLockFormProps {
  tokenId: string;
  onSuccess?: () => void;
}

const LiquidityLockForm: React.FC<LiquidityLockFormProps> = ({ tokenId, onSuccess }) => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [lockDays, setLockDays] = useState('30');
  const [pairAddress, setPairAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Hier würde die eigentliche Liquidity Lock-Implementierung folgen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Liquidity locked successfully',
        variant: 'default'
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Formular zurücksetzen
      setAmount('');
      setLockDays('30');
      setPairAddress('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to lock liquidity',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity Lock</CardTitle>
        <CardDescription>Lock liquidity to build trust with your investors</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pairAddress">LP Token Address</Label>
            <Input
              id="pairAddress"
              placeholder="0x..."
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Lock</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lockDays">Lock Duration (Days)</Label>
            <Input
              id="lockDays"
              type="number"
              min="1"
              value={lockDays}
              onChange={(e) => setLockDays(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Locking Liquidity...' : 'Lock Liquidity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LiquidityLockForm;
