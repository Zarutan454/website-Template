
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransactionRecord {
  token_id: string;
  transaction_hash: string;
  transaction_type: 'deployment' | 'mint' | 'burn' | 'transfer' | 'verification' | 'liquidity_lock';
  status: 'pending' | 'completed' | 'failed';
  network: string;
}

export const trackTransaction = async (transaction: TransactionRecord) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert(transaction);

    if (error) throw error;

    console.log('Transaction tracked:', transaction);
  } catch (error) {
    console.error('Error tracking transaction:', error);
    toast.error("Fehler beim Tracking", {
      description: "Die Transaktion konnte nicht gespeichert werden"
    });
  }
};

export const updateTransactionStatus = async (
  transactionHash: string,
  status: 'completed' | 'failed',
  error?: string
) => {
  try {
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_hash', transactionHash);

    if (updateError) throw updateError;

    if (status === 'failed' && error) {
      toast.error("Transaktion fehlgeschlagen", {
        description: error
      });
    } else if (status === 'completed') {
      toast.success("Transaktion erfolgreich", {
        description: "Die Transaktion wurde erfolgreich ausgeführt"
      });
    }
  } catch (error) {
    console.error('Error updating transaction status:', error);
  }
};
