
import React from 'react';
import { useTokenLocking } from '@/hooks/useTokenLocking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ethers } from 'ethers';
import type { TokenLock } from '@/types/token';

const lockSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  duration: z.number().min(1, 'Duration must be at least 1 day'),
  beneficiary: z.string().refine(
    (address) => ethers.isAddress(address),
    'Invalid ethereum address'
  ),
});

type LockFormData = z.infer<typeof lockSchema>;

interface TokenLockSystemProps {
  tokenAddress: string;
  chainId: number;
}

export const TokenLockSystem = ({ tokenAddress, chainId }: TokenLockSystemProps) => {
  const { createLock, isLoading, activeLocks } = useTokenLocking(tokenAddress, chainId);

  const form = useForm<LockFormData>({
    resolver: zodResolver(lockSchema),
    defaultValues: {
      amount: '',
      duration: 30,
      beneficiary: '',
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (data: LockFormData) => {
    try {
      await createLock({
        amount: data.amount,
        duration: data.duration,
        beneficiary: data.beneficiary
      });
      form.reset();
    } catch (error) {
      console.error('Lock creation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Lock</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                {...form.register('amount')}
                placeholder="Enter amount to lock"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (days)</label>
              <Input
                {...form.register('duration', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="Lock duration in days"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beneficiary Address</label>
              <Input
                {...form.register('beneficiary')}
                placeholder="0x..."
              />
              {form.formState.errors.beneficiary && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.beneficiary.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Lock...' : 'Create Lock'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Locks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(activeLocks as TokenLock[]).map((lock) => (
              <Card key={lock.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>{ethers.formatEther(lock.amount)} Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Unlocks:</span>
                    <span>
                      {new Date(lock.unlockTime * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Beneficiary:</span>
                    <span className="truncate max-w-[200px]">
                      {lock.beneficiary}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            {(activeLocks as TokenLock[]).length === 0 && (
              <p className="text-center text-muted-foreground">
                No active locks found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
