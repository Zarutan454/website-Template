import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { apiClient } from "@/lib/django-api-new";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from '@/hooks/useAuth';

export interface Transaction {
  id: string;
  type: string;
  date: Date;
  address: string;
  amount: string;
  token_symbol: string;
  status: string;
}

interface TransactionFilter {
  type?: string;
  timeRange?: string;
  token?: string;
}

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>({
    type: 'all',
    timeRange: 'all'
  });
  const { user: profile } = useAuth();
  const { address } = useWallet();

  const updateFilter = (newFilter: Partial<TransactionFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const refreshTransactions = async () => {
    if (!profile?.id) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params: Record<string, string> = {};
      
      if (filter.type && filter.type !== 'all') {
        params.type = filter.type;
      }
      
      if (filter.token && filter.token !== 'all') {
        params.token = filter.token;
      }
      
      if (filter.timeRange && filter.timeRange !== 'all') {
        params.time_range = filter.timeRange;
      }
      
      // Fetch transactions from Django API
      const data = await apiClient.get<Transaction[]>('/transactions/', params);
      
      let onChainTransactions: Transaction[] = [];
      
      if (address) {
        try {
          const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
          if (etherscanApiKey) {
            const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`;
            
            const response = await fetch(etherscanUrl);
            const etherscanData = await response.json();
            
            if (etherscanData.status === '1' && etherscanData.result) {
              interface EtherscanTransaction {
                hash: string;
                from: string;
                to: string;
                timeStamp: string;
                value: string;
                txreceipt_status: string;
              }
              onChainTransactions = etherscanData.result.map((tx: EtherscanTransaction) => ({
                id: tx.hash,
                type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
                date: new Date(Number(tx.timeStamp) * 1000),
                address: tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from,
                amount: ethers.formatUnits(tx.value, 18),
                token_symbol: 'ETH',
                status: tx.txreceipt_status === '1' ? 'completed' : 'failed'
              }));
              
              if (filter.type && filter.type !== 'all') {
                onChainTransactions = onChainTransactions.filter(tx => tx.type === filter.type);
              }
              
              if (filter.token && filter.token !== 'all') {
                onChainTransactions = onChainTransactions.filter(tx => tx.token_symbol === filter.token);
              }
              
              if (filter.timeRange && filter.timeRange !== 'all') {
                const now = new Date();
                const startDate = new Date();
                
                switch (filter.timeRange) {
                  case 'day':
                    startDate.setDate(now.getDate() - 1);
                    break;
                  case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                  case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                  case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                }
                
                onChainTransactions = onChainTransactions.filter(tx => tx.date >= startDate);
              }
            }
          }
        } catch (etherscanError) {
          console.error('Error fetching on-chain transactions:', etherscanError);
        }
      }
      
      const allTransactions = [...(data || []), ...onChainTransactions];
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshTransactions();
  }, [profile?.id, address, filter]);

  return {
    transactions,
    isLoading,
    error,
    filter,
    updateFilter,
    refreshTransactions
  };
};
