import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext.utils';
import { api } from '@/lib/django-api-new';

interface ICOConfig {
  price_per_token: number;
  min_investment: number;
  max_investment: number;
  total_supply: number;
  tokens_sold: number;
}

interface ICOReservationFormProps {
  onReservationCreated: () => void;
}

export default function ICOReservationForm({ onReservationCreated }: ICOReservationFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock ICO config - in real implementation, this would come from API
  const icoConfig: ICOConfig = {
    price_per_token: 0.1,
    min_investment: 100,
    max_investment: 10000,
    total_supply: 1000000,
    tokens_sold: 250000,
  };

  const calculateTokens = (usdAmount: number) => {
    return usdAmount / icoConfig.price_per_token;
  };

  const validateForm = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return false;
    }

    if (numAmount < icoConfig.min_investment) {
      toast({
        title: 'Error',
        description: `Minimum investment is $${icoConfig.min_investment}`,
        variant: 'destructive',
      });
      return false;
    }

    if (numAmount > icoConfig.max_investment) {
      toast({
        title: 'Error',
        description: `Maximum investment is $${icoConfig.max_investment}`,
        variant: 'destructive',
      });
      return false;
    }

    if (!paymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return false;
    }

    if (!paymentAddress) {
      toast({
        title: 'Error',
        description: 'Please enter your payment address',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/ico-reservations/', {
        amount_usd: parseFloat(amount),
        payment_method: paymentMethod,
        payment_address: paymentAddress,
        transaction_hash: transactionHash || null,
        notes: notes || null,
      });

      toast({
        title: 'Success',
        description: 'ICO reservation created successfully!',
      });

      // Reset form
      setAmount('');
      setPaymentMethod('');
      setPaymentAddress('');
      setTransactionHash('');
      setNotes('');
      
      onReservationCreated();
    } catch (error) {
      console.error('Error creating ICO reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create ICO reservation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWalletAddress = (method: string) => {
    const addresses = {
      ethereum: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      polygon: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      bsc: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      solana: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    };
    return addresses[method as keyof typeof addresses] || '';
  };

  const tokensToReceive = amount ? calculateTokens(parseFloat(amount)) : 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Reserve Your Tokens</CardTitle>
        <p className="text-sm text-gray-600">
          Reserve tokens in the upcoming ICO. Your reservation will be valid for 24 hours.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`$${icoConfig.min_investment} - $${icoConfig.max_investment}`}
              min={icoConfig.min_investment}
              max={icoConfig.max_investment}
              step="0.01"
            />
            <p className="text-sm text-gray-600">
              Min: ${icoConfig.min_investment} | Max: ${icoConfig.max_investment}
            </p>
          </div>

          {/* Tokens to Receive */}
          {amount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tokens to Receive:</span>
                <span className="text-xl font-bold text-blue-600">
                  {tokensToReceive.toLocaleString()} BSN
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Price: ${icoConfig.price_per_token} per token
              </p>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                <SelectItem value="polygon">Polygon (MATIC)</SelectItem>
                <SelectItem value="bsc">Binance Smart Chain (BNB)</SelectItem>
                <SelectItem value="solana">Solana (SOL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Address */}
          <div className="space-y-2">
            <Label htmlFor="payment-address">Your Payment Address</Label>
            <Input
              id="payment-address"
              value={paymentAddress}
              onChange={(e) => setPaymentAddress(e.target.value)}
              placeholder="Enter your wallet address"
            />
          </div>

          {/* Wallet Address to Send To */}
          {paymentMethod && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-sm font-medium">Send Payment To:</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={getWalletAddress(paymentMethod)}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(getWalletAddress(paymentMethod))}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Send exactly ${amount || '0'} worth of {paymentMethod.toUpperCase()} to this address
              </p>
            </div>
          )}

          {/* Transaction Hash */}
          <div className="space-y-2">
            <Label htmlFor="transaction-hash">Transaction Hash (Optional)</Label>
            <Input
              id="transaction-hash"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="0x..."
            />
            <p className="text-sm text-gray-600">
              Include your transaction hash to speed up confirmation
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Your reservation expires in 24 hours</li>
                <li>• Payment must be confirmed within 24 hours</li>
                <li>• No refunds for failed or expired reservations</li>
                <li>• Tokens will be distributed after ICO ends</li>
                <li>• Make sure to send the exact amount specified</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the terms and conditions and understand the risks involved
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !amount || !paymentMethod || !paymentAddress}
          >
            {isSubmitting ? 'Creating Reservation...' : 'Create Reservation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
