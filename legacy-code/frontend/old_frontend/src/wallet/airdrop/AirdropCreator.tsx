import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

interface FormData {
  tokenAddress: string;
  amount: string;
  addresses: string;
  network: string;
  name: string;
  description: string;
}

const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default function AirdropCreator() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Parse recipient addresses
      const recipients = data.addresses
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && isValidAddress(line));

      if (recipients.length === 0) {
        toast.error('No valid recipient addresses found');
        setIsSubmitting(false);
        return;
      }

      // Create airdrop record
      const { data: airdropData, error: airdropError } = await supabase
        .from('airdrops')
        .insert({
          token_address: data.tokenAddress,
          token_amount: data.amount,
          recipients_count: recipients.length,
          status: 'pending',
          network: data.network,
          name: data.name,
          description: data.description,
          created_by: profile?.id
        })
        .select()
        .single();

      if (airdropError) {
        throw new Error(airdropError.message);
      }

      // Create individual recipient records
      const recipientRecords = recipients.map(address => ({
        airdrop_id: airdropData.id,
        recipient_address: address,
        amount: parseFloat(data.amount) / recipients.length,
        status: 'pending'
      }));

      const { error: recipientsError } = await supabase
        .from('airdrop_recipients')
        .insert(recipientRecords);

      if (recipientsError) {
        throw new Error(recipientsError.message);
      }

      toast.success('Airdrop created successfully');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create airdrop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Airdrop</CardTitle>
        <CardDescription>
          Distribute tokens to multiple recipients in a single transaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              type="text"
              placeholder="0x..."
              {...register('tokenAddress', { required: 'Token address is required' })}
            />
            {errors.tokenAddress && (
              <p className="text-red-500 text-sm">{errors.tokenAddress.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="amount">Amount per Recipient</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              {...register('amount', { required: 'Amount is required' })}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="addresses">Recipient Addresses (one per line)</Label>
            <Textarea
              id="addresses"
              placeholder="0x..."
              {...register('addresses', { required: 'Recipient addresses are required' })}
            />
            {errors.addresses && (
              <p className="text-red-500 text-sm">{errors.addresses.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="network">Network</Label>
            <Input
              id="network"
              type="text"
              placeholder="ethereum"
              {...register('network', { required: 'Network is required' })}
            />
            {errors.network && (
              <p className="text-red-500 text-sm">{errors.network.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="name">Airdrop Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Summer Airdrop"
              {...register('name', { required: 'Airdrop name is required' })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Airdrop for early supporters"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Airdrop'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
