import { supabase } from '@/lib/supabase';

interface Transaction {
  id?: string;
  token_id: string;
  transaction_hash: string;
  transaction_type: 'deployment' | 'transfer' | 'mint' | 'burn' | 'approval';
  status: 'pending' | 'completed' | 'failed';
  network: string;
  sender_address?: string;
  recipient_address?: string;
  amount?: string;
  gas_used?: number;
  gas_price?: string;
  timestamp?: string;
}

export async function trackTransaction(tx: Transaction) {
  try {
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...tx,
        timestamp: timestamp
      })
      .select();
    
    if (error) {
      console.error('Error tracking transaction:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking transaction:', error);
    return false;
  }
}

export async function updateTransactionStatus(
  txHash: string,
  status: 'pending' | 'completed' | 'failed',
  gasUsed?: number,
  gasPrice?: string
) {
  try {
    const updates: Partial<Transaction> = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (gasUsed) updates.gas_used = gasUsed;
    if (gasPrice) updates.gas_price = gasPrice;
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('transaction_hash', txHash)
      .select();
    
    if (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
}

export async function getTransactionsByToken(tokenId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('token_id', tokenId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getTransactionByHash(txHash: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_hash', txHash)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

export async function createTransactionRecord(transaction: Transaction) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        timestamp: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error creating transaction record:', error);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error creating transaction record:', error);
    return null;
  }
}
