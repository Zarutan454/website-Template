
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Clock, Filter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/utils/formatters';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/addressUtils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';

type TransactionType = 'send' | 'receive' | 'swap' | 'mining';

interface WalletTransaction {
  id: string;
  amount: string | number;
  token_symbol: string;
  status: 'confirmed' | 'pending' | 'failed';
  date: string | Date;
  from?: string;
  to?: string;
  hash: string;
  description?: string;
  network?: string;
  user_address?: string;
}

export const TransactionList: React.FC = () => {
  const { transactions, transactionsLoading } = useWallet();
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'mining':
        return <span className="text-yellow-500">⛏️</span>;
      case 'swap':
        return <span className="text-blue-500">↔️</span>;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTransactionTitle = (type: string, amount: string, symbol: string) => {
    switch (type) {
      case 'send':
        return `${amount} ${symbol} gesendet`;
      case 'receive':
        return `${amount} ${symbol} erhalten`;
      case 'mining':
        return `${amount} ${symbol} gemint`;
      case 'swap':
        return `${amount} getauscht`;
      default:
        return `${amount} ${symbol}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Transaktionen</CardTitle>
          <CardDescription>Deine letzten Wallet-Aktivitäten</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
      </CardHeader>
      <CardContent>
        {transactionsLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" text="Transaktionen werden geladen..." />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Keine Transaktionen gefunden"
            description="Transaktionen werden hier angezeigt, sobald du welche durchführst."
            icon={<Clock className="h-10 w-10" />}
            action={
              <Button variant="outline" size="sm" className="mt-2">
                Token senden
              </Button>
            }
            className="bg-transparent border-gray-800 py-8"
          />
        ) : (
          <div className="space-y-4">
            {transactions.map((tx: any) => {
              let type: TransactionType = 'receive';
              
              if (tx.description && tx.description.toLowerCase().includes('mining')) {
                type = 'mining';
              } else if (tx.description && tx.description.toLowerCase().includes('swap')) {
                type = 'swap';
              } else if (tx.from && tx.to) {
                const isCurrentUserSender = tx.from === tx.user_address;
                type = isCurrentUserSender ? 'send' : 'receive';
              }
              
              return (
                <div 
                  key={tx.id} 
                  className="flex items-start space-x-3 p-4 bg-dark-200 rounded-lg hover:bg-dark-300 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    type === 'send' ? 'bg-red-500/10' : 
                    type === 'receive' ? 'bg-green-500/10' : 
                    type === 'mining' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }`}>
                    {getTransactionIcon(type)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {tx.description || getTransactionTitle(
                          type,
                          String(tx.amount || '0'),
                          tx.token_symbol || 'ETH'
                        )}
                      </div>
                      <div className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        type === 'send' ? 'bg-red-500/10 text-red-400' : 
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {type === 'send' ? '-' : '+'}{tx.amount} {tx.token_symbol?.split(' ')[0] || 'ETH'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(new Date(tx.date))}
                      </div>
                      <StatusBadge 
                        status={
                          tx.status === 'failed' ? 'error' : 
                          tx.status === 'pending' ? 'warning' : 'success'
                        } 
                        text={
                          tx.status === 'failed' ? 'Fehlgeschlagen' : 
                          tx.status === 'pending' ? 'Ausstehend' : 'Bestätigt'
                        }
                      />
                    </div>
                    
                    {(tx.from || tx.to) && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {type === 'send' ? 'An:' : 'Von:'} {truncateAddress(type === 'send' ? tx.to : tx.from)}
                      </div>
                    )}
                    
                    {tx.hash && (
                      <div className="mt-2 text-xs">
                        <a 
                          href={`https://${tx.network === 'ethereum' ? '' : tx.network + '.'}etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Transaktion anzeigen
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Alle Transaktionen anzeigen
        </Button>
      </CardContent>
    </Card>
  );
};
