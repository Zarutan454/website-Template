
import { ethers } from 'ethers';

export interface Transaction {
  id: string;
  date: Date;
  type: 'send' | 'receive' | 'swap' | 'mine';
  amount: number;
  token_symbol: string;
  address: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface TransactionFilter {
  startDate?: Date;
  type?: 'all' | 'send' | 'receive' | 'swap' | 'mine';
  minValue?: number;
  maxValue?: number;
  tokenSymbol?: string;
}

const API_KEYS: Record<number, string> = {
  1: import.meta.env.VITE_ETHERSCAN_API_KEY || '',
  56: import.meta.env.VITE_BSCSCAN_API_KEY || '',
  137: import.meta.env.VITE_POLYGONSCAN_API_KEY || '',
  42161: import.meta.env.VITE_ARBISCAN_API_KEY || '',
  10: import.meta.env.VITE_OPTIMISM_API_KEY || '',
  11155111: import.meta.env.VITE_SEPOLIA_API_KEY || ''
};

const API_BASE_URLS: Record<number, string> = {
  1: 'https://api.etherscan.io/api',
  56: 'https://api.bscscan.com/api',
  137: 'https://api.polygonscan.com/api',
  42161: 'https://api.arbiscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  11155111: 'https://api-sepolia.etherscan.io/api'
};

export const getTransactionsFromEtherscan = async (
  address: string, 
  chainId: number, 
  filter?: TransactionFilter
): Promise<Transaction[]> => {
  try {
    
    if (!API_BASE_URLS[chainId]) {
      console.warn(`Network with chainId ${chainId} is not supported`);
      return [];
    }
    
    const apiKey = API_KEYS[chainId];
    if (!apiKey) {
      console.warn(`No API key found for chainId ${chainId}`);
      return [];
    }
    
    const apiUrl = API_BASE_URLS[chainId];
    
    const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== '1' || !data.result) {
      console.warn('No transactions found or API error:', data.message);
      return [];
    }
    
    interface EtherscanTransaction {
      hash: string;
      timeStamp: string;
      from: string;
      to: string;
      value: string;
      txreceipt_status: string;
    }
    
    const transactions: Transaction[] = data.result.map((tx: EtherscanTransaction) => {
      const isSend = tx.from.toLowerCase() === address.toLowerCase();
      
      return {
        id: tx.hash,
        date: new Date(Number(tx.timeStamp) * 1000),
        type: isSend ? 'send' : 'receive',
        amount: parseFloat(ethers.formatUnits(tx.value, 18)),
        token_symbol: 'ETH', // Standardmäßig ETH für normale Transaktionen
        address: isSend ? tx.to : tx.from,
        status: tx.txreceipt_status === '1' ? 'completed' : 'failed',
      };
    });
    
    const tokenUrl = `${apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    try {
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.status === '1' && tokenData.result) {
        const tokenTransactions: Transaction[] = tokenData.result.map((tx: any) => {
          const isSend = tx.from.toLowerCase() === address.toLowerCase();
          
          return {
            id: tx.hash,
            date: new Date(Number(tx.timeStamp) * 1000),
            type: isSend ? 'send' : 'receive',
            amount: parseFloat(ethers.formatUnits(tx.value, Number(tx.tokenDecimal) || 18)),
            token_symbol: tx.tokenSymbol || 'Unknown',
            address: isSend ? tx.to : tx.from,
            status: tx.txreceipt_status === '1' ? 'completed' : 'failed',
          };
        });
        
        transactions.push(...tokenTransactions);
      }
    } catch (tokenError) {
      console.warn('Error fetching token transactions:', tokenError);
    }
    
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let filteredTransactions = transactions;
    
    if (filter) {
      // Nach Startdatum filtern
      if (filter.startDate) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.date >= filter.startDate!
        );
      }
      
      // Nach Transaktionstyp filtern
      if (filter.type && filter.type !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.type === filter.type
        );
      }
      
      // Nach Mindestwert filtern
      if (filter.minValue !== undefined) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.amount >= filter.minValue!
        );
      }
      
      // Nach Höchstwert filtern
      if (filter.maxValue !== undefined) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.amount <= filter.maxValue!
        );
      }
      
      // Nach Token-Symbol filtern
      if (filter.tokenSymbol) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.token_symbol.toLowerCase() === filter.tokenSymbol!.toLowerCase()
        );
      }
    }
    
    return filteredTransactions;
  } catch (error) {
    console.error('Error fetching transactions from Etherscan:', error);
    return [];
  }
};
