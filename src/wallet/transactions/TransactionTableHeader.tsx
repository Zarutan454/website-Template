
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, ArrowRightLeft, Coins, ExternalLink } from "lucide-react";

export const TransactionTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="bg-gray-50 hover:bg-gray-50">
        <TableHead className="font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            Status
          </div>
        </TableHead>
        <TableHead className="font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            Zeitpunkt
          </div>
        </TableHead>
        <TableHead className="font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-gray-400" />
            Von/An
          </div>
        </TableHead>
        <TableHead className="font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-gray-400" />
            Betrag (ETH)
          </div>
        </TableHead>
        <TableHead className="font-semibold text-gray-600 text-right">
          <div className="flex items-center gap-2 justify-end">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            Details
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
