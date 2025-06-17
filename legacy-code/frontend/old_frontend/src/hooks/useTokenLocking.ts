
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface TokenLock {
  id: string;
  token_id: string;
  amount: number;
  unlock_date: Date;
  lock_date: Date;
  lock_owner: string;
  transaction_hash?: string;
  network: string;
}

export interface LiquidityLock extends Omit<TokenLock, 'pair_address'> {
  pair_address: string;
}

export interface TokenLockParams {
  token_id: string;
  amount: string;
  unlock_date: Date;
  lock_owner: string;
  network: string;
}

export interface LiquidityLockParams extends TokenLockParams {
  pair_address: string;
}

/**
 * Hook for managing token and liquidity locks
 * @returns Functions and state for token locking
 */
export const useTokenLocking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenLockRecord, setTokenLockRecord] = useState<TokenLock | null>(null);
  const [liquidityLockRecord, setLiquidityLockRecord] = useState<LiquidityLock | null>(null);
  
  /**
   * Creates a token lock
   * @param lockParams Parameters for the token lock
   * @returns Boolean indicating success
   */
  const lockToken = async (lockParams: TokenLockParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate parameters
      if (!lockParams.token_id || !lockParams.amount || !lockParams.unlock_date || !lockParams.lock_owner || !lockParams.network) {
        throw new Error('Missing required parameters');
      }
      
      // Convert amount to number
      const amount = parseFloat(lockParams.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Convert unlock_date to ISO string
      const unlockDate = new Date(lockParams.unlock_date).toISOString();
      
      // Get the network from the token
      const { data, error: tokenError } = await supabase
        .from('tokens')
        .select('network')
        .eq('id', lockParams.token_id)
        .single();
      
      if (tokenError || !data) {
        throw new Error('Token not found');
      }
      
      const network = data.network as string;
      
      // Insert lock record into database
      const { data: lockData, error: lockError } = await supabase
        .from('token_locks')
        .insert({
          token_id: lockParams.token_id,
          amount: amount,
          unlock_date: unlockDate,
          lock_owner: lockParams.lock_owner,
          lock_date: new Date().toISOString(),
          network: network
        })
        .select()
        .single();
      
      if (lockError) {
        throw lockError;
      }
      
      setTokenLockRecord(lockData as TokenLock);
      toast.success('Token lock created successfully!');
      return true;
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lock tokens';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Creates a liquidity token lock
   * @param lockParams Parameters for the liquidity lock
   * @returns Boolean indicating success
   */
  const lockLiquidity = async (lockParams: LiquidityLockParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate parameters
      if (!lockParams.token_id || !lockParams.pair_address || !lockParams.amount || !lockParams.unlock_date || !lockParams.lock_owner || !lockParams.network) {
        throw new Error('Missing required parameters');
      }
      
      // Convert amount to number
      const amount = parseFloat(lockParams.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Convert unlock_date to ISO string
      const unlockDate = new Date(lockParams.unlock_date).toISOString();
      
      // Get the network from the token
      const { data, error: tokenError } = await supabase
        .from('tokens')
        .select('network')
        .eq('id', lockParams.token_id)
        .single();
      
      if (tokenError || !data) {
        throw new Error('Token not found');
      }
      
      const network = data.network as string;
      
      // Insert lock record into database
      const { data: lockData, error: lockError } = await supabase
        .from('lp_token_locks')
        .insert({
          token_id: lockParams.token_id,
          pair_address: lockParams.pair_address,
          amount: amount,
          unlock_date: unlockDate,
          lock_owner: lockParams.lock_owner,
          lock_date: new Date().toISOString(),
          network: network
        })
        .select()
        .single();
      
      if (lockError) {
        throw lockError;
      }
      
      setLiquidityLockRecord(lockData as unknown as LiquidityLock);
      toast.success('Liquidity lock created successfully!');
      return true;
    } catch (err: any) {
      console.error('Error locking liquidity:', err);
      setError(err.message || 'Failed to lock liquidity');
      toast.error(err.message || 'Failed to lock liquidity');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Fetches token locks for a specific token
   * @param tokenId The token ID to fetch locks for
   * @returns Array of token locks
   */
  const fetchTokenLocks = async (tokenId: string): Promise<TokenLock[]> => {
    try {
      const { data, error } = await supabase
        .from('token_locks')
        .select('*')
        .eq('token_id', tokenId);
      
      if (error) throw error;
      return data as TokenLock[];
    } catch (err: any) {
      console.error('Error fetching token locks:', err);
      setError(err.message || 'Failed to fetch token locks');
      return [];
    }
  };
  
  /**
   * Fetches liquidity locks for a specific token
   * @param tokenId The token ID to fetch locks for
   * @returns Array of liquidity locks
   */
  const fetchLiquidityLocks = async (tokenId: string): Promise<LiquidityLock[]> => {
    try {
      const { data, error } = await supabase
        .from('lp_token_locks')
        .select('*')
        .eq('token_id', tokenId);
      
      if (error) throw error;
      return data as unknown as LiquidityLock[];
    } catch (err: any) {
      console.error('Error fetching liquidity locks:', err);
      setError(err.message || 'Failed to fetch liquidity locks');
      return [];
    }
  };
  
  return {
    isLoading,
    error,
    lockToken,
    lockLiquidity,
    fetchTokenLocks,
    fetchLiquidityLocks,
    tokenLockRecord,
    liquidityLockRecord
  };
};
