import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { ExternalLink, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface TransactionRowProps {
  transaction: {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
  };
  status: string;
  formatDate: (timestamp: number) => string;
  shortenAddress: (address: string) => string;
  getExplorerUrl: (hash: string) => string;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  status,
  formatDate,
  shortenAddress,
  getExplorerUrl,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className={`capitalize ${
            status === 'success' ? 'text-green-500' :
            status === 'failed' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            {status}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{formatDate(transaction.timestamp)}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Von:</span>
            <span className="text-gray-600 font-medium">{shortenAddress(transaction.from)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">An:</span>
            <span className="text-gray-600 font-medium">{shortenAddress(transaction.to)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium text-gray-900">
          {Number(transaction.value).toFixed(6)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <a
          href={getExplorerUrl(transaction.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
        >
          <span className="text-sm">Details</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </TableCell>
    </TableRow>
  );
};