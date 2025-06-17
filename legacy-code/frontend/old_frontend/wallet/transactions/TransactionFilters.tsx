import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, ArrowUpDown, Search, RefreshCw } from "lucide-react";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAmount: string;
  setFilterAmount: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
  handleRefresh: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterAmount,
  setFilterAmount,
  sortDirection,
  setSortDirection,
  handleRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Suche nach Hash oder Adresse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 border-gray-200 focus:border-primary"
        />
      </div>
      
      <Select
        value={filterAmount}
        onValueChange={setFilterAmount}
      >
        <SelectTrigger className="w-[180px] border-gray-200">
          <Filter className="mr-2 h-4 w-4 text-gray-400" />
          <SelectValue placeholder="Filter nach Betrag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Beträge</SelectItem>
          <SelectItem value="small">&lt; 0.1 ETH</SelectItem>
          <SelectItem value="medium">0.1 - 1 ETH</SelectItem>
          <SelectItem value="large">&gt; 1 ETH</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
        className="border-gray-200 hover:bg-gray-50"
      >
        <ArrowUpDown className="mr-2 h-4 w-4 text-gray-400" />
        {sortDirection === "asc" ? "Neueste zuerst" : "Älteste zuerst"}
      </Button>

      <Button
        variant="outline"
        onClick={handleRefresh}
        className="w-[40px] p-0 border-gray-200 hover:bg-gray-50"
      >
        <RefreshCw className="h-4 w-4 text-gray-400" />
      </Button>
    </div>
  );
};