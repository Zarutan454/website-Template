
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  RefreshCwIcon, 
  SearchIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Verwende einen Typ für Transaction aus dem Hook
type Transaction = {
  id: string;
  address: string;
  amount: string; // Geändert von number zu string, um mit dem Hook kompatibel zu sein
  date: Date;
  status: string;
  token_symbol: string;
  type: string;
};

export const TransactionHistoryView: React.FC = () => {
  const { 
    transactions, 
    isLoading, 
    error, 
    filter, 
    updateFilter, 
    refreshTransactions 
  } = useTransactionHistory();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filtere Transaktionen basierend auf dem Suchbegriff
  const filteredTransactions = transactions.filter(tx => 
    tx.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.token_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'swap':
        return <RefreshCwIcon className="h-4 w-4 text-blue-500" />;
      case 'mine':
        return <span className="inline-block h-4 w-4 bg-amber-400 rounded-full"></span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Abgeschlossen</Badge>;
      case 'pending':
        return <Badge variant="outline">Ausstehend</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Anzeigen des Ladens der Transaktionen
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaktionshistorie</span>
            <Skeleton className="h-9 w-9 rounded-md" />
          </CardTitle>
          <CardDescription>Deine letzten Transaktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Anzeigen von Fehlern
  if (error) {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <CardTitle className="text-red-500">Fehler beim Laden der Transaktionen</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshTransactions} variant="outline">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaktionshistorie</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={refreshTransactions} 
            title="Aktualisieren"
          >
            <RefreshCwIcon className="h-5 w-5" />
          </Button>
        </CardTitle>
        <CardDescription>Deine letzten Transaktionen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filteroptionen */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Adressen, Tokens..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={filter.type || 'all'}
                onValueChange={(value: string) => updateFilter({ type: value })}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Transaktionstyp</SelectLabel>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="send">Gesendet</SelectItem>
                    <SelectItem value="receive">Empfangen</SelectItem>
                    <SelectItem value="swap">Getauscht</SelectItem>
                    <SelectItem value="mine">Mining</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Select
                value={filter.timeRange || 'all'}
                onValueChange={(value: string) => updateFilter({ timeRange: value })}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Zeitraum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Zeitraum</SelectLabel>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="day">Letzter Tag</SelectItem>
                    <SelectItem value="week">Letzte Woche</SelectItem>
                    <SelectItem value="month">Letzter Monat</SelectItem>
                    <SelectItem value="year">Letztes Jahr</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Keine Transaktionen gefunden */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Keine Transaktionen gefunden</p>
              <Button 
                variant="outline" 
                onClick={refreshTransactions}
                className="mx-auto"
              >
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Aktualisieren
              </Button>
            </div>
          )}

          {/* Transaktionsliste */}
          {filteredTransactions.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="flex items-center gap-2">
                        {getTransactionIcon(tx.type)}
                        <span className="capitalize">{tx.type}</span>
                      </TableCell>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]" title={tx.address}>
                        {tx.address}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={tx.type === 'send' ? 'text-red-500' : tx.type === 'receive' || tx.type === 'mine' ? 'text-green-500' : ''}>
                          {tx.type === 'send' ? '-' : tx.type === 'receive' || tx.type === 'mine' ? '+' : ''}{tx.amount} {tx.token_symbol}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <a 
                            href={`https://etherscan.io/tx/${tx.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Auf Etherscan anzeigen"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
