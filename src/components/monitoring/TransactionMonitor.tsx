import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Transaction {
  id: string;
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

interface TransactionMonitorProps {
  tokenId?: string;
  walletAddress?: string;
}

const TransactionMonitor: React.FC<TransactionMonitorProps> = ({ tokenId, walletAddress }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const query = supabase
        .from('transactions')
        .select('*');
    
      // Apply filters based on available parameters
      if (tokenId) {
        const { data, error } = await query.eq('token_id', tokenId);
        
        if (error) throw error;
        setTransactions(data || []);
      } else if (walletAddress) {
        const { data, error } = await query.eq('sender_address', walletAddress);
        
        if (error) throw error;
        setTransactions(data || []);
      } else {
        const { data, error } = await query.limit(10);
        
        if (error) throw error;
        setTransactions(data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenId || walletAddress) {
      fetchTransactions();
    }
  }, [tokenId, walletAddress, fetchTransactions]);

  const getStatusBadge = (status: 'pending' | 'completed' | 'failed' | string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="success">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div>No transactions found.</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold">
                    {tx.transaction_type}
                  </div>
                  {getStatusBadge(tx.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Hash: {tx.transaction_hash.substring(0, 6)}...{tx.transaction_hash.substring(tx.transaction_hash.length - 6)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Timestamp: {tx.timestamp}
                </div>
                <div className="flex justify-end mt-2">
                  <a
                    href={`https://etherscan.io/tx/${tx.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center"
                  >
                    View on Explorer
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionMonitor;
