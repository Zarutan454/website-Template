
import React from 'react';
import { NFTTransaction } from '@/types/nft';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface NFTTransactionHistoryProps {
  transactions: NFTTransaction[];
}

const NFTTransactionHistory: React.FC<NFTTransactionHistoryProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-dark-200 border border-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Keine Transaktionen vorhanden</p>
      </div>
    );
  }

  const getExplorerUrl = (network: string, txHash: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      case 'bnb':
      case 'binance':
        return `https://bscscan.com/tx/${txHash}`;
      default:
        return `https://etherscan.io/tx/${txHash}`;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'mint':
        return 'Erstellt';
      case 'transfer':
        return 'Übertragen';
      case 'sale':
        return 'Verkauft';
      case 'auction':
        return 'Versteigert';
      case 'offer':
        return 'Angebot';
      default:
        return type;
    }
  };

  return (
    <div className="bg-dark-200 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-300">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Typ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Von</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">An</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Preis</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Datum</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map((tx, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-dark-300/50' : ''}>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {getTransactionTypeText(tx.transactionType)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {tx.fromName || tx.fromAddress.substring(0, 6) + '...' + tx.fromAddress.substring(tx.fromAddress.length - 4)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {tx.toName || tx.toAddress.substring(0, 6) + '...' + tx.toAddress.substring(tx.toAddress.length - 4)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {tx.price ? `${tx.price} ${tx.currency}` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {format(new Date(tx.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(getExplorerUrl(tx.network, tx.transactionHash), '_blank')}
                  >
                    <ExternalLink size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NFTTransactionHistory;
