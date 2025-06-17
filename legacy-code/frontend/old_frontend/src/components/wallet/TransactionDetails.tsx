
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Banknote, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatNumber, formatAddress, formatBalance } from '@/wallet/utils/formatters';

interface TransactionDetailsProps {
  transaction: {
    id: string;
    hash: string;
    type: string;
    status: string;
    amount: number;
    token_symbol: string;
    from_address: string;
    to_address: string;
    timestamp: Date | string;
    gas_fee?: number;
    gas_price?: number;
    network: string;
    block_number?: number;
    error_message?: string;
  };
  onClose?: () => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction, onClose }) => {
  const isIncoming = transaction.type === 'receive' || transaction.type === 'deposit';
  
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Banknote className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusText = () => {
    switch (transaction.status) {
      case 'completed':
      case 'success':
        return 'Erfolgreich';
      case 'pending':
        return 'Ausstehend';
      case 'failed':
      case 'error':
        return 'Fehlgeschlagen';
      default:
        return transaction.status;
    }
  };
  
  const getTypeText = () => {
    switch (transaction.type) {
      case 'send':
        return 'Gesendet';
      case 'receive':
        return 'Empfangen';
      case 'swap':
        return 'Getauscht';
      case 'deposit':
        return 'Einzahlung';
      case 'withdraw':
        return 'Auszahlung';
      default:
        return transaction.type;
    }
  };
  
  const getNetworkExplorerLink = () => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
      bsc: 'https://bscscan.com/tx/',
      solana: 'https://solscan.io/tx/'
    };
    
    const baseUrl = explorers[transaction.network.toLowerCase()] || '#';
    return `${baseUrl}${transaction.hash}`;
  };
  
  return (
    <Card className="bg-dark-100 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isIncoming ? (
            <ArrowDownLeft className="h-5 w-5 text-green-500" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-primary" />
          )}
          {getTypeText()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Status</span>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Betrag</span>
            <span className="font-medium">{formatBalance(transaction.amount, transaction.token_symbol)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Von</span>
            <span className="font-mono text-sm">{formatAddress(transaction.from_address)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">An</span>
            <span className="font-mono text-sm">{formatAddress(transaction.to_address)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Netzwerk</span>
            <span>{transaction.network}</span>
          </div>
          
          {transaction.gas_fee !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Gas-Gebühr</span>
              <span>{formatNumber(transaction.gas_fee)} {transaction.network === 'Ethereum' ? 'ETH' : 'Gas'}</span>
            </div>
          )}
          
          {transaction.block_number !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Block</span>
              <span>#{transaction.block_number}</span>
            </div>
          )}
          
          {transaction.error_message && (
            <div className="bg-red-900/20 border border-red-900 rounded-md p-3 mt-3">
              <div className="text-sm text-gray-400 mb-1">Fehlermeldung:</div>
              <div className="text-sm text-red-400">{transaction.error_message}</div>
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t border-gray-800">
          <a 
            href={getNetworkExplorerLink()}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-400 text-sm flex items-center gap-1"
          >
            <ArrowUpRight className="h-3 w-3" />
            <span>Im Blockchain Explorer anzeigen</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionDetails;
