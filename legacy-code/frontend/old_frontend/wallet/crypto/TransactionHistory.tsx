
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number | null;
}

export const TransactionHistory = () => {
  const { address } = useAccount();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', address],
    queryFn: async () => {
      if (!address) return [];
      // Fetch transactions from Etherscan API
      try {
        const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.VITE_ETHERSCAN_API_KEY}`);
        const data = await response.json();
        return data.result?.slice(0, 10) || [];
      } catch (error) {
        console.error("Fehler beim Abrufen der Transaktionen:", error);
        return [];
      }
    },
    enabled: !!address
  });

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unbekannt';
    
    try {
      return format(new Date(timestamp * 1000), 'dd.MM.yyyy HH:mm', { locale: de });
    } catch (error) {
      console.error('Fehler beim Formatieren des Datums:', error);
      return 'Ungültiges Datum';
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (hash: string) => {
    return `https://etherscan.io/tx/${hash}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card className="p-6 mb-8">
        <div className="text-center text-muted-foreground">
          Bitte verbinden Sie Ihre Wallet, um Transaktionen zu sehen.
        </div>
      </Card>
    );
  }

  // Wenn keine Transaktionen vorhanden sind
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Transaktionsverlauf</h2>
        <div className="text-center text-muted-foreground py-8">
          Keine Transaktionen gefunden
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Transaktionsverlauf</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Datum</th>
              <th className="text-left py-3 px-4">Von/An</th>
              <th className="text-right py-3 px-4">Betrag (ETH)</th>
              <th className="text-right py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx: Transaction) => (
              <tr key={tx.hash} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <Badge variant="secondary">Erfolgreich</Badge>
                </td>
                <td className="py-3 px-4">{formatDate(tx.timestamp)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Von:</span>
                      <span className="font-medium">{shortenAddress(tx.from)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">An:</span>
                      <span className="font-medium">{shortenAddress(tx.to)}</span>
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-4">
                  {formatNumber(Number(tx.value) / 1e18)}
                </td>
                <td className="text-right py-3 px-4">
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Anzeigen
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
